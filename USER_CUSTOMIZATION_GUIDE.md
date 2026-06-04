# User Customization Guide - Create Your Own Research Templates

## 🎯 Overview

This platform is **completely customizable** for ANY type of in vivo research. You can create templates for:
- Any animal species (mice, rats, zebrafish, flies, worms, primates, birds, etc.)
- Any research type (behavior, physiology, genetics, pharmacology, etc.)
- Any assay or measurement (current or future discoveries)
- Any protocol or schedule

**No coding required** - Everything is configurable through the template system.

## 🔧 Core Concept: Everything is Customizable

### What You Can Customize

1. **Species/Subject Type** - Define what you're studying
2. **Housing Units** - Define where subjects are kept
3. **Subject Fields** - What information to track per subject
4. **Event Types** - What actions/observations can occur
5. **Protocols** - Schedules and timelines
6. **Groups** - Experimental groups/cohorts
7. **Treatments** - Drugs, interventions, etc.

### No Hardcoded Limitations

- ✅ Add unlimited custom fields
- ✅ Create any event type you need
- ✅ Define your own categories
- ✅ Use any units of measurement
- ✅ Track any data points
- ✅ Design any protocol schedule

## 📝 Creating a Custom Template

### Example 1: Drosophila (Fruit Fly) Sleep Study

```javascript
import { TemplateBuilder, FieldBuilders } from './core/schema/templateBuilder';

const flyTemplate = new TemplateBuilder(
  'Drosophila Sleep Study',
  'Track sleep patterns in fruit flies'
)
  // Define the species
  .setSpecies({
    name: 'Fruit Fly',
    pluralName: 'Fruit Flies',
    icon: '🪰',
    ageUnits: 'days',
    weightUnit: 'mg'
  })
  
  // Add custom fields for flies
  .addSubjectField(FieldBuilders.text('flyId', 'Fly ID', true))
  .addSubjectField(FieldBuilders.select('sex', 'Sex', ['Male', 'Female'], true))
  .addSubjectField(FieldBuilders.text('genotype', 'Genotype'))
  .addSubjectField(FieldBuilders.number('age', 'Age', false, 'days'))
  
  // Define housing (vials instead of cages)
  .setHousingUnit({
    name: 'Vial',
    pluralName: 'Vials',
    icon: '🧪',
    defaultCapacity: 20,
    allowVariableCapacity: true
  })
  .addHousingUnitField(FieldBuilders.text('position', 'Incubator Position'))
  .addHousingUnitField(FieldBuilders.number('temperature', 'Temperature', false, '°C'))
  
  // Add custom event types
  .addEventType({
    name: 'Sleep Recording',
    category: 'measurement',
    icon: '😴',
    color: '#9C27B0',
    description: 'Automated sleep tracking',
    allowTrials: false,
    fields: [
      FieldBuilders.number('totalSleep', 'Total Sleep', true, 'minutes'),
      FieldBuilders.number('sleepBouts', 'Sleep Bouts', true, 'count'),
      FieldBuilders.number('avgBoutLength', 'Avg Bout Length', false, 'minutes')
    ]
  })
  .addEventType({
    name: 'Activity Monitoring',
    category: 'measurement',
    icon: '🏃',
    color: '#FF9800',
    allowTrials: true,
    fields: [
      FieldBuilders.select('timeOfDay', 'Time Period', ['Morning', 'Afternoon', 'Evening', 'Night'], true)
    ],
    trialFields: [
      FieldBuilders.number('beamCrosses', 'Beam Crosses', true, 'count'),
      FieldBuilders.number('duration', 'Duration', true, 'minutes')
    ]
  })
  
  // Define protocol
  .addProtocol({
    name: '7-Day Sleep Protocol',
    description: 'Baseline + intervention + recovery',
    timeline: [
      { day: 0, dayLabel: 'Day 0-2 (Baseline)', eventTypeNames: ['Sleep Recording', 'Activity Monitoring'], required: true },
      { day: 3, dayLabel: 'Day 3-5 (Sleep Deprivation)', eventTypeNames: ['Sleep Recording', 'Activity Monitoring'], required: true },
      { day: 6, dayLabel: 'Day 6-7 (Recovery)', eventTypeNames: ['Sleep Recording', 'Activity Monitoring'], required: true }
    ]
  })
  
  .setGroupsConfig({
    enabled: true,
    predefinedGroups: [
      { name: 'Control', color: '#4CAF50' },
      { name: 'Sleep Deprived', color: '#F44336' }
    ]
  })
  
  .addTags('drosophila', 'sleep', 'behavior')
  .build();
```

