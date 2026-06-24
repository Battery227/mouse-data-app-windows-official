/**
 * V2 State Management Hook
 * 
 * CRITICAL: This hook manages the V2 data model. All components using this hook
 * MUST follow the V2 data structure documented in src/types/v2-data-model.js
 * 
 * V2 Data Structure Quick Reference:
 * - subject.subjectId (NOT subject.subject.identifier)
 * - subject.status = 'alive' | 'deceased' | 'removed' | 'transferred' (lowercase)
 * - subject.customFieldValues = { genotype: '...', ... } (NOT root properties)
 * - housingUnit (NOT cage)
 * 
 * @see src/types/v2-data-model.js for complete type definitions
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { idbGet, idbSet, getStorageInfo } from "./idb";
import { uid } from "../utils/ids";
import { BUILT_IN_TEMPLATES } from "../core/schema/builtInTemplates";
import { migrateV1ToV2, needsMigration, validateMigratedState, createMigrationBackup } from "./migration";
import { pushSnapshot } from "./backup";
import { SUBJECT_STATUS } from "../models/constants";

const STORAGE_KEY = "stateV2";

function nowIso() {
  return new Date().toISOString();
}

function defaultState() {
  const defaultTemplate = BUILT_IN_TEMPLATES[0];
  const experimentId = uid("exp");
  
  return {
    version: 2,
    lastSavedAt: null,
    lastModifiedAt: nowIso(),
    templates: [defaultTemplate],
    experiments: [{
      id: experimentId,
      templateId: defaultTemplate.id,
      name: "My First Experiment",
      description: "Default experiment",
      startDate: nowIso(),
      status: 'active',
      customFieldValues: {},
      createdAt: nowIso(),
      updatedAt: nowIso(),
      tags: []
    }],
    housingUnits: [],
    subjects: [],
    events: [],
    settings: {
      defaultTemplateId: defaultTemplate.id,
      theme: 'light',
      autoSave: true,
      autoSaveInterval: 350,
      backupEnabled: true,
      backupInterval: 7
    },
    userPreferences: {
      recentExperiments: [experimentId],
      favoriteTemplates: [defaultTemplate.id],
      customViews: []
    }
  };
}

export function useAppStateV2() {
  const [state, setState] = useState(null);
  const [saveStatus, setSaveStatus] = useState("loading");
  const [activeExperimentId, setActiveExperimentId] = useState(null);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const saveTimer = useRef(null);
  const isUndoRedoAction = useRef(false);
  const lastSnapshotRef = useRef(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const storageInfo = await getStorageInfo();
        console.log('📦 Storage initialized:', storageInfo);
        
        let loaded = await idbGet(STORAGE_KEY);
        
        if (!loaded) {
          const v1State = await idbGet("state");
          if (v1State && needsMigration(v1State)) {
            console.log('🔄 V1 data detected, migrating to V2...');
            const backup = createMigrationBackup(v1State);
            await idbSet("state_v1_backup", JSON.parse(backup));
            loaded = migrateV1ToV2(v1State);
            const validation = validateMigratedState(loaded);
            if (!validation.valid) {
              console.error('❌ Migration validation failed:', validation.errors);
            } else {
              console.log('✅ Migration successful');
            }
          }
        }
        
        if (!mounted) return;
        
        if (loaded && loaded.version === 2) {
          console.log('✅ Loaded V2 state');
          setState(loaded);
          setActiveExperimentId(loaded.experiments[0]?.id || null);
          setSaveStatus("saved");
        } else {
          console.log('🆕 Creating fresh V2 state');
          const fresh = defaultState();
          setState(fresh);
          setActiveExperimentId(fresh.experiments[0].id);
          const saveSuccess = await idbSet(STORAGE_KEY, fresh);
          setSaveStatus(saveSuccess ? "saved" : "error");
        }
      } catch (e) {
        console.error("❌ Storage error:", e);
        const fresh = defaultState();
        if (mounted) {
          setState(fresh);
          setActiveExperimentId(fresh.experiments[0].id);
          setSaveStatus("error");
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  const api = useMemo(() => {
    if (!state) return null;

    const touch = (s) => ({ ...s, lastModifiedAt: nowIso() });
    const updateState = (updater) => {
      setState(prev => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        const touched = touch(next);
        
        // Add to undo stack (unless this is an undo/redo action)
        if (!isUndoRedoAction.current && prev) {
          setUndoStack(stack => {
            const newStack = [...stack, prev];
            // Keep last 50 states
            if (newStack.length > 50) newStack.shift();
            return newStack;
          });
          // Clear redo stack when new action is performed
          setRedoStack([]);
        }
        
        return touched;
      });
    };

    // Experiment operations
    const addExperiment = (name, templateId, experimentConfig = null) => {
      const expId = uid("exp");
      updateState(prev => ({
        ...prev,
        experiments: [...prev.experiments, {
          id: expId,
          templateId: templateId || prev.settings.defaultTemplateId,
          name,
          description: experimentConfig?.description || '',
          config: experimentConfig?.config || {},
          schedule: experimentConfig?.schedule || [],
          startDate: nowIso(),
          status: 'active',
          customFieldValues: {},
          createdAt: experimentConfig?.createdAt || nowIso(),
          updatedAt: nowIso(),
          tags: []
        }]
      }));
      return expId;
    };

    const updateExperiment = (expId, patch) => {
      updateState(prev => ({
        ...prev,
        experiments: prev.experiments.map(e => 
          e.id === expId ? { ...e, ...patch, updatedAt: nowIso() } : e
        )
      }));
    };

    const deleteExperiment = (expId) => {
      updateState(prev => ({
        ...prev,
        experiments: prev.experiments.filter(e => e.id !== expId),
        housingUnits: prev.housingUnits.filter(h => h.experimentId !== expId),
        subjects: prev.subjects.filter(s => s.experimentId !== expId),
        events: prev.events.filter(ev => ev.experimentId !== expId)
      }));
    };

    // Cohort / group operations (stored in experiment.config.cohorts)
    const COHORT_COLORS = ['#1976d2', '#9c27b0', '#2e7d32', '#ed6c02', '#d32f2f', '#0288d1', '#7b1fa2', '#5d4037'];

    const updateActiveConfig = (configUpdater) => {
      updateState(prev => ({
        ...prev,
        experiments: prev.experiments.map(e =>
          e.id === activeExperimentId
            ? { ...e, config: configUpdater(e.config || {}), updatedAt: nowIso() }
            : e
        )
      }));
    };

    const addCohort = (name) => {
      const cohortId = uid('cohort');
      updateActiveConfig(config => {
        const cohorts = config.cohorts || [];
        const color = COHORT_COLORS[cohorts.length % COHORT_COLORS.length];
        return { ...config, cohorts: [...cohorts, { id: cohortId, name, color, description: '', groups: [] }] };
      });
      return cohortId;
    };

    const updateCohort = (cohortId, patch) => {
      updateActiveConfig(config => ({
        ...config,
        cohorts: (config.cohorts || []).map(c => c.id === cohortId ? { ...c, ...patch } : c)
      }));
    };

    const deleteCohort = (cohortId) => {
      updateState(prev => ({
        ...prev,
        experiments: prev.experiments.map(e =>
          e.id === activeExperimentId
            ? { ...e, config: { ...(e.config || {}), cohorts: ((e.config || {}).cohorts || []).filter(c => c.id !== cohortId) }, updatedAt: nowIso() }
            : e
        ),
        housingUnits: prev.housingUnits.map(h => h.cohortId === cohortId ? { ...h, cohortId: '', groupId: '' } : h),
        subjects: prev.subjects.map(s => s.cohortId === cohortId ? { ...s, cohortId: '', groupId: '' } : s)
      }));
    };

    const addGroup = (cohortId, name) => {
      const groupId = uid('group');
      updateActiveConfig(config => ({
        ...config,
        cohorts: (config.cohorts || []).map(c =>
          c.id === cohortId
            ? { ...c, groups: [...(c.groups || []), { id: groupId, name, description: '', timeline: [] }] }
            : c
        )
      }));
      return groupId;
    };

    const updateGroup = (cohortId, groupId, patch) => {
      updateActiveConfig(config => ({
        ...config,
        cohorts: (config.cohorts || []).map(c =>
          c.id === cohortId
            ? { ...c, groups: (c.groups || []).map(g => g.id === groupId ? { ...g, ...patch } : g) }
            : c
        )
      }));
    };

    const deleteGroup = (cohortId, groupId) => {
      updateState(prev => ({
        ...prev,
        experiments: prev.experiments.map(e =>
          e.id === activeExperimentId
            ? {
                ...e,
                config: {
                  ...(e.config || {}),
                  cohorts: ((e.config || {}).cohorts || []).map(c =>
                    c.id === cohortId ? { ...c, groups: (c.groups || []).filter(g => g.id !== groupId) } : c
                  )
                },
                updatedAt: nowIso()
              }
            : e
        ),
        housingUnits: prev.housingUnits.map(h => h.groupId === groupId ? { ...h, groupId: '' } : h),
        subjects: prev.subjects.map(s => s.groupId === groupId ? { ...s, groupId: '' } : s)
      }));
    };

    // Assign a whole housing unit (and all its current subjects) to a cohort/group.
    // Per-subject overrides afterward are still allowed via updateSubject.
    const assignHousingUnitCohort = (unitId, cohortId, groupId) => {
      updateState(prev => ({
        ...prev,
        housingUnits: prev.housingUnits.map(h =>
          h.id === unitId ? { ...h, cohortId: cohortId || '', groupId: groupId || '', updatedAt: nowIso() } : h
        ),
        subjects: prev.subjects.map(s =>
          s.housingUnitId === unitId
            ? { ...s, cohortId: cohortId || '', groupId: groupId || '', updatedAt: nowIso() }
            : s
        )
      }));
    };

    // Group timeline (scheduled events) editing — drives the per-subject Timeline + check-off
    const addGroupTimelineEvent = (cohortId, groupId, event) => {
      const id = uid('tl');
      const newEvent = {
        id,
        day: Number(event.day) || 0,
        category: event.category || 'test',
        name: event.name || '',
        description: event.description || ''
      };
      updateActiveConfig(config => ({
        ...config,
        cohorts: (config.cohorts || []).map(c =>
          c.id === cohortId
            ? { ...c, groups: (c.groups || []).map(g =>
                g.id === groupId ? { ...g, timeline: [...(g.timeline || []), newEvent] } : g) }
            : c
        )
      }));
      return id;
    };

    const updateGroupTimelineEvent = (cohortId, groupId, eventId, patch) => {
      updateActiveConfig(config => ({
        ...config,
        cohorts: (config.cohorts || []).map(c =>
          c.id === cohortId
            ? { ...c, groups: (c.groups || []).map(g =>
                g.id === groupId
                  ? { ...g, timeline: (g.timeline || []).map(t =>
                      t.id === eventId
                        ? { ...t, ...patch, day: patch.day !== undefined ? Number(patch.day) : t.day }
                        : t) }
                  : g) }
            : c
        )
      }));
    };

    const deleteGroupTimelineEvent = (cohortId, groupId, eventId) => {
      updateActiveConfig(config => ({
        ...config,
        cohorts: (config.cohorts || []).map(c =>
          c.id === cohortId
            ? { ...c, groups: (c.groups || []).map(g =>
                g.id === groupId ? { ...g, timeline: (g.timeline || []).filter(t => t.id !== eventId) } : g) }
            : c
        )
      }));
    };

    // Expand a day-range into repeated scheduled events in one action.
    const addRecurringGroupTimelineEvents = (cohortId, groupId, opts) => {
      const { name, category = 'test', description = '', startDay = 0, endDay = 0, everyNDays = 1 } = opts || {};
      const step = Math.max(1, Number(everyNDays) || 1);
      const from = Number(startDay) || 0;
      const to = Number(endDay);
      const last = Number.isFinite(to) ? to : from;
      const newEvents = [];
      for (let d = from; d <= last; d += step) {
        newEvents.push({ id: uid('tl'), day: d, category, name, description });
      }
      if (newEvents.length === 0) return 0;
      updateActiveConfig(config => ({
        ...config,
        cohorts: (config.cohorts || []).map(c =>
          c.id === cohortId
            ? { ...c, groups: (c.groups || []).map(g =>
                g.id === groupId ? { ...g, timeline: [...(g.timeline || []), ...newEvents] } : g) }
            : c
        )
      }));
      return newEvents.length;
    };

    // Housing unit operations
    const addHousingUnit = (name, experimentId) => {
      const unitId = uid("housing");
      updateState(prev => ({
        ...prev,
        housingUnits: [...prev.housingUnits, {
          id: unitId,
          experimentId: experimentId || activeExperimentId,
          name,
          capacity: 10,
          location: '',
          customFieldValues: {},
          createdAt: nowIso(),
          updatedAt: nowIso(),
          notes: ''
        }]
      }));
      return unitId;
    };

    const updateHousingUnit = (unitId, patch) => {
      updateState(prev => ({
        ...prev,
        housingUnits: prev.housingUnits.map(h =>
          h.id === unitId ? { ...h, ...patch, updatedAt: nowIso() } : h
        )
      }));
    };

    const deleteHousingUnit = (unitId) => {
      updateState(prev => {
        const subjectIds = prev.subjects.filter(s => s.housingUnitId === unitId).map(s => s.id);
        return {
          ...prev,
          housingUnits: prev.housingUnits.filter(h => h.id !== unitId),
          subjects: prev.subjects.filter(s => s.housingUnitId !== unitId),
          events: prev.events.filter(e => !subjectIds.includes(e.subjectId))
        };
      });
    };

    /**
     * Add a new subject to a housing unit
     * 
     * IMPORTANT: This creates a V2 subject with the following structure:
     * - subject.subjectId: string (human-readable identifier like "Subject-1")
     * - subject.status: 'alive' (lowercase, NOT 'ALIVE')
     * - subject.customFieldValues: {} (empty object, NOT root properties)
     * 
     * @param {string} housingUnitId - ID of the housing unit
     * @param {string} subjectId - Human-readable identifier (e.g., "Subject-1", "Mouse-A1")
     * @returns {string} The generated unique ID for the new subject
     * 
     * @example
     * const newId = api.addSubject(housingUnitId, "Subject-1");
     */
    // Subject operations
    const addSubject = (housingUnitId, subjectId) => {
      const id = uid("subject");
      const housingUnit = state.housingUnits.find(h => h.id === housingUnitId);
      updateState(prev => {
        const existingSubjects = prev.subjects.filter(s => s.housingUnitId === housingUnitId);
        // Find first available slot (fill gaps from deletions)
        const usedSlots = new Set(existingSubjects.map(s => s.slot || 0));
        let nextSlot = 1;
        while (usedSlots.has(nextSlot)) {
          nextSlot++;
        }
        return {
          ...prev,
          subjects: [...prev.subjects, {
            id,
            housingUnitId,
            experimentId: housingUnit?.experimentId || activeExperimentId,
            subjectId: subjectId || `Subject-${nextSlot}`,
            slot: nextSlot,
            status: 'alive',
            statusDate: nowIso(),
            startDate: nowIso(), // When this subject started in the experiment
            customFieldValues: {},
            cohortId: housingUnit?.cohortId || '', // inherit the cage's cohort/group
            groupId: housingUnit?.groupId || '',
            createdAt: nowIso(),
            updatedAt: nowIso(),
            notes: ''
          }]
        };
      });
      return id;
    };

    const updateSubject = (subjectId, patch) => {
      updateState(prev => ({
        ...prev,
        subjects: prev.subjects.map(s =>
          s.id === subjectId ? { ...s, ...patch, updatedAt: nowIso() } : s
        )
      }));
    };

    const updateSubjectFields = (subjectId, fields) => {
      updateState(prev => ({
        ...prev,
        subjects: prev.subjects.map(s =>
          s.id === subjectId ? { 
            ...s, 
            customFieldValues: { ...s.customFieldValues, ...fields },
            updatedAt: nowIso() 
          } : s
        )
      }));
    };

    // Explicit check-off of a scheduled timeline item, per subject.
    const setTimelineCompletion = (subjectId, itemId, done) => {
      updateState(prev => ({
        ...prev,
        subjects: prev.subjects.map(s => {
          if (s.id !== subjectId) return s;
          const completions = { ...(s.timelineCompletions || {}) };
          if (done) completions[itemId] = nowIso();
          else delete completions[itemId];
          return { ...s, timelineCompletions: completions, updatedAt: nowIso() };
        })
      }));
    };

    // Note / measurement attached to a scheduled timeline item (weight, trial times, etc.)
    const setTimelineNote = (subjectId, itemId, note) => {
      updateState(prev => ({
        ...prev,
        subjects: prev.subjects.map(s => {
          if (s.id !== subjectId) return s;
          const notes = { ...(s.timelineNotes || {}) };
          if (note && note.trim()) notes[itemId] = note;
          else delete notes[itemId];
          return { ...s, timelineNotes: notes, updatedAt: nowIso() };
        })
      }));
    };

    const deleteSubject = (subjectId) => {
      updateState(prev => ({
        ...prev,
        subjects: prev.subjects.filter(s => s.id !== subjectId),
        events: prev.events.filter(e => e.subjectId !== subjectId)
      }));
    };

    // Event operations
    const addEvent = (event) => {
      const id = uid("evt");
      const subject = state.subjects.find(s => s.id === event.subjectId);
      updateState(prev => ({
        ...prev,
        events: [...prev.events, {
          id,
          subjectId: event.subjectId,
          experimentId: subject?.experimentId || activeExperimentId,
          eventTypeId: event.eventTypeId || 'default',
          datetime: event.datetime || nowIso(),
          fieldValues: event.fieldValues || {},
          trials: event.trials || [],
          performedBy: event.performedBy || '',
          notes: event.notes || '',
          attachments: [],
          createdAt: nowIso(),
          updatedAt: nowIso()
        }]
      }));
      return id;
    };

    const updateEvent = (eventId, patch) => {
      updateState(prev => ({
        ...prev,
        events: prev.events.map(e =>
          e.id === eventId ? { ...e, ...patch, updatedAt: nowIso() } : e
        )
      }));
    };

    const deleteEvent = (eventId) => {
      updateState(prev => ({
        ...prev,
        events: prev.events.filter(e => e.id !== eventId)
      }));
    };

    // Export/Import
    const exportJson = () => {
      return { ...state, exportedAt: nowIso() };
    };

    const importJson = (payload) => {
      if (payload.version === 2) {
        updateState(payload);
      } else if (needsMigration(payload)) {
        const migrated = migrateV1ToV2(payload);
        updateState(migrated);
      }
    };

    return {
      state,
      setState: updateState,
      activeExperimentId,
      setActiveExperimentId,
      addExperiment,
      updateExperiment,
      deleteExperiment,
      addHousingUnit,
      updateHousingUnit,
      deleteHousingUnit,
      addCohort,
      updateCohort,
      deleteCohort,
      addGroup,
      updateGroup,
      deleteGroup,
      assignHousingUnitCohort,
      addGroupTimelineEvent,
      updateGroupTimelineEvent,
      deleteGroupTimelineEvent,
      addRecurringGroupTimelineEvents,
      addSubject,
      updateSubject,
      updateSubjectFields,
      deleteSubject,
      setTimelineCompletion,
      setTimelineNote,
      addEvent,
      updateEvent,
      deleteEvent,
      exportJson,
      importJson,
      // Undo/Redo operations
      undo: () => {
        if (undoStack.length > 0) {
          isUndoRedoAction.current = true;
          const previousState = undoStack[undoStack.length - 1];
          setRedoStack(stack => [...stack, state]);
          setUndoStack(stack => stack.slice(0, -1));
          setState(previousState);
          isUndoRedoAction.current = false;
        }
      },
      redo: () => {
        if (redoStack.length > 0) {
          isUndoRedoAction.current = true;
          const nextState = redoStack[redoStack.length - 1];
          setUndoStack(stack => [...stack, state]);
          setRedoStack(stack => stack.slice(0, -1));
          setState(nextState);
          isUndoRedoAction.current = false;
        }
      },
      canUndo: undoStack.length > 0,
      canRedo: redoStack.length > 0
    };
  }, [state, activeExperimentId]);

  // Auto-save
  useEffect(() => {
    if (!state) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus("saving");
    saveTimer.current = setTimeout(async () => {
      try {
        const toSave = { ...state, lastSavedAt: nowIso() };
        const saveSuccess = await idbSet(STORAGE_KEY, toSave);
        if (saveSuccess) {
          setState(toSave);
          setSaveStatus("saved");
          // Periodic automatic restore point (~every 10 min of activity)
          if (Date.now() - lastSnapshotRef.current > 10 * 60 * 1000) {
            lastSnapshotRef.current = Date.now();
            pushSnapshot(toSave);
          }
        } else {
          console.error("Storage write failed");
          setSaveStatus("error");
        }
      } catch (e) {
        console.error("Storage error:", e);
        setSaveStatus("error");
      }
    }, 350);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state?.lastModifiedAt]);

  return { state, api, saveStatus, activeExperimentId };
}

// Made with Bob
