# InVivo Research Management Platform - Implementation Guide

## Overview

This guide explains the new flexible architecture that transforms the mouse-specific app into a fully customizable in vivo research management platform.

## What's New

### 🎯 Core Features

1. **Flexible Schema System** - Define custom experiments for any species
2. **Template-Based Approach** - Pre-built templates for common research types
3. **Dynamic Field Definitions** - Add custom fields to any entity
4. **Multi-Species Support** - Mice, zebrafish, rats, and custom species
5. **Advanced Export** - JSON, CSV with full data export capabilities
6. **Validation System** - Robust data validation and sanitization
7. **Protocol Designer** - Define experimental schedules and timelines

### 📁 New File Structure

```
src/
├── core/
│   ├── schema/
│   │   ├── types.ts              # TypeScript type definitions
│   │   ├── builtInTemplates.ts   # Pre-built experiment templates
│   │   └── validation.ts         # Validation utilities
│   └── export/
│       └── exportUtils.ts        # Export to JSON/CSV
├── components/                    # (existing UI components)
├── storage/                       # (existing storage layer)
└── models/                        # (legacy - to be migrated)
```

## Key Concepts

### 1. Experiment Templates

Templates define the structure of an experiment:

```typescript
interface ExperimentTemplate {
  id: string;
  name: string;
  species: SpeciesConfig;           // What animals?
  housingUnit: HousingUnitConfig;   // Cages, tanks, etc.
  eventTypes: EventTypeDefinition[]; // What can happen?
  protocols: ProtocolDefinition[];   // Schedules
  experimentFields: FieldDefinition[]; // Custom fields
}
```

**Built-in Templates:**
- Mouse Parkinson's Model (6-OHDA)
- Zebrafish Development Study
- (More to be added)

### 2. Field Definitions

Fields are the building blocks for custom forms:

```typescript
interface FieldDefinition {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | ...;
  required: boolean;
  validation?: FieldValidation;
  options?: Array<{ value: string; label: string }>;
  conditional?: { field: string; value: any };
}
```

**Supported Field Types:**
- `text` - Single-line text
- `textarea` - Multi-line text
- `number` - Numeric values with min/max
- `date` / `datetime` / `time` - Date/time pickers
- `select` - Dropdown menu
- `multiselect` - Multiple selection
- `checkbox` - Boolean
- `email` / `url` - Validated inputs

### 3. Event Types

Events represent actions or observations:

```typescript
interface EventTypeDefinition {
  id: string;
  name: string;
  category: 'care' | 'injection' | 'test' | ...;
  fields: FieldDefinition[];
  allowTrials: boolean;  // Can have multiple trials?
  trialFields?: FieldDefinition[];
}
```

### 4. Protocols

Protocols define experimental schedules:

```typescript
interface ProtocolDefinition {
  id: string;
  name: string;
  timeline: Array<{
    day: number;
    eventTypeIds: string[];
    notes?: string;
    required: boolean;
  }>;
}
```

## Migration Path

### Phase 1: Foundation (Current)
✅ Created flexible schema system
✅ Built-in templates for mice and zebrafish
✅ Validation system
✅ Export utilities (JSON, CSV)
✅ Fixed critical bugs (cage deletion)

### Phase 2: Integration (Next Steps)

1. **Update Storage Layer**
   - Migrate from current state structure to new schema
   - Add template management
   - Implement experiment instances

2. **Create UI Components**
   - Template selector
   - Dynamic form renderer (based on FieldDefinitions)
   - Protocol timeline view
   - Enhanced event dialog

3. **Migrate Existing Data**
   - Convert current cohorts to templates
   - Map existing cages to housing units
   - Convert mice to subjects
   - Preserve all existing events

### Phase 3: New Features

1. **Template Builder UI**
   - Visual template editor
   - Custom field creator
   - Protocol designer
   - Event type builder

2. **Enhanced Analysis**
   - Statistical calculations
   - Data visualization
   - Report generation

3. **Advanced Features**
   - Multi-project support
   - Collaboration tools
   - Cloud sync (optional)

## Usage Examples

### Creating a Custom Template

```typescript
import { ExperimentTemplate, FieldDefinition } from './core/schema/types';

const myTemplate: ExperimentTemplate = {
  id: 'custom-rat-study',
  name: 'Rat Behavioral Study',
  version: '1.0.0',
  description: 'Custom rat behavioral research',
  
  species: {
    id: 'rat',
    name: 'Rat',
    type: 'rat',
    pluralName: 'Rats',
    ageUnits: 'weeks',
    weightUnit: 'g',
    defaultFields: [
      {
        id: 'ratId',
        name: 'ratId',
        label: 'Rat ID',
        type: 'text',
        required: true
      },
      // ... more fields
    ]
  },
  
  housingUnit: {
    id: 'rat-cage',
    name: 'Cage',
    pluralName: 'Cages',
    defaultCapacity: 4,
    allowVariableCapacity: true,
    customFields: []
  },
  
  eventTypes: [
    {
      id: 'morris-water-maze',
      name: 'Morris Water Maze',
      category: 'test',
      allowTrials: true,
      requiresDateTime: true,
      fields: [
        {
          id: 'platform',
          name: 'platform',
          label: 'Platform Location',
          type: 'select',
          required: true,
          options: [
            { value: 'NE', label: 'Northeast' },
            { value: 'NW', label: 'Northwest' },
            { value: 'SE', label: 'Southeast' },
            { value: 'SW', label: 'Southwest' }
          ]
        }
      ],
      trialFields: [
        {
          id: 'latency',
          name: 'latency',
          label: 'Latency to Platform',
          type: 'number',
          required: true,
          unit: 'seconds'
        }
      ]
    }
  ],
  
  protocols: [
    {
      id: 'standard-mwm',
      name: 'Standard Morris Water Maze Protocol',
      description: '5 days of training, 1 day probe trial',
      totalDays: 6,
      timeline: [
        {
          day: 1,
          eventTypeIds: ['morris-water-maze'],
          notes: '4 trials, 60s max',
          required: true
        },
        // ... more days
      ]
    }
  ],
  
  experimentFields: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
```

