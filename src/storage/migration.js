/**
 * Data migration utilities
 * Converts V1 data model to V2 data model
 */

import { uid } from '../utils/ids';
import { normalizeStatus, normalizeEventCategory } from '../models/constants';
import { BUILT_IN_TEMPLATES } from '../core/schema/builtInTemplates';

/**
 * Migrate V1 state to V2 state
 * @param {Object} v1State - V1 state object
 * @returns {Object} V2 state object
 */
export function migrateV1ToV2(v1State) {
  console.log('🔄 Starting V1 → V2 migration...');
  
  // Get default template (Mouse template)
  const defaultTemplate = BUILT_IN_TEMPLATES[0];
  
  // Create default experiment from V1 data
  const experimentId = uid('exp');
  const experiment = {
    id: experimentId,
    templateId: defaultTemplate.id,
    name: 'Migrated Experiment',
    description: 'Automatically migrated from V1 data',
    startDate: v1State.lastModifiedAt || new Date().toISOString(),
    status: 'active',
    customFieldValues: {},
    createdAt: v1State.lastModifiedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['migrated', 'v1']
  };

  // Migrate cages → housing units
  const housingUnits = (v1State.cages || []).map(cage => ({
    id: cage.id,
    experimentId: experimentId,
    name: cage.name,
    capacity: 10, // Default capacity
    location: '',
    customFieldValues: {
      cohortId: cage.cohortId,
      groupId: cage.groupId,
      drug: cage.drug || '',
      notes: cage.notes || ''
    },
    createdAt: cage.createdAt || new Date().toISOString(),
    updatedAt: cage.updatedAt || new Date().toISOString(),
    notes: cage.notes || ''
  }));

  // Migrate mice → subjects
  const subjects = (v1State.mice || []).map(mouse => {
    // Normalize status
    const normalizedStatus = normalizeStatus(mouse.status);
    
    return {
      id: mouse.id,
      housingUnitId: mouse.cageId,
      experimentId: experimentId,
      subjectId: mouse.mouseId || `Subject-${mouse.slot}`,
      slot: mouse.slot,
      status: normalizedStatus.toLowerCase(), // V2 uses lowercase
      statusDate: mouse.killedAt || mouse.updatedAt,
      customFieldValues: {
        mouseId: mouse.mouseId || '',
        genotype: mouse.genotype || '',
        drug: mouse.drug || '',
        sex: '',
        dob: '',
        weight: ''
      },
      groupId: '',
      createdAt: mouse.createdAt || new Date().toISOString(),
      updatedAt: mouse.updatedAt || new Date().toISOString(),
      notes: ''
    };
  });

  // Migrate events
  const events = (v1State.events || []).map(event => {
    // Find subject to get experimentId
    const subject = subjects.find(s => s.id === event.mouseId);
    
    // Normalize category
    const normalizedCategory = normalizeEventCategory(event.category);
    
    return {
      id: event.id,
      subjectId: event.mouseId, // Keep mouseId as subjectId
      experimentId: experimentId,
      eventTypeId: `${normalizedCategory}-${event.type || 'default'}`,
      datetime: event.datetime || new Date().toISOString(),
      fieldValues: {
        category: normalizedCategory,
        type: event.type || '',
        ...(event.fields || {})
      },
      trials: (event.trials || []).map((trial, idx) => ({
        id: uid('trial'),
        trialNumber: idx + 1,
        fieldValues: trial
      })),
      performedBy: '',
      notes: event.notes || '',
      attachments: [],
      createdAt: event.createdAt || new Date().toISOString(),
      updatedAt: event.updatedAt || new Date().toISOString()
    };
  });

  // Build V2 state
  const v2State = {
    version: 2,
    lastSavedAt: v1State.lastSavedAt,
    lastModifiedAt: new Date().toISOString(),
    
    // Templates (include default)
    templates: [defaultTemplate],
    
    // Migrated data
    experiments: [experiment],
    housingUnits: housingUnits,
    subjects: subjects,
    events: events,
    
    // Settings
    settings: {
      defaultTemplateId: defaultTemplate.id,
      theme: 'light',
      autoSave: true,
      autoSaveInterval: 350,
      backupEnabled: true,
      backupInterval: 7
    },
    
    // User preferences
    userPreferences: {
      recentExperiments: [experimentId],
      favoriteTemplates: [defaultTemplate.id],
      customViews: []
    }
  };

  console.log('✅ Migration complete:', {
    experiments: v2State.experiments.length,
    housingUnits: v2State.housingUnits.length,
    subjects: v2State.subjects.length,
    events: v2State.events.length
  });

  return v2State;
}

/**
 * Check if state needs migration
 * @param {Object} state - State object
 * @returns {boolean} True if migration needed
 */
export function needsMigration(state) {
  if (!state) return false;
  
  // V1 has cages and mice
  // V2 has experiments and subjects
  const isV1 = state.version === 1 || (state.cages && state.mice);
  const isV2 = state.version === 2 || (state.experiments && state.subjects);
  
  return isV1 && !isV2;
}

/**
 * Validate migrated state
 * @param {Object} v2State - V2 state object
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateMigratedState(v2State) {
  const errors = [];
  
  if (!v2State.experiments || v2State.experiments.length === 0) {
    errors.push('No experiments found');
  }
  
  if (!v2State.housingUnits) {
    errors.push('No housing units found');
  }
  
  if (!v2State.subjects) {
    errors.push('No subjects found');
  }
  
  if (!v2State.events) {
    errors.push('No events found');
  }
  
  // Check referential integrity
  v2State.subjects?.forEach(subject => {
    const housingUnit = v2State.housingUnits?.find(h => h.id === subject.housingUnitId);
    if (!housingUnit) {
      errors.push(`Subject ${subject.id} references non-existent housing unit ${subject.housingUnitId}`);
    }
  });
  
  v2State.events?.forEach(event => {
    const subject = v2State.subjects?.find(s => s.id === event.subjectId);
    if (!subject) {
      errors.push(`Event ${event.id} references non-existent subject ${event.subjectId}`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Create backup before migration
 * @param {Object} state - State to backup
 * @returns {string} Backup JSON string
 */
export function createMigrationBackup(state) {
  const backup = {
    ...state,
    backupDate: new Date().toISOString(),
    backupReason: 'pre-migration'
  };
  return JSON.stringify(backup, null, 2);
}

// Made with Bob
