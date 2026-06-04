/**
 * Core type definitions for the flexible schema system
 * This allows full customization of experiments, subjects, and data collection
 */

// ============================================================================
// Field Definitions - Building blocks for custom forms
// ============================================================================

export type FieldType = 
  | 'text' 
  | 'number' 
  | 'date' 
  | 'datetime'
  | 'select' 
  | 'multiselect' 
  | 'checkbox' 
  | 'textarea'
  | 'email'
  | 'url'
  | 'time';

export interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  custom?: (value: any) => boolean | string; // returns true or error message
}

export interface FieldDefinition {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  description?: string;
  placeholder?: string;
  defaultValue?: any;
  options?: Array<{ value: string; label: string }>; // for select/multiselect
  validation?: FieldValidation;
  unit?: string; // e.g., "g", "ml", "cm"
  helpText?: string;
  conditional?: {
    field: string; // show this field only if another field has certain value
    value: any;
  };
}

// ============================================================================
// Species Configuration
// ============================================================================

export type SpeciesType = 'mouse' | 'rat' | 'zebrafish' | 'drosophila' | 'celegans' | 'custom';

export interface SpeciesConfig {
  id: string;
  name: string;
  type: SpeciesType;
  pluralName: string; // "mice", "fish", etc.
  icon?: string;
  defaultFields: FieldDefinition[];
  commonGenotypes?: string[];
  commonStrains?: string[];
  ageUnits: 'days' | 'weeks' | 'months' | 'years' | string; // Allow custom units
  weightUnit: 'mg' | 'g' | 'kg' | 'oz' | 'lb' | string; // Allow custom units
}

// ============================================================================
// Housing Unit Configuration (Cages, Tanks, etc.)
// ============================================================================

export interface HousingUnitConfig {
  id: string;
  name: string; // "Cage", "Tank", "Vial", etc.
  pluralName: string;
  icon?: string;
  defaultCapacity: number;
  allowVariableCapacity: boolean;
  customFields: FieldDefinition[];
  namingPattern?: string; // e.g., "Cage {number}", "Tank {letter}{number}"
}

// ============================================================================
// Event Type Definitions
// ============================================================================

export type EventCategory = 
  | 'care' 
  | 'injection' 
  | 'surgery'
  | 'test' 
  | 'observation'
  | 'measurement'
  | 'treatment'
  | 'death' 
  | 'note'
  | 'custom';

export interface EventTypeDefinition {
  id: string;
  name: string;
  category: EventCategory;
  icon?: string;
  color?: string;
  description?: string;
  fields: FieldDefinition[];
  allowTrials: boolean; // can this event have multiple trials/repetitions?
  trialFields?: FieldDefinition[]; // fields specific to each trial
  requiresDateTime: boolean;
  defaultDuration?: number; // in minutes
  tags?: string[];
}

// ============================================================================
// Protocol Definitions (Schedules)
// ============================================================================

export interface ProtocolStep {
  day: number; // relative to protocol start
  dayLabel?: string; // e.g., "Day 0 (baseline)", "Day 7 (post-injection)"
  eventTypeIds: string[];
  notes?: string;
  required: boolean;
  timeOfDay?: string; // e.g., "09:00", "afternoon"
}

export interface ProtocolDefinition {
  id: string;
  name: string;
  description: string;
  category?: string;
  timeline: ProtocolStep[];
  totalDays: number;
  tags?: string[];
  references?: string[]; // citations, papers, etc.
}

// ============================================================================
// Experiment Template
// ============================================================================

export interface ExperimentTemplate {
  id: string;
  name: string;
  version: string;
  description: string;
  author?: string;
  createdAt: string;
  updatedAt: string;
  
  // Core configuration
  species: SpeciesConfig;
  housingUnit: HousingUnitConfig;
  
  // Available event types for this experiment
  eventTypes: EventTypeDefinition[];
  
  // Predefined protocols
  protocols: ProtocolDefinition[];
  
  // Custom fields at experiment level
  experimentFields: FieldDefinition[];
  
  // Groups/cohorts configuration
  groupsConfig?: {
    enabled: boolean;
    allowMultiple: boolean;
    predefinedGroups?: Array<{
      id: string;
      name: string;
      description?: string;
      color?: string;
    }>;
  };
  
  // Drugs/treatments configuration
  drugsConfig?: {
    enabled: boolean;
    predefinedDrugs?: Array<{
      id: string;
      name: string;
      category?: string;
      defaultDose?: string;
      defaultRoute?: string;
    }>;
  };
  
  // Analysis configuration
  analysisConfig?: {
    enabledMetrics: string[];
    customCalculations?: Array<{
      id: string;
      name: string;
      formula: string;
      description?: string;
    }>;
  };
  
  // UI preferences
  uiConfig?: {
    primaryColor?: string;
    showTimeline?: boolean;
    defaultView?: 'grid' | 'list' | 'calendar';
  };
  
  // Metadata
  tags?: string[];
  isPublic?: boolean;
  isBuiltIn?: boolean;
}

// ============================================================================
// Runtime Data Structures (instances of templates)
// ============================================================================

export interface Experiment {
  id: string;
  templateId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status: 'planning' | 'active' | 'completed' | 'archived';
  customFieldValues: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  notes?: string;
}

export interface HousingUnit {
  id: string;
  experimentId: string;
  name: string;
  capacity: number;
  location?: string;
  customFieldValues: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface Subject {
  id: string;
  housingUnitId: string;
  experimentId: string;
  subjectId: string; // user-defined ID
  slot?: number; // position in housing unit
  status: 'active' | 'deceased' | 'removed' | 'transferred';
  statusDate?: string;
  customFieldValues: Record<string, any>;
  groupId?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface Event {
  id: string;
  subjectId: string;
  experimentId: string;
  eventTypeId: string;
  datetime: string;
  fieldValues: Record<string, any>;
  trials?: Array<{
    id: string;
    trialNumber: number;
    fieldValues: Record<string, any>;
  }>;
  performedBy?: string;
  notes?: string;
  attachments?: string[]; // file paths or URLs
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Application State
// ============================================================================

export interface AppState {
  version: number;
  lastSavedAt: string | null;
  lastModifiedAt: string;
  
  // Templates
  templates: ExperimentTemplate[];
  
  // Active data
  experiments: Experiment[];
  housingUnits: HousingUnit[];
  subjects: Subject[];
  events: Event[];
  
  // Settings
  settings: {
    defaultTemplateId?: string;
    theme: 'light' | 'dark' | 'auto';
    autoSave: boolean;
    autoSaveInterval: number; // milliseconds
    backupEnabled: boolean;
    backupInterval: number; // days
  };
  
  // User preferences
  userPreferences?: {
    recentExperiments: string[];
    favoriteTemplates: string[];
    customViews?: any[];
  };
}

// ============================================================================
// Validation & Helpers
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
  }>;
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'excel' | 'pdf';
  includeEvents: boolean;
  includeNotes: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  experimentIds?: string[];
}

export interface ImportResult {
  success: boolean;
  imported: {
    experiments: number;
    housingUnits: number;
    subjects: number;
    events: number;
  };
  errors: string[];
  warnings: string[];
}

// Made with Bob