### Example 2: C. elegans Lifespan Study

```javascript
const wormTemplate = new TemplateBuilder(
  'C. elegans Lifespan Study',
  'Track lifespan and healthspan in nematodes'
)
  .setSpecies({
    name: 'C. elegans',
    pluralName: 'Worms',
    icon: '🪱',
    ageUnits: 'days',
    weightUnit: 'μg' // Custom unit!
  })
  
  .addSubjectField(FieldBuilders.text('wormId', 'Worm ID', true))
  .addSubjectField(FieldBuilders.text('strain', 'Strain', true))
  .addSubjectField(FieldBuilders.select('stage', 'Developmental Stage', ['L1', 'L2', 'L3', 'L4', 'Adult']))
  
  .setHousingUnit({
    name: 'Plate',
    pluralName: 'Plates',
    icon: '🧫',
    defaultCapacity: 50,
    allowVariableCapacity: true
  })
  .addHousingUnitField(FieldBuilders.text('plateType', 'Plate Type'))
  .addHousingUnitField(FieldBuilders.text('bacteria', 'Bacterial Strain'))
  
  .addEventType({
    name: 'Lifespan Check',
    category: 'observation',
    icon: '👁️',
    color: '#2196F3',
    allowTrials: false,
    fields: [
      FieldBuilders.number('alive', 'Alive Count', true, 'count'),
      FieldBuilders.number('dead', 'Dead Count', true, 'count'),
      FieldBuilders.number('censored', 'Censored', false, 'count')
    ]
  })
  .addEventType({
    name: 'Motility Assessment',
    category: 'test',
    icon: '🏃',
    color: '#4CAF50',
    allowTrials: true,
    fields: [
      FieldBuilders.select('method', 'Method', ['Gentle Touch', 'Thrashing', 'Pharyngeal Pumping'], true)
    ],
    trialFields: [
      FieldBuilders.select('response', 'Response', ['Normal', 'Reduced', 'None'], true)
    ]
  })
  
  .addProtocol({
    name: 'Standard Lifespan Protocol',
    description: 'Daily checks until all worms deceased',
    timeline: [
      { day: 0, dayLabel: 'Day 0 (L4 stage)', eventTypeNames: ['Lifespan Check'], required: true },
      { day: 1, dayLabel: 'Daily checks', eventTypeNames: ['Lifespan Check'], required: true },
      // Continue daily...
    ]
  })
  
  .addTags('celegans', 'lifespan', 'aging')
  .build();
```

### Example 3: Primate Cognitive Study

```javascript
const primateTemplate = new TemplateBuilder(
  'Primate Cognitive Assessment',
  'Cognitive testing in non-human primates'
)
  .setSpecies({
    name: 'Macaque',
    pluralName: 'Macaques',
    icon: '🐵',
    ageUnits: 'years',
    weightUnit: 'kg'
  })
  
  .addSubjectField(FieldBuilders.text('animalId', 'Animal ID', true))
  .addSubjectField(FieldBuilders.number('age', 'Age', true, 'years'))
  .addSubjectField(FieldBuilders.select('sex', 'Sex', ['Male', 'Female'], true))
  .addSubjectField(FieldBuilders.text('species', 'Species'))
  .addSubjectField(FieldBuilders.date('birthDate', 'Birth Date'))
  
  .setHousingUnit({
    name: 'Enclosure',
    pluralName: 'Enclosures',
    icon: '🏠',
    defaultCapacity: 4,
    allowVariableCapacity: true
  })
  .addHousingUnitField(FieldBuilders.text('location', 'Facility Location'))
  .addHousingUnitField(FieldBuilders.select('socialGroup', 'Social Group', ['Single', 'Pair', 'Group']))
  
  .addEventType({
    name: 'Delayed Match to Sample',
    category: 'cognitive-test',
    icon: '🧠',
    color: '#9C27B0',
    description: 'Working memory assessment',
    allowTrials: true,
    fields: [
      FieldBuilders.number('delayDuration', 'Delay Duration', true, 'seconds'),
      FieldBuilders.select('difficulty', 'Difficulty', ['Easy', 'Medium', 'Hard'], true)
    ],
    trialFields: [
      FieldBuilders.select('correct', 'Correct', ['Yes', 'No'], true),
      FieldBuilders.number('responseTime', 'Response Time', true, 'ms')
    ]
  })
  .addEventType({
    name: 'Social Interaction',
    category: 'observation',
    icon: '👥',
    color: '#FF9800',
    allowTrials: false,
    fields: [
      FieldBuilders.number('duration', 'Observation Duration', true, 'minutes'),
      FieldBuilders.textarea('behaviors', 'Observed Behaviors', true),
      FieldBuilders.select('dominance', 'Dominance Display', ['None', 'Low', 'Medium', 'High'])
    ]
  })
  
  .addProtocol({
    name: 'Cognitive Battery',
    description: 'Comprehensive cognitive assessment',
    timeline: [
      { day: 0, dayLabel: 'Week 1 (Training)', eventTypeNames: ['Delayed Match to Sample'], required: true },
      { day: 7, dayLabel: 'Week 2 (Testing)', eventTypeNames: ['Delayed Match to Sample', 'Social Interaction'], required: true }
    ]
  })
  
  .addTags('primate', 'cognition', 'behavior')
  .build();
```

