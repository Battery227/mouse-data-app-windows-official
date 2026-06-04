/**
 * Runtime Template Builder
 * Allows users to create and modify experiment templates without code changes
 * Completely species-agnostic and field-agnostic
 */

import { 
  ExperimentTemplate, 
  FieldDefinition, 
  EventTypeDefinition, 
  ProtocolDefinition,
  SpeciesConfig,
  HousingUnitConfig,
  FieldType
} from './types';
import { uid } from '../../utils/ids';

// ============================================================================
// Template Builder - Create templates at runtime
// ============================================================================

export class TemplateBuilder {
  private template: Partial<ExperimentTemplate>;

  constructor(name: string, description: string = '') {
    this.template = {
      id: uid('template'),
      name,
      description,
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isBuiltIn: false,
      isPublic: false,
      eventTypes: [],
      protocols: [],
      experimentFields: [],
      tags: []
    };
  }

  /**
   * Define the species/subject type (completely custom)
   */
  setSpecies(config: {
    name: string;
    pluralName: string;
    icon?: string;
    ageUnits?: 'days' | 'weeks' | 'months' | 'years';
    weightUnit?: 'mg' | 'g' | 'kg' | 'oz' | 'lb';
    customType?: string; // For truly custom species
  }): this {
    this.template.species = {
      id: uid('species'),
      name: config.name,
      type: 'custom',
      pluralName: config.pluralName,
      icon: config.icon,
      ageUnits: config.ageUnits || 'days',
      weightUnit: config.weightUnit || 'g',
      defaultFields: [], // Will be added separately
      commonGenotypes: [],
      commonStrains: []
    };
    return this;
  }

  /**
   * Add a custom field to the species/subject
   */
  addSubjectField(field: Omit<FieldDefinition, 'id'>): this {
    if (!this.template.species) {
      throw new Error('Must set species before adding subject fields');
    }
    
    const fullField: FieldDefinition = {
      id: uid('field'),
      ...field
    };
    
    this.template.species.defaultFields.push(fullField);
    return this;
  }

  /**
   * Define the housing unit type (completely custom)
   */
  setHousingUnit(config: {
    name: string;
    pluralName: string;
    icon?: string;
    defaultCapacity: number;
    allowVariableCapacity?: boolean;
    namingPattern?: string;
  }): this {
    this.template.housingUnit = {
      id: uid('housing'),
      name: config.name,
      pluralName: config.pluralName,
      icon: config.icon,
      defaultCapacity: config.defaultCapacity,
      allowVariableCapacity: config.allowVariableCapacity ?? true,
      namingPattern: config.namingPattern,
      customFields: []
    };
    return this;
  }

  /**
   * Add a custom field to the housing unit
   */
  addHousingUnitField(field: Omit<FieldDefinition, 'id'>): this {
    if (!this.template.housingUnit) {
      throw new Error('Must set housing unit before adding fields');
    }
    
    const fullField: FieldDefinition = {
      id: uid('field'),
      ...field
    };
    
    this.template.housingUnit.customFields.push(fullField);
    return this;
  }

  /**
   * Add a custom event type (completely flexible)
   */
  addEventType(config: {
    name: string;
    category?: string; // User can define any category
    icon?: string;
    color?: string;
    description?: string;
    allowTrials?: boolean;
    requiresDateTime?: boolean;
    fields: Array<Omit<FieldDefinition, 'id'>>;
    trialFields?: Array<Omit<FieldDefinition, 'id'>>;
  }): this {
    const eventType: EventTypeDefinition = {
      id: uid('event'),
      name: config.name,
      category: config.category as any || 'custom',
      icon: config.icon,
      color: config.color || '#9E9E9E',
      description: config.description,
      allowTrials: config.allowTrials ?? false,
      requiresDateTime: config.requiresDateTime ?? true,
      fields: config.fields.map(f => ({ id: uid('field'), ...f })),
      trialFields: config.trialFields?.map(f => ({ id: uid('field'), ...f }))
    };
    
    this.template.eventTypes!.push(eventType);
    return this;
  }

