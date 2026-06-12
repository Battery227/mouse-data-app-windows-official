import { useEffect, useMemo, useRef, useState } from "react";
import { idbGet, idbSet } from "./idb";
import { uid } from "../utils/ids";
import { COHORTS } from "../models/cohorts";

const STORAGE_KEY = "state";

function nowIso() {
  return new Date().toISOString();
}

function defaultState() {
  const firstCohort = COHORTS[0];
  const cageId = uid("cage");
  return {
    version: 1,
    lastSavedAt: null,
    lastModifiedAt: nowIso(),
    cohorts: COHORTS.map(c => ({ id: c.id, name: c.name })), // display only; templates in code
    cages: [
      {
        id: cageId,
        name: "Cage 1",
        cohortId: firstCohort.id,
        groupId: firstCohort.groups[0].id,
        drug: "",
        notes: "",
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
    ],
    mice: [], // Start with empty mice array - users add subjects as needed
    events: [],
  };
}

function mergeById(existingArr, incomingArr) {
  const map = new Map(existingArr.map(x => [x.id, x]));
  for (const item of incomingArr) {
    map.set(item.id, item); // overwrite with imported (your preference)
  }
  return Array.from(map.values());
}

export function useAppState() {
  const [state, setState] = useState(null);
  const [saveStatus, setSaveStatus] = useState("loading"); // loading | saved | saving | error
  const saveTimer = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const loaded = await idbGet(STORAGE_KEY);
        if (!mounted) return;
        if (loaded && loaded.version) {
          setState(loaded);
          setSaveStatus("saved");
        } else {
          const fresh = defaultState();
          setState(fresh);
          setSaveStatus("saved");
          await idbSet(STORAGE_KEY, fresh);
        }
      } catch (e) {
        console.error(e);
        // fallback to default in memory
        const fresh = defaultState();
        if (mounted) {
          setState(fresh);
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
        return touch(next);
      });
    };

    const addCage = (name = "New Cage", cohortId = COHORTS[0].id) => {
      const cageId = uid("cage");
      const cohort = COHORTS.find(c => c.id === cohortId) || COHORTS[0];
      updateState(prev => {
        const cages = [...prev.cages, {
          id: cageId,
          name,
          cohortId,
          groupId: cohort.groups[0].id,
          drug: "",
          notes: "",
          createdAt: nowIso(),
          updatedAt: nowIso(),
        }];
        // Don't auto-create mice - let users add subjects as needed
        return { ...prev, cages };
      });
      return cageId;
    };

    const updateCage = (cageId, patch) => {
      updateState(prev => ({
        ...prev,
        cages: prev.cages.map(c => c.id === cageId ? { ...c, ...patch, updatedAt: nowIso() } : c),
      }));
    };

    
    const deleteCage = (cageId) => {
      updateState(prev => {
        const remainingCages = prev.cages.filter(c => c.id !== cageId);
        const removedMouseIds = prev.mice.filter(m => m.cageId === cageId).map(m => m.id);
        const remainingMice = prev.mice.filter(m => m.cageId !== cageId);
        const remainingEvents = prev.events.filter(e => !removedMouseIds.includes(e.mouseId));
        return {
          ...prev,
          cages: remainingCages,
          mice: remainingMice,
          events: remainingEvents,
        };
      });
    };

    const updateMouse = (mouseId, patch) => {
      updateState(prev => ({
        ...prev,
        mice: prev.mice.map(m => m.id === mouseId ? { ...m, ...patch, updatedAt: nowIso() } : m),
      }));
    };

    const addMouse = (cageId) => {
      const mouseId = uid("mouse");
      updateState(prev => {
        const cageMice = prev.mice.filter(m => m.cageId === cageId);
        const nextSlot = cageMice.length > 0 ? Math.max(...cageMice.map(m => m.slot)) + 1 : 1;
        const newMouse = {
          id: mouseId,
          cageId,
          slot: nextSlot,
          mouseId: "",
          genotype: "",
          drug: "",
          status: "ALIVE",
          killedAt: null,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        };
        return { ...prev, mice: [...prev.mice, newMouse] };
      });
      return mouseId;
    };

    const deleteMouse = (mouseId) => {
      updateState(prev => {
        const remainingMice = prev.mice.filter(m => m.id !== mouseId);
        const remainingEvents = prev.events.filter(e => e.mouseId !== mouseId);
        return {
          ...prev,
          mice: remainingMice,
          events: remainingEvents,
        };
      });
    };

    const addEvent = (event) => {
      const full = {
        id: uid("evt"),
        mouseId: event.mouseId,
        category: event.category, // CARE | INJECTION | TEST | KILL | NOTE
        type: event.type || "",
        datetime: event.datetime || nowIso(),
        fields: event.fields || {},
        trials: event.trials || [],
        notes: event.notes || "",
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      updateState(prev => ({ ...prev, events: [...prev.events, full] }));
      return full.id;
    };

    const updateEvent = (eventId, patch) => {
      updateState(prev => ({
        ...prev,
        events: prev.events.map(e => e.id === eventId ? { ...e, ...patch, updatedAt: nowIso() } : e),
      }));
    };

    const deleteEvent = (eventId) => {
      updateState(prev => ({ ...prev, events: prev.events.filter(e => e.id !== eventId) }));
    };

    const exportJson = () => {
      const payload = { ...state, exportedAt: nowIso() };
      return payload;
    };

    const importJsonMerge = (payload) => {
      // Merge by id, overwrite with imported (per your preference)
      updateState(prev => {
        const merged = {
          ...prev,
          version: Math.max(prev.version || 1, payload.version || 1),
          cages: mergeById(prev.cages, payload.cages || []),
          mice: mergeById(prev.mice, payload.mice || []),
          events: mergeById(prev.events, payload.events || []),
        };
        return merged;
      });
    };

    return {
      state,
      setState: updateState,
      addCage,
      updateCage,
      deleteCage,
      addMouse,
      updateMouse,
      deleteMouse,
      addEvent,
      updateEvent,
      deleteEvent,
      exportJson,
      importJsonMerge,
    };
  }, [state]);

  // autosave debounce
  useEffect(() => {
    if (!state) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus("saving");
    saveTimer.current = setTimeout(async () => {
      try {
        const toSave = { ...state, lastSavedAt: nowIso() };
        await idbSet(STORAGE_KEY, toSave);
        setState(toSave);
        setSaveStatus("saved");
      } catch (e) {
        console.error(e);
        setSaveStatus("error");
      }
    }, 350);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state?.lastModifiedAt]); // only trigger on touch

  return { state, api, saveStatus };
}
