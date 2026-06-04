/**
 * Built-in experiment templates for common in vivo research types
 * These serve as starting points that users can customize
 */

import { ExperimentTemplate, SpeciesConfig, HousingUnitConfig, EventTypeDefinition, ProtocolDefinition } from './types';

// ============================================================================
// Species Configurations
// ============================================================================

export const MOUSE_SPECIES: SpeciesConfig = {
  id: 'mouse',
  name: 'Mouse',
  type: 'mouse',
  pluralName: 'Mice',
  icon: '🐁',
  ageUnits: 'weeks',
  weightUnit: 'g',
  commonGenotypes: ['WT', 'Het', 'Hom', 'KO', 'Tg'],
  commonStrains: ['C57BL/6J', 'BALB/c', 'CD-1', 'FVB/N', '129S1/SvImJ'],
  defaultFields: [
    {
      id: 'mouseId',
      name: 'mouseId',
      label: 'Mouse ID',
      type: 'text',
      required: true,
      description: 'Unique identifier for this mouse',
      placeholder: 'e.g., M001, A1-01'
    },
    {
      id: 'genotype',
      name: 'genotype',
      label: 'Genotype',
      type: 'select',
      required: false,
      options: [
        { value: 'WT', label: 'Wild Type (WT)' },
        { value: 'Het', label: 'Heterozygous (Het)' },
        { value: 'Hom', label: 'Homozygous (Hom)' },
        { value: 'KO', label: 'Knockout (KO)' },
        { value: 'Tg', label: 'Transgenic (Tg)' }
      ]
    },
    {
      id: 'strain',
      name: 'strain',
      label: 'Strain',
      type: 'text',
      required: false,
      placeholder: 'e.g., C57BL/6J'
    },
    {
      id: 'sex',
      name: 'sex',
      label: 'Sex',
      type: 'select',
      required: false,
      options: [
        { value: 'M', label: 'Male' },
        { value: 'F', label: 'Female' },
        { value: 'U', label: 'Unknown' }
      ]
    },
    {
      id: 'dob',
      name: 'dob',
      label: 'Date of Birth',
      type: 'date',
      required: false
    },
    {
      id: 'earTag',
      name: 'earTag',
      label: 'Ear Tag',
      type: 'text',
      required: false
    }
  ]
};

export const ZEBRAFISH_SPECIES: SpeciesConfig = {
  id: 'zebrafish',
  name: 'Zebrafish',
  type: 'zebrafish',
  pluralName: 'Zebrafish',
  icon: '🐟',
  ageUnits: 'days',
  weightUnit: 'mg',
  commonGenotypes: ['WT', 'AB', 'TL', 'Tg'],
  commonStrains: ['AB', 'TL', 'WIK', 'TU'],
  defaultFields: [
    {
      id: 'fishId',
      name: 'fishId',
      label: 'Fish ID',
      type: 'text',
      required: true,
      placeholder: 'e.g., F001, Tank1-A'
    },
    {
      id: 'genotype',
      name: 'genotype',
      label: 'Genotype',
      type: 'text',
      required: false
    },
    {
      id: 'strain',
      name: 'strain',
      label: 'Strain',
      type: 'select',
      required: false,
      options: [
        { value: 'AB', label: 'AB' },
        { value: 'TL', label: 'Tübingen (TL)' },
        { value: 'WIK', label: 'WIK' },
        { value: 'TU', label: 'TU' }
      ]
    },
    {
      id: 'dpf',
      name: 'dpf',
      label: 'Days Post Fertilization',
      type: 'number',
      required: false,
      unit: 'dpf'
    },
    {
      id: 'sex',
      name: 'sex',
      label: 'Sex',
      type: 'select',
      required: false,
      options: [
        { value: 'M', label: 'Male' },
        { value: 'F', label: 'Female' },
        { value: 'U', label: 'Unknown' }
      ]
    }
  ]
};

// ============================================================================
// Housing Unit Configurations
// ============================================================================

