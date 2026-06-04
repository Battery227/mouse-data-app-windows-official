/**
 * Generic, species-agnostic templates
 * These templates work for ANY research type and can be customized
 */

import { TemplateBuilder, FieldBuilders } from './templateBuilder';
import { ExperimentTemplate } from './types';

// ============================================================================
// Generic Research Template - Works for ANY species
// ============================================================================

export const GENERIC_RESEARCH_TEMPLATE: ExperimentTemplate = new TemplateBuilder(
  'Generic Research Study',
  'Flexible template for any in vivo research - fully customizable'
)
  .setSpecies({
    name: 'Research Subject',
    pluralName: 'Research Subjects',
    icon: '🔬',
    ageUnits: 'days',
    weightUnit: 'g'
  })
  .addSubjectField(FieldBuilders.text('subjectId', 'Subject ID', true))
  .addSubjectField(FieldBuilders.text('identifier', 'Additional Identifier'))
  .addSubjectField(FieldBuilders.select('sex', 'Sex', ['Male', 'Female', 'Unknown']))
  .addSubjectField(FieldBuilders.text('genotype', 'Genotype/Strain'))
  .addSubjectField(FieldBuilders.date('birthDate', 'Birth/Start Date'))
  .addSubjectField(FieldBuilders.textarea('notes', 'Notes'))
  
  .setHousingUnit({
    name: 'Housing Unit',
    pluralName: 'Housing Units',
    icon: '📦',
    defaultCapacity: 10,
    allowVariableCapacity: true
  })
  .addHousingUnitField(FieldBuilders.text('location', 'Location'))
  .addHousingUnitField(FieldBuilders.text('identifier', 'Unit Identifier'))
  
  .addEventType({
    name: 'Observation',
    category: 'observation',
    icon: '👁️',
    color: '#2196F3',
    description: 'General observation or note',
    allowTrials: false,
    fields: [
      FieldBuilders.textarea('observation', 'Observation', true),
      FieldBuilders.select('severity', 'Severity/Priority', ['Low', 'Medium', 'High', 'Critical'])
    ]
  })
  .addEventType({
    name: 'Measurement',
    category: 'measurement',
    icon: '📏',
    color: '#4CAF50',
    description: 'Record any measurement',
    allowTrials: true,
    fields: [
      FieldBuilders.text('measurementType', 'Measurement Type', true),
      FieldBuilders.text('method', 'Method/Equipment')
    ],
    trialFields: [
      FieldBuilders.number('value', 'Value', true),
      FieldBuilders.text('unit', 'Unit', true)
    ]
  })
  .addEventType({
    name: 'Treatment',
    category: 'treatment',
    icon: '💊',
    color: '#9C27B0',
    description: 'Any treatment or intervention',
    allowTrials: false,
    fields: [
      FieldBuilders.text('treatmentType', 'Treatment Type', true),
      FieldBuilders.text('agent', 'Agent/Drug'),
      FieldBuilders.text('dose', 'Dose'),
      FieldBuilders.text('route', 'Route/Method'),
      FieldBuilders.textarea('notes', 'Notes')
    ]
  })
  .addEventType({
    name: 'Sample Collection',
    category: 'sample',
    icon: '🧪',
    color: '#FF9800',
    description: 'Collect biological samples',
    allowTrials: false,
    fields: [
      FieldBuilders.text('sampleType', 'Sample Type', true),
      FieldBuilders.text('sampleId', 'Sample ID'),
      FieldBuilders.text('volume', 'Volume/Amount'),
      FieldBuilders.text('storage', 'Storage Location'),
      FieldBuilders.textarea('notes', 'Notes')
    ]
  })
  .addEventType({
    name: 'Status Change',
    category: 'status',
    icon: '🔄',
    color: '#607D8B',
    description: 'Change in subject status',
    allowTrials: false,
    fields: [
      FieldBuilders.select('newStatus', 'New Status', ['Active', 'Inactive', 'Deceased', 'Transferred', 'Completed'], true),
      FieldBuilders.text('reason', 'Reason'),
      FieldBuilders.textarea('notes', 'Notes')
    ]
  })
  
  .addProtocol({
    name: 'Basic Protocol',
    description: 'Simple timeline template',
    timeline: [
      { day: 0, dayLabel: 'Day 0 (Start)', eventTypeNames: ['Observation'], required: true },
      { day: 7, dayLabel: 'Day 7', eventTypeNames: ['Measurement'], required: false },
      { day: 14, dayLabel: 'Day 14 (End)', eventTypeNames: ['Observation'], required: true }
    ]
  })
  
  .setGroupsConfig({
    enabled: true,
    allowMultiple: false,
    predefinedGroups: [
      { name: 'Control', color: '#4CAF50' },
      { name: 'Experimental', color: '#2196F3' },
      { name: 'Treatment', color: '#F44336' }
    ]
  })
  
  .addTags('generic', 'customizable', 'flexible')
  .build();