### Example 4: Future Unknown Assay

```javascript
// This template shows how to handle completely novel assays
// that don't exist yet - fully customizable!

const futureTemplate = new TemplateBuilder(
  'Novel Assay Template',
  'Template for future research discoveries'
)
  .setSpecies({
    name: 'Research Subject',
    pluralName: 'Research Subjects',
    icon: '🔬',
    ageUnits: 'custom-unit', // Can use ANY unit
    weightUnit: 'custom-weight'
  })
  
  // Add completely custom fields
  .addSubjectField({
    name: 'customField1',
    label: 'Custom Measurement 1',
    type: 'number',
    required: false,
    unit: 'novel-unit',
    description: 'A measurement we just discovered'
  })
  .addSubjectField({
    name: 'customField2',
    label: 'Custom Category',
    type: 'select',
    required: false,
    options: [
      { value: 'type-a', label: 'Novel Type A' },
      { value: 'type-b', label: 'Novel Type B' },
      { value: 'type-c', label: 'Novel Type C' }
    ]
  })
  
  .setHousingUnit({
    name: 'Custom Container',
    pluralName: 'Custom Containers',
    defaultCapacity: 1,
    allowVariableCapacity: true
  })
  
  // Add event type for brand new assay
  .addEventType({
    name: 'Novel Assay',
    category: 'new-category', // Can create new categories!
    icon: '✨',
    color: '#E91E63',
    description: 'A newly developed assay',
    allowTrials: true,
    fields: [
      {
        name: 'parameter1',
        label: 'Novel Parameter 1',
        type: 'number',
        required: true,
        unit: 'new-unit'
      },
      {
        name: 'parameter2',
        label: 'Novel Parameter 2',
        type: 'text',
        required: false
      }
    ],
    trialFields: [
      {
        name: 'measurement',
        label: 'Novel Measurement',
        type: 'number',
        required: true,
        unit: 'discovery-unit'
      }
    ]
  })
  
  .addTags('novel', 'future', 'custom')
  .build();
```

## 🎨 Field Types Available

You can use any of these field types in your templates:

| Type | Description | Example Use |
|------|-------------|-------------|
| `text` | Single-line text | IDs, names, short notes |
| `textarea` | Multi-line text | Detailed observations, protocols |
| `number` | Numeric values | Measurements, counts, scores |
| `date` | Date picker | Birth dates, experiment dates |
| `datetime` | Date + time | Event timestamps |
| `time` | Time only | Time of day for events |
| `select` | Dropdown menu | Categories, predefined options |
| `multiselect` | Multiple selections | Multiple symptoms, behaviors |
| `checkbox` | Yes/No | Binary flags |
| `email` | Email address | Contact information |
| `url` | Web address | References, protocols |

## 🔄 Validation Options

Add validation to ensure data quality:

```javascript
.addSubjectField({
  name: 'weight',
  label: 'Weight',
  type: 'number',
  required: true,
  unit: 'g',
  validation: {
    min: 0,
    max: 100,
    // Custom validation function
    custom: (value) => {
      if (value < 15) return 'Weight seems too low, please verify';
      return true;
    }
  }
})
```