export const MOUSE_CAGE: HousingUnitConfig = {
  id: 'mouse-cage',
  name: 'Cage',
  pluralName: 'Cages',
  icon: '📦',
  defaultCapacity: 5,
  allowVariableCapacity: true,
  namingPattern: 'Cage {number}',
  customFields: [
    {
      id: 'location',
      name: 'location',
      label: 'Location',
      type: 'text',
      required: false,
      placeholder: 'e.g., Rack 3, Shelf B'
    },
    {
      id: 'cageType',
      name: 'cageType',
      label: 'Cage Type',
      type: 'select',
      required: false,
      options: [
        { value: 'standard', label: 'Standard' },
        { value: 'ventilated', label: 'Ventilated (IVC)' },
        { value: 'isolation', label: 'Isolation' }
      ]
    }
  ]
};

export const ZEBRAFISH_TANK: HousingUnitConfig = {
  id: 'zebrafish-tank',
  name: 'Tank',
  pluralName: 'Tanks',
  icon: '🏊',
  defaultCapacity: 20,
  allowVariableCapacity: true,
  namingPattern: 'Tank {number}',
  customFields: [
    {
      id: 'system',
      name: 'system',
      label: 'System',
      type: 'text',
      required: false,
      placeholder: 'e.g., System A, Rack 2'
    },
    {
      id: 'waterTemp',
      name: 'waterTemp',
      label: 'Water Temperature',
      type: 'number',
      required: false,
      unit: '°C',
      validation: { min: 24, max: 30 }
    },
    {
      id: 'pH',
      name: 'pH',
      label: 'pH Level',
      type: 'number',
      required: false,
      validation: { min: 6.5, max: 8.5 }
    }
  ]
};

// ============================================================================
// Common Event Types
// ============================================================================

