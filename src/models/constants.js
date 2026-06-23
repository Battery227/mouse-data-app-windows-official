/**
 * Application-wide constants
 * Single source of truth for status values, categories, etc.
 */

/**
 * Subject/Animal status values
 * Used consistently across V1 and V2
 */
export const SUBJECT_STATUS = {
  ALIVE: 'ALIVE',
  DECEASED: 'DECEASED',
  REMOVED: 'REMOVED',
  TRANSFERRED: 'TRANSFERRED'
};

/**
 * Legacy status mapping for V1 compatibility
 */
export const LEGACY_STATUS_MAP = {
  'KILLED': SUBJECT_STATUS.DECEASED,
  'DEAD': SUBJECT_STATUS.DECEASED,
  'EUTHANIZED': SUBJECT_STATUS.DECEASED,
  'ALIVE': SUBJECT_STATUS.ALIVE,
  'REMOVED': SUBJECT_STATUS.REMOVED,
  'TRANSFERRED': SUBJECT_STATUS.TRANSFERRED
};

/**
 * Normalize status value to standard enum
 * @param {string} status - Status value (may be legacy)
 * @returns {string} Normalized status
 */
export function normalizeStatus(status) {
  if (!status) return SUBJECT_STATUS.ALIVE;
  const upper = String(status).toUpperCase();
  return LEGACY_STATUS_MAP[upper] || SUBJECT_STATUS.ALIVE;
}

/**
 * Event categories
 */
export const EVENT_CATEGORY = {
  CARE: 'care',
  INJECTION: 'injection',
  SURGERY: 'surgery',
  TEST: 'test',
  OBSERVATION: 'observation',
  MEASUREMENT: 'measurement',
  TREATMENT: 'treatment',
  DEATH: 'death',
  NOTE: 'note',
  CUSTOM: 'custom'
};

/**
 * Legacy event category mapping
 */
export const LEGACY_EVENT_MAP = {
  'CARE': EVENT_CATEGORY.CARE,
  'INJECTION': EVENT_CATEGORY.INJECTION,
  'TEST': EVENT_CATEGORY.TEST,
  'KILL': EVENT_CATEGORY.DEATH,
  'NOTE': EVENT_CATEGORY.NOTE,
  'OBSERVATION': EVENT_CATEGORY.OBSERVATION
};

/**
 * Normalize event category
 * @param {string} category - Category value (may be legacy)
 * @returns {string} Normalized category
 */
export function normalizeEventCategory(category) {
  if (!category) return EVENT_CATEGORY.NOTE;
  const upper = String(category).toUpperCase();
  return LEGACY_EVENT_MAP[upper] || category.toLowerCase();
}

/**
 * Field types for dynamic forms
 */
export const FIELD_TYPE = {
  TEXT: 'text',
  NUMBER: 'number',
  DATE: 'date',
  DATETIME: 'datetime',
  TIME: 'time',
  SELECT: 'select',
  MULTISELECT: 'multiselect',
  CHECKBOX: 'checkbox',
  TEXTAREA: 'textarea',
  EMAIL: 'email',
  URL: 'url'
};

/**
 * Save status values
 */
export const SAVE_STATUS = {
  LOADING: 'loading',
  SAVING: 'saving',
  SAVED: 'saved',
  ERROR: 'error'
};

// Made with Bob