## 📊 Conditional Fields

Show/hide fields based on other field values:

```javascript
.addEventType({
  name: 'Treatment',
  fields: [
    FieldBuilders.select('treatmentType', 'Type', ['Drug', 'Surgery', 'Other'], true),
    {
      name: 'drugName',
      label: 'Drug Name',
      type: 'text',
      required: true,
      conditional: {
        field: 'treatmentType',
        value: 'Drug'
      }
    },
    {
      name: 'surgeryType',
      label: 'Surgery Type',
      type: 'text',
      required: true,
      conditional: {
        field: 'treatmentType',
        value: 'Surgery'
      }
    }
  ]
})
```

## 🔢 Trials/Repetitions

For measurements that need multiple trials:

```javascript
.addEventType({
  name: 'Behavioral Test',
  allowTrials: true, // Enable trials
  fields: [
    // Fields that apply to the whole session
    FieldBuilders.select('testType', 'Test Type', ['Test A', 'Test B'], true)
  ],
  trialFields: [
    // Fields that repeat for each trial
    FieldBuilders.number('score', 'Score', true),
    FieldBuilders.number('latency', 'Latency', true, 'seconds')
  ]
})
```

## 📅 Protocol Timelines

Define when events should occur:

```javascript
.addProtocol({
  name: 'My Protocol',
  description: 'Detailed protocol description',
  timeline: [
    {
      day: -7,
      dayLabel: 'Day -7 (Baseline)',
      eventTypeNames: ['Baseline Measurement'],
      notes: 'Collect baseline data',
      required: true,
      timeOfDay: '09:00'
    },
    {
      day: 0,
      dayLabel: 'Day 0 (Intervention)',
      eventTypeNames: ['Treatment', 'Observation'],
      notes: 'Administer treatment',
      required: true
    },
    {
      day: 7,
      dayLabel: 'Day 7 (Follow-up)',
      eventTypeNames: ['Measurement', 'Observation'],
      required: true
    }
  ]
})
```

## 💾 Saving and Sharing Templates

### Export Template
```javascript
const template = new TemplateBuilder(...)
  .build();

// Export as JSON
const json = JSON.stringify(template, null, 2);
// Save to file or share with colleagues
```

### Import Template
```javascript
import { TemplateBuilder } from './core/schema/templateBuilder';

const jsonString = '...'; // Load from file
const template = TemplateBuilder.fromJSON(jsonString);
```

## 🎯 Best Practices

### 1. Start Simple
- Begin with essential fields
- Add complexity as needed
- Test with sample data

### 2. Use Clear Names
- Descriptive labels: "Body Weight (g)" not "wt"
- Consistent naming: "subjectId" not "id" or "subject_id"
- Add help text for clarity

### 3. Add Validation
- Set min/max for numbers
- Use required fields appropriately
- Add custom validation for complex rules

### 4. Plan for Scale
- Consider how many subjects you'll have
- Think about data export needs
- Plan for long-term storage

### 5. Document Everything
- Add descriptions to event types
- Include notes in protocols
- Use tags for organization

## 🚀 Advanced Features

### Custom Units
Use ANY unit of measurement:
```javascript
.addSubjectField(FieldBuilders.number('measurement', 'Custom Measurement', false, 'novel-unit'))
```

### Custom Categories
Create your own event categories:
```javascript
.addEventType({
  name: 'My Event',
  category: 'my-custom-category', // Any string!
  ...
})
```

### Flexible Capacity
Allow variable housing unit sizes:
```javascript
.setHousingUnit({
  name: 'Container',
  defaultCapacity: 10,
  allowVariableCapacity: true // Users can override
})
```

## 📖 Summary

**Key Points:**
- ✅ No coding required for customization
- ✅ Works with ANY species
- ✅ Supports ANY assay or measurement
- ✅ Completely flexible field system
- ✅ Future-proof for new discoveries
- ✅ Templates can be shared and reused

**You can create templates for:**
- Any animal model (existing or future)
- Any research type (behavior, physiology, genetics, etc.)
- Any measurement or assay (current or yet to be discovered)
- Any protocol or schedule
- Any data structure you need

The system is designed to adapt to YOUR research needs, not force you to adapt to the software!