export const COMMON_EVENT_TYPES: EventTypeDefinition[] = [
  {
    id: 'weight',
    name: 'Weight Measurement',
    category: 'measurement',
    icon: '⚖️',
    color: '#4CAF50',
    description: 'Record subject weight',
    requiresDateTime: true,
    allowTrials: false,
    fields: [
      {
        id: 'weight',
        name: 'weight',
        label: 'Weight',
        type: 'number',
        required: true,
        unit: 'g',
        validation: { min: 0 }
      }
    ]
  },
  {
    id: 'injection-drug',
    name: 'Drug Injection',
    category: 'injection',
    icon: '💉',
    color: '#2196F3',
    description: 'Administer drug via injection',
    requiresDateTime: true,
    allowTrials: false,
    fields: [
      {
        id: 'drug',
        name: 'drug',
        label: 'Drug',
        type: 'text',
        required: true,
        placeholder: 'e.g., 6-OHDA, Saline'
      },
      {
        id: 'dose',
        name: 'dose',
        label: 'Dose',
        type: 'text',
        required: true,
        placeholder: 'e.g., 10 mg/kg'
      },
      {
        id: 'route',
        name: 'route',
        label: 'Route',
        type: 'select',
        required: true,
        options: [
          { value: 'IP', label: 'Intraperitoneal (IP)' },
          { value: 'IV', label: 'Intravenous (IV)' },
          { value: 'SC', label: 'Subcutaneous (SC)' },
          { value: 'IM', label: 'Intramuscular (IM)' },
          { value: 'IC', label: 'Intracranial (IC)' }
        ]
      },
      {
        id: 'volume',
        name: 'volume',
        label: 'Volume',
        type: 'number',
        required: false,
        unit: 'μL'
      }
    ]
  },
  {
    id: 'surgery',
    name: 'Surgery',
    category: 'surgery',
    icon: '🏥',
    color: '#F44336',
    description: 'Surgical procedure',
    requiresDateTime: true,
    allowTrials: false,
    fields: [
      {
        id: 'procedure',
        name: 'procedure',
        label: 'Procedure',
        type: 'text',
        required: true,
        placeholder: 'e.g., Fiber implantation, Craniotomy'
      },
      {
        id: 'anesthesia',
        name: 'anesthesia',
        label: 'Anesthesia',
        type: 'text',
        required: false,
        placeholder: 'e.g., Isoflurane 2%'
      },
      {
        id: 'duration',
        name: 'duration',
        label: 'Duration',
        type: 'number',
        required: false,
        unit: 'minutes'
      },
      {
        id: 'complications',
        name: 'complications',
        label: 'Complications',
        type: 'textarea',
        required: false
      }
    ]
  },
  {
    id: 'behavioral-test',
    name: 'Behavioral Test',
    category: 'test',
    icon: '🧪',
    color: '#9C27B0',
    description: 'Behavioral testing session',
    requiresDateTime: true,
    allowTrials: true,
    fields: [
      {
        id: 'testType',
        name: 'testType',
        label: 'Test Type',
        type: 'select',
        required: true,
        options: [
          { value: 'openfield', label: 'Open Field' },
          { value: 'rotarod', label: 'RotaRod' },
          { value: 'nor', label: 'Novel Object Recognition' },
          { value: 'zmt', label: 'Zero Maze Test' },
          { value: 'tst', label: 'Tail Suspension Test' },
          { value: 'custom', label: 'Custom' }
        ]
      },
      {
        id: 'customTestName',
        name: 'customTestName',
        label: 'Custom Test Name',
        type: 'text',
        required: false,
        conditional: { field: 'testType', value: 'custom' }
      }
    ],
    trialFields: [
      {
        id: 'value',
        name: 'value',
        label: 'Result',
        type: 'number',
        required: true
      },
      {
        id: 'unit',
        name: 'unit',
        label: 'Unit',
        type: 'text',
        required: false,
        placeholder: 'e.g., seconds, cm, count'
      }
    ]
  },
  {
    id: 'observation',
    name: 'General Observation',
    category: 'observation',
    icon: '👁️',
    color: '#FF9800',
    description: 'General health or behavior observation',
    requiresDateTime: true,
    allowTrials: false,
    fields: [
      {
        id: 'healthScore',
        name: 'healthScore',
        label: 'Health Score',
        type: 'select',
        required: false,
        options: [
          { value: '1', label: '1 - Excellent' },
          { value: '2', label: '2 - Good' },
          { value: '3', label: '3 - Fair' },
          { value: '4', label: '4 - Poor' },
          { value: '5', label: '5 - Critical' }
        ]
      },
      {
        id: 'activity',
        name: 'activity',
        label: 'Activity Level',
        type: 'select',
        required: false,
        options: [
          { value: 'normal', label: 'Normal' },
          { value: 'reduced', label: 'Reduced' },
          { value: 'hyperactive', label: 'Hyperactive' },
          { value: 'lethargic', label: 'Lethargic' }
        ]
      },
      {
        id: 'appearance',
        name: 'appearance',
        label: 'Appearance',
        type: 'textarea',
        required: false,
        placeholder: 'Coat condition, posture, etc.'
      }
    ]
  },
  {
    id: 'euthanasia',
    name: 'Euthanasia',
    category: 'death',
    icon: '💀',
    color: '#000000',
    description: 'Record euthanasia',
    requiresDateTime: true,
    allowTrials: false,
    fields: [
      {
        id: 'method',
        name: 'method',
        label: 'Method',
        type: 'select',
        required: true,
        options: [
          { value: 'co2', label: 'CO₂ Asphyxiation' },
          { value: 'cervical', label: 'Cervical Dislocation' },
          { value: 'overdose', label: 'Anesthetic Overdose' },
          { value: 'decapitation', label: 'Decapitation' }
        ]
      },
      {
        id: 'reason',
        name: 'reason',
        label: 'Reason',
        type: 'select',
        required: true,
        options: [
          { value: 'endpoint', label: 'Experimental Endpoint' },
          { value: 'humane', label: 'Humane Endpoint' },
          { value: 'health', label: 'Health Issues' },
          { value: 'accident', label: 'Accidental Death' }
        ]
      },
      {
        id: 'tissueCollection',
        name: 'tissueCollection',
        label: 'Tissue Collection',
        type: 'textarea',
        required: false,
        placeholder: 'List tissues collected'
      }
    ]
  }
];

// ============================================================================
// Built-in Templates
// ============================================================================