  /**
   * Add a protocol/schedule
   */
  addProtocol(config: {
    name: string;
    description: string;
    category?: string;
    timeline: Array<{
      day: number;
      dayLabel?: string;
      eventTypeNames: string[]; // Will be resolved to IDs
      notes?: string;
      required?: boolean;
      timeOfDay?: string;
    }>;
  }): this {
    // Resolve event type names to IDs
    const timeline = config.timeline.map(step => {
      const eventTypeIds = step.eventTypeNames
        .map(name => this.template.eventTypes!.find(et => et.name === name)?.id)
        .filter(Boolean) as string[];
      
      return {
        day: step.day,
        dayLabel: step.dayLabel,
        eventTypeIds,
        notes: step.notes,
        required: step.required ?? false,
        timeOfDay: step.timeOfDay
      };
    });

    const protocol: ProtocolDefinition = {
      id: uid('protocol'),
      name: config.name,
      description: config.description,
      category: config.category,
      timeline,
      totalDays: Math.max(...config.timeline.map(t => t.day), 0)
    };
    
    this.template.protocols!.push(protocol);
    return this;
  }

  /**
   * Add experiment-level custom fields
   */
  addExperimentField(field: Omit<FieldDefinition, 'id'>): this {
    const fullField: FieldDefinition = {
      id: uid('field'),
      ...field
    };
    
    this.template.experimentFields!.push(fullField);
    return this;
  }

  /**
   * Configure groups/cohorts
   */
  setGroupsConfig(config: {
    enabled: boolean;
    allowMultiple?: boolean;
    predefinedGroups?: Array<{
      name: string;
      description?: string;
      color?: string;
    }>;
  }): this {
    this.template.groupsConfig = {
      enabled: config.enabled,
      allowMultiple: config.allowMultiple ?? false,
      predefinedGroups: config.predefinedGroups?.map(g => ({
        id: uid('group'),
        name: g.name,
        description: g.description,
        color: g.color
      }))
    };
    return this;
  }

  /**
   * Configure drugs/treatments
   */
  setDrugsConfig(config: {
    enabled: boolean;
    predefinedDrugs?: Array<{
      name: string;
      category?: string;
      defaultDose?: string;
      defaultRoute?: string;
    }>;
  }): this {
    this.template.drugsConfig = {
      enabled: config.enabled,
      predefinedDrugs: config.predefinedDrugs?.map(d => ({
        id: uid('drug'),
        name: d.name,
        category: d.category,
        defaultDose: d.defaultDose,
        defaultRoute: d.defaultRoute
      }))
    };
    return this;
  }

  /**
   * Add tags for categorization
   */
  addTags(...tags: string[]): this {
    this.template.tags = [...(this.template.tags || []), ...tags];
    return this;
  }

  /**
   * Build and return the complete template
   */
  build(): ExperimentTemplate {
    // Validate required fields
    if (!this.template.species) {
      throw new Error('Species configuration is required');
    }
    if (!this.template.housingUnit) {
      throw new Error('Housing unit configuration is required');
    }
    if (!this.template.name) {
      throw new Error('Template name is required');
    }

    return this.template as ExperimentTemplate;
  }

  /**
   * Export template as JSON for sharing
   */
  toJSON(): string {
    return JSON.stringify(this.build(), null, 2);
  }

  /**
   * Import template from JSON
   */
  static fromJSON(json: string): ExperimentTemplate {
    const template = JSON.parse(json);
    // Validate structure
    if (!template.species || !template.housingUnit) {
      throw new Error('Invalid template JSON');
    }
    return template;
  }
}

// ============================================================================
// Quick Field Builders - Helper functions for common field types
// ============================================================================