// ============================================================================
// Behavioral Study Template - Species-agnostic
// ============================================================================

export const BEHAVIORAL_STUDY_TEMPLATE: ExperimentTemplate = new TemplateBuilder(
  'Behavioral Study',
  'General behavioral research template for any species'
)
  .setSpecies({
    name: 'Subject',
    pluralName: 'Subjects',
    icon: '🐾',
    ageUnits: 'days',
    weightUnit: 'g'
  })
  .addSubjectField(FieldBuilders.text('subjectId', 'Subject ID', true))
  .addSubjectField(FieldBuilders.select('sex', 'Sex', ['Male', 'Female', 'Unknown']))
  .addSubjectField(FieldBuilders.number('age', 'Age', false, 'days'))
  .addSubjectField(FieldBuilders.text('strain', 'Strain/Line'))
  
  .setHousingUnit({
    name: 'Housing Unit',
    pluralName: 'Housing Units',
    icon: '🏠',
    defaultCapacity: 5,
    allowVariableCapacity: true
  })
  .addHousingUnitField(FieldBuilders.text('location', 'Location'))
  
  .addEventType({
    name: 'Behavioral Test',
    category: 'test',
    icon: '🧪',
    color: '#9C27B0',
    description: 'Any behavioral test or assay',
    allowTrials: true,
    fields: [
      FieldBuilders.text('testName', 'Test Name', true),
      FieldBuilders.text('apparatus', 'Apparatus/Setup'),
      FieldBuilders.number('duration', 'Duration', false, 'minutes'),
      FieldBuilders.textarea('protocol', 'Protocol Notes')
    ],
    trialFields: [
      FieldBuilders.number('score', 'Score/Value', true),
      FieldBuilders.text('unit', 'Unit'),
      FieldBuilders.textarea('notes', 'Trial Notes')
    ]
  })
  .addEventType({
    name: 'Activity Monitoring',
    category: 'observation',
    icon: '🏃',
    color: '#FF9800',
    description: 'Monitor activity levels',
    allowTrials: false,
    fields: [
      FieldBuilders.number('duration', 'Observation Duration', true, 'minutes'),
      FieldBuilders.select('activityLevel', 'Activity Level', ['Very Low', 'Low', 'Normal', 'High', 'Very High']),
      FieldBuilders.textarea('behaviors', 'Observed Behaviors')
    ]
  })
  .addEventType({
    name: 'Social Interaction',
    category: 'observation',
    icon: '👥',
    color: '#00BCD4',
    description: 'Social behavior observation',
    allowTrials: false,
    fields: [
      FieldBuilders.number('duration', 'Duration', true, 'minutes'),
      FieldBuilders.text('partners', 'Interaction Partners'),
      FieldBuilders.textarea('interactions', 'Interaction Types'),
      FieldBuilders.select('quality', 'Interaction Quality', ['Positive', 'Neutral', 'Negative', 'Aggressive'])
    ]
  })
  
  .addProtocol({
    name: 'Behavioral Battery',
    description: 'Comprehensive behavioral assessment',
    timeline: [
      { day: 0, dayLabel: 'Day 0 (Habituation)', eventTypeNames: ['Activity Monitoring'], required: true },
      { day: 1, dayLabel: 'Day 1 (Testing)', eventTypeNames: ['Behavioral Test'], required: true },
      { day: 2, dayLabel: 'Day 2 (Social)', eventTypeNames: ['Social Interaction'], required: true }
    ]
  })
  
  .setGroupsConfig({
    enabled: true,
    predefinedGroups: [
      { name: 'Control', color: '#4CAF50' },
      { name: 'Experimental', color: '#F44336' }
    ]
  })
  
  .addTags('behavior', 'testing', 'generic')
  .build();

// ============================================================================
// Pharmacology Study Template - Species-agnostic
// ============================================================================