export const MOUSE_PARKINSONS_TEMPLATE: ExperimentTemplate = {
  id: 'mouse-parkinsons-6ohda',
  name: "Mouse Parkinson's Model (6-OHDA)",
  version: '1.0.0',
  description: '6-OHDA lesion model for Parkinson\'s disease research with behavioral testing',
  author: 'Built-in',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isBuiltIn: true,
  isPublic: true,
  
  species: MOUSE_SPECIES,
  housingUnit: MOUSE_CAGE,
  
  eventTypes: [
    ...COMMON_EVENT_TYPES,
    {
      id: '6ohda-injection',
      name: '6-OHDA Injection',
      category: 'injection',
      icon: '💉',
      color: '#E91E63',
      description: 'Stereotaxic 6-OHDA injection',
      requiresDateTime: true,
      allowTrials: false,
      fields: [
        {
          id: 'concentration',
          name: 'concentration',
          label: 'Concentration',
          type: 'text',
          required: true,
          defaultValue: '3 μg/μL'
        },
        {
          id: 'volume',
          name: 'volume',
          label: 'Volume',
          type: 'number',
          required: true,
          unit: 'μL',
          defaultValue: 2
        },
        {
          id: 'coordinates',
          name: 'coordinates',
          label: 'Stereotaxic Coordinates',
          type: 'text',
          required: false,
          placeholder: 'AP, ML, DV'
        },
        {
          id: 'hemisphere',
          name: 'hemisphere',
          label: 'Hemisphere',
          type: 'select',
          required: true,
          options: [
            { value: 'left', label: 'Left' },
            { value: 'right', label: 'Right' },
            { value: 'bilateral', label: 'Bilateral' }
          ]
        }
      ]
    }
  ],
  
  protocols: [
    {
      id: 'standard-6ohda',
      name: 'Standard 6-OHDA Protocol',
      description: 'Baseline → Lesion → Recovery → Behavioral Testing',
      category: 'Parkinson\'s Model',
      totalDays: 28,
      timeline: [
        {
          day: -7,
          dayLabel: 'Day -7 (Baseline)',
          eventTypeIds: ['weight', 'behavioral-test'],
          notes: 'Baseline behavioral assessment',
          required: true
        },
        {
          day: 0,
          dayLabel: 'Day 0 (Lesion)',
          eventTypeIds: ['6ohda-injection', 'weight'],
          notes: '6-OHDA stereotaxic injection',
          required: true,
          timeOfDay: '09:00'
        },
        {
          day: 1,
          dayLabel: 'Day 1 (Post-op)',
          eventTypeIds: ['weight', 'observation'],
          notes: 'Post-operative monitoring',
          required: true
        },
        {
          day: 7,
          dayLabel: 'Day 7',
          eventTypeIds: ['weight', 'observation'],
          notes: 'Weekly check',
          required: true
        },
        {
          day: 14,
          dayLabel: 'Day 14',
          eventTypeIds: ['weight', 'behavioral-test'],
          notes: 'Early behavioral assessment',
          required: true
        },
        {
          day: 21,
          dayLabel: 'Day 21',
          eventTypeIds: ['weight', 'behavioral-test'],
          notes: 'Full behavioral battery',
          required: true
        },
        {
          day: 28,
          dayLabel: 'Day 28 (Endpoint)',
          eventTypeIds: ['behavioral-test', 'euthanasia'],
          notes: 'Final assessment and tissue collection',
          required: true
        }
      ]
    }
  ],
  
  experimentFields: [
    {
      id: 'piNumber',
      name: 'piNumber',
      label: 'PI Name',
      type: 'text',
      required: false
    },
    {
      id: 'protocol',
      name: 'protocol',
      label: 'IACUC Protocol Number',
      type: 'text',
      required: false
    },
    {
      id: 'hypothesis',
      name: 'hypothesis',
      label: 'Hypothesis',
      type: 'textarea',
      required: false
    }
  ],
  
  groupsConfig: {
    enabled: true,
    allowMultiple: false,
    predefinedGroups: [
      { id: 'control', name: 'Control (Saline)', color: '#4CAF50' },
      { id: 'lesion', name: '6-OHDA Lesion', color: '#F44336' },
      { id: 'treatment', name: 'Treatment', color: '#2196F3' }
    ]
  },
  
  drugsConfig: {
    enabled: true,
    predefinedDrugs: [
      { id: '6ohda', name: '6-OHDA', category: 'Neurotoxin' },
      { id: 'saline', name: 'Saline', category: 'Control' }
    ]
  },
  
  tags: ['mouse', 'parkinsons', 'neuroscience', '6-OHDA', 'behavior']
};