export const FieldBuilders = {
  text(name: string, label: string, required: boolean = false): Omit<FieldDefinition, 'id'> {
    return {
      name,
      label,
      type: 'text',
      required,
      placeholder: `Enter ${label.toLowerCase()}`
    };
  },

  number(name: string, label: string, required: boolean = false, unit?: string, min?: number, max?: number): Omit<FieldDefinition, 'id'> {
    return {
      name,
      label,
      type: 'number',
      required,
      unit,
      validation: { min, max }
    };
  },

  select(name: string, label: string, options: string[], required: boolean = false): Omit<FieldDefinition, 'id'> {
    return {
      name,
      label,
      type: 'select',
      required,
      options: options.map(opt => ({ value: opt, label: opt }))
    };
  },

  date(name: string, label: string, required: boolean = false): Omit<FieldDefinition, 'id'> {
    return {
      name,
      label,
      type: 'date',
      required
    };
  },

  textarea(name: string, label: string, required: boolean = false): Omit<FieldDefinition, 'id'> {
    return {
      name,
      label,
      type: 'textarea',
      required,
      placeholder: `Enter ${label.toLowerCase()}`
    };
  },

  checkbox(name: string, label: string): Omit<FieldDefinition, 'id'> {
    return {
      name,
      label,
      type: 'checkbox',
      required: false,
      defaultValue: false
    };
  }
};

// ============================================================================
// Example: Creating a completely custom template at runtime
// ============================================================================

export function createCustomTemplate(): ExperimentTemplate {
  return new TemplateBuilder('Custom Research Study', 'User-defined research protocol')
    // Define ANY species
    .setSpecies({
      name: 'Research Subject',
      pluralName: 'Research Subjects',
      icon: '🔬',
      ageUnits: 'days',
      weightUnit: 'g'
    })
    // Add ANY fields to subjects
    .addSubjectField(FieldBuilders.text('subjectId', 'Subject ID', true))
    .addSubjectField(FieldBuilders.select('status', 'Status', ['Active', 'Inactive', 'Complete']))
    .addSubjectField(FieldBuilders.date('startDate', 'Start Date'))
    
    // Define ANY housing type
    .setHousingUnit({
      name: 'Container',
      pluralName: 'Containers',
      icon: '📦',
      defaultCapacity: 10,
      allowVariableCapacity: true
    })
    .addHousingUnitField(FieldBuilders.text('location', 'Location'))
    
    // Add ANY event types
    .addEventType({
      name: 'Observation',
      category: 'observation',
      icon: '👁️',
      color: '#2196F3',
      description: 'General observation',
      allowTrials: false,
      fields: [
        FieldBuilders.textarea('notes', 'Observation Notes', true),
        FieldBuilders.select('severity', 'Severity', ['Low', 'Medium', 'High'])
      ]
    })
    .addEventType({
      name: 'Measurement',
      category: 'measurement',
      icon: '📏',
      color: '#4CAF50',
      allowTrials: true,
      fields: [
        FieldBuilders.select('measurementType', 'Type', ['Weight', 'Length', 'Volume', 'Custom'], true)
      ],
      trialFields: [
        FieldBuilders.number('value', 'Value', true),
        FieldBuilders.text('unit', 'Unit', true)
      ]
    })
    
    // Add protocols
    .addProtocol({
      name: 'Standard Protocol',
      description: 'Basic observation schedule',
      timeline: [
        { day: 0, dayLabel: 'Day 0 (Start)', eventTypeNames: ['Observation'], required: true },
        { day: 7, dayLabel: 'Day 7', eventTypeNames: ['Measurement', 'Observation'], required: true },
        { day: 14, dayLabel: 'Day 14 (End)', eventTypeNames: ['Measurement'], required: true }
      ]
    })
    
    .setGroupsConfig({
      enabled: true,
      allowMultiple: false,
      predefinedGroups: [
        { name: 'Control', color: '#4CAF50' },
        { name: 'Treatment', color: '#F44336' }
      ]
    })
    
    .addTags('custom', 'user-defined')
    .build();
}

// Made with Bob