### Validating Data

```typescript
import { validateFields, sanitizeFieldValues } from './core/schema/validation';

const fields: FieldDefinition[] = [
  {
    id: 'weight',
    name: 'weight',
    label: 'Weight',
    type: 'number',
    required: true,
    validation: { min: 0, max: 100 }
  }
];

const values = { weight: '25.5' };

// Validate
const result = validateFields(values, fields);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}

// Sanitize (converts string to number)
const sanitized = sanitizeFieldValues(values, fields);
// sanitized.weight is now 25.5 (number)
```

### Exporting Data

```typescript
import { exportToJson, exportSubjectsToCSV, downloadJson } from './core/export/exportUtils';

// Export all data as JSON
const jsonData = exportToJson(state, {
  includeTemplates: true,
  experimentIds: ['exp-1', 'exp-2']
});
downloadJson(jsonData, 'my-experiments.json');

// Export subjects as CSV
const csvData = exportSubjectsToCSV(
  subjects,
  housingUnits,
  experiments,
  template
);
downloadCSV(csvData, 'subjects.csv');
```

## Best Practices

### 1. Template Design

- **Start Simple**: Begin with essential fields, add complexity later
- **Use Validation**: Add min/max, patterns to ensure data quality
- **Provide Defaults**: Set sensible default values
- **Add Help Text**: Use `helpText` and `description` fields
- **Group Related Fields**: Use consistent naming conventions

### 2. Field Naming

- Use camelCase for field IDs: `mouseId`, `injectionDate`
- Use descriptive labels: "Mouse ID", "Injection Date"
- Keep IDs stable (don't change them after data collection starts)

### 3. Event Types

- Create specific event types rather than generic ones
- Use trials for repeated measurements (e.g., behavioral tests)
- Add appropriate validation to prevent data entry errors
- Use conditional fields to show/hide based on context

### 4. Protocols

- Define clear day labels: "Day 0 (Baseline)", "Day 7 (Post-injection)"
- Mark critical timepoints as required
- Add detailed notes for each step
- Include time-of-day when timing is critical

### 5. Data Export

- Export regularly as backup
- Use JSON for complete data preservation
- Use CSV for analysis in other tools (R, Python, Excel)
- Include summaries for quick overview

## Performance Considerations

### For Large Datasets

1. **Pagination**: Load data in chunks
2. **Virtual Scrolling**: For long lists
3. **Lazy Loading**: Load events on-demand
4. **Indexing**: Use indexed database queries
5. **Memoization**: Cache expensive calculations

### Storage Limits

- **IndexedDB**: ~50MB typical, up to 1GB+ possible
- **SQLite (via Tauri)**: Unlimited (disk space)
- **Recommendation**: Use SQLite for production deployments

## Security & Privacy

- All data stored locally by default
- No telemetry or tracking
- Export/import for backup and sharing
- Future: Optional encryption for sensitive data

## Troubleshooting

### Common Issues

**Q: Template not showing up?**
A: Check that it's added to `BUILT_IN_TEMPLATES` array

**Q: Validation failing unexpectedly?**
A: Check field types match data types (string vs number)

**Q: Export not working?**
A: Ensure browser allows downloads, check console for errors

**Q: Performance slow with many subjects?**
A: Implement pagination, use virtual scrolling

## Next Steps

1. **Review** the architecture document (ARCHITECTURE.md)
2. **Explore** built-in templates (src/core/schema/builtInTemplates.ts)
3. **Test** validation system (src/core/schema/validation.ts)
4. **Try** export utilities (src/core/export/exportUtils.ts)
5. **Plan** UI integration (Phase 2)

## Contributing

When adding new features:

1. Follow TypeScript types strictly
2. Add validation for all user inputs
3. Write tests for core logic
4. Document new templates and fields
5. Consider backward compatibility

## Support

For questions or issues:
- Check ARCHITECTURE.md for design decisions
- Review type definitions in types.ts
- Look at built-in templates for examples
- Test with validation utilities

---

**Version**: 2.0.0-alpha  
**Last Updated**: 2026-06-02  
**Status**: Foundation Complete, UI Integration In Progress