export const ZEBRAFISH_DEVELOPMENT_TEMPLATE: ExperimentTemplate = {
  id: 'zebrafish-development',
  name: 'Zebrafish Development Study',
  version: '1.0.0',
  description: 'Track zebrafish development from embryo to adult with morphological assessments',
  author: 'Built-in',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isBuiltIn: true,
  isPublic: true,
  
  species: ZEBRAFISH_SPECIES,
  housingUnit: ZEBRAFISH_TANK,
  
  eventTypes: [
    {
      id: 'developmental-stage',
      name: 'Developmental Stage',
      category: 'observation',
      icon: '🐣',
      color: '#00BCD4',
      description: 'Record developmental milestone',
      requiresDateTime: true,
      allowTrials: false,
      fields: [
        {
          id: 'stage',
          name: 'stage',
          label: 'Stage',
          type: 'select',
          required: true,
          options: [
            { value: 'fertilized', label: 'Fertilized Egg' },
            { value: 'cleavage', label: 'Cleavage' },
            { value: 'gastrula', label: 'Gastrula' },
            { value: 'segmentation', label: 'Segmentation' },
            { value: 'pharyngula', label: 'Pharyngula' },
            { value: 'hatching', label: 'Hatching' },
            { value: 'larva', label: 'Larva' },
            { value: 'juvenile', label: 'Juvenile' },
            { value: 'adult', label: 'Adult' }
          ]
        },
        {
          id: 'morphology',
          name: 'morphology',
          label: 'Morphology Notes',
          type: 'textarea',
          required: false
        }
      ]
    },
    {
      id: 'water-quality',
      name: 'Water Quality Check',
      category: 'care',
      icon: '💧',
      color: '#03A9F4',
      description: 'Monitor water parameters',
      requiresDateTime: true,
      allowTrials: false,
      fields: [
        {
          id: 'temperature',
          name: 'temperature',
          label: 'Temperature',
          type: 'number',
          required: true,
          unit: '°C',
          validation: { min: 24, max: 30 }
        },
        {
          id: 'pH',
          name: 'pH',
          label: 'pH',
          type: 'number',
          required: true,
          validation: { min: 6.5, max: 8.5 }
        },
        {
          id: 'conductivity',
          name: 'conductivity',
          label: 'Conductivity',
          type: 'number',
          required: false,
          unit: 'μS/cm'
        }
      ]
    }
  ],
  
  protocols: [
    {
      id: 'early-development',
      name: 'Early Development (0-5 dpf)',
      description: 'Monitor early embryonic and larval development',
      category: 'Development',
      totalDays: 5,
      timeline: [
        { day: 0, dayLabel: '0 hpf', eventTypeIds: ['developmental-stage'], notes: 'Fertilization', required: true },
        { day: 1, dayLabel: '24 hpf', eventTypeIds: ['developmental-stage'], notes: 'Segmentation', required: true },
        { day: 2, dayLabel: '48 hpf', eventTypeIds: ['developmental-stage'], notes: 'Hatching period', required: true },
        { day: 3, dayLabel: '72 hpf', eventTypeIds: ['developmental-stage'], notes: 'Early larva', required: true },
        { day: 5, dayLabel: '5 dpf', eventTypeIds: ['developmental-stage'], notes: 'Free-swimming larva', required: true }
      ]
    }
  ],
  
  experimentFields: [],
  
  groupsConfig: {
    enabled: true,
    allowMultiple: false,
    predefinedGroups: [
      { id: 'control', name: 'Control', color: '#4CAF50' },
      { id: 'treatment', name: 'Treatment', color: '#2196F3' }
    ]
  },
  
  tags: ['zebrafish', 'development', 'embryology']
};

export const BUILT_IN_TEMPLATES: ExperimentTemplate[] = [
  MOUSE_PARKINSONS_TEMPLATE,
  ZEBRAFISH_DEVELOPMENT_TEMPLATE
];

// Made with Bob