export const PHARMACOLOGY_TEMPLATE: ExperimentTemplate = new TemplateBuilder(
  'Pharmacology Study',
  'Drug testing and pharmacological research'
)
  .setSpecies({
    name: 'Subject',
    pluralName: 'Subjects',
    icon: '🔬',
    ageUnits: 'weeks',
    weightUnit: 'g'
  })
  .addSubjectField(FieldBuilders.text('subjectId', 'Subject ID', true))
  .addSubjectField(FieldBuilders.number('weight', 'Body Weight', false, 'g'))
  .addSubjectField(FieldBuilders.select('sex', 'Sex', ['Male', 'Female']))
  
  .setHousingUnit({
    name: 'Housing Unit',
    pluralName: 'Housing Units',
    icon: '📦',
    defaultCapacity: 5,
    allowVariableCapacity: true
  })
  
  .addEventType({
    name: 'Drug Administration',
    category: 'treatment',
    icon: '💉',
    color: '#E91E63',
    description: 'Administer drug or compound',
    allowTrials: false,
    fields: [
      FieldBuilders.text('compound', 'Compound Name', true),
      FieldBuilders.text('dose', 'Dose', true),
      FieldBuilders.text('route', 'Route of Administration', true),
      FieldBuilders.text('vehicle', 'Vehicle'),
      FieldBuilders.text('batchNumber', 'Batch/Lot Number'),
      FieldBuilders.textarea('notes', 'Notes')
    ]
  })
  .addEventType({
    name: 'Blood Sample',
    category: 'sample',
    icon: '🩸',
    color: '#F44336',
    description: 'Collect blood sample',
    allowTrials: false,
    fields: [
      FieldBuilders.text('volume', 'Volume', true),
      FieldBuilders.text('method', 'Collection Method'),
      FieldBuilders.text('sampleId', 'Sample ID'),
      FieldBuilders.text('storage', 'Storage Conditions'),
      FieldBuilders.textarea('notes', 'Notes')
    ]
  })
  .addEventType({
    name: 'Pharmacokinetic Measurement',
    category: 'measurement',
    icon: '📊',
    color: '#2196F3',
    description: 'PK/PD measurements',
    allowTrials: true,
    fields: [
      FieldBuilders.text('parameter', 'Parameter', true),
      FieldBuilders.number('timepoint', 'Timepoint', true, 'hours')
    ],
    trialFields: [
      FieldBuilders.number('concentration', 'Concentration', true),
      FieldBuilders.text('unit', 'Unit', true)
    ]
  })
  .addEventType({
    name: 'Adverse Event',
    category: 'observation',
    icon: '⚠️',
    color: '#FF9800',
    description: 'Record adverse events',
    allowTrials: false,
    fields: [
      FieldBuilders.text('event', 'Event Description', true),
      FieldBuilders.select('severity', 'Severity', ['Mild', 'Moderate', 'Severe', 'Life-threatening'], true),
      FieldBuilders.select('relationship', 'Relationship to Drug', ['Unrelated', 'Unlikely', 'Possible', 'Probable', 'Definite']),
      FieldBuilders.textarea('action', 'Action Taken')
    ]
  })
  
  .addProtocol({
    name: 'Single Dose PK',
    description: 'Single dose pharmacokinetic study',
    timeline: [
      { day: 0, dayLabel: 'Day 0 (Baseline)', eventTypeNames: ['Blood Sample'], required: true },
      { day: 0, dayLabel: 'Day 0 (Dosing)', eventTypeNames: ['Drug Administration'], required: true, timeOfDay: '09:00' },
      { day: 0, dayLabel: 'Day 0 (PK)', eventTypeNames: ['Pharmacokinetic Measurement', 'Blood Sample'], required: true },
      { day: 1, dayLabel: 'Day 1 (Follow-up)', eventTypeNames: ['Pharmacokinetic Measurement'], required: true }
    ]
  })
  
  .setGroupsConfig({
    enabled: true,
    predefinedGroups: [
      { name: 'Vehicle Control', color: '#4CAF50' },
      { name: 'Low Dose', color: '#2196F3' },
      { name: 'Medium Dose', color: '#FF9800' },
      { name: 'High Dose', color: '#F44336' }
    ]
  })
  
  .setDrugsConfig({
    enabled: true,
    predefinedDrugs: []
  })
  
  .addTags('pharmacology', 'drug-testing', 'pk-pd')
  .build();

// ============================================================================
// Export all generic templates
// ============================================================================

export const GENERIC_TEMPLATES: ExperimentTemplate[] = [
  GENERIC_RESEARCH_TEMPLATE,
  BEHAVIORAL_STUDY_TEMPLATE,
  PHARMACOLOGY_TEMPLATE
];

// Made with Bob
