# V2 Data Model Migration Guide

## Overview

This document ensures all developers understand the V2 data model to prevent bugs like the "can't add subject" issue.

## Critical V2 Data Structure

### Subject (V2Subject)

```javascript
{
  id: "subject_abc123",              // Unique ID (generated)
  housingUnitId: "unit_xyz789",      // Parent housing unit
  experimentId: "exp_def456",        // Parent experiment
  subjectId: "Subject-1",            // ✅ Human-readable identifier
  slot: 1,                           // Position in housing unit
  status: "alive",                   // ✅ LOWERCASE: 'alive' | 'deceased' | 'removed' | 'transferred'
  statusDate: "2024-01-15T10:30:00Z",
  customFieldValues: {               // ✅ Custom fields in object
    genotype: "WT",
    sex: "M",
    dob: "2024-01-01"
  },
  groupId: "",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T10:30:00Z",
  notes: ""
}
```

### Housing Unit (V2HousingUnit)

```javascript
{
  id: "unit_xyz789",
  experimentId: "exp_def456",
  name: "Cage 1",                    // ✅ Display name
  capacity: 10,                      // Maximum subjects
  location: "Room A, Rack 3",
  customFieldValues: {},
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T10:30:00Z",
  notes: ""
}
```

## Common Mistakes to Avoid

### ❌ WRONG: Nested subject identifier
```javascript
const name = subject.subject.identifier;  // WRONG!
```

### ✅ CORRECT: Flat subject identifier
```javascript
const name = subject.subjectId;  // CORRECT!
```

---

### ❌ WRONG: Uppercase status
```javascript
subject.status = "ALIVE";  // WRONG!
```

### ✅ CORRECT: Lowercase status
```javascript
subject.status = "alive";  // CORRECT!
```

---

### ❌ WRONG: Custom fields as root properties
```javascript
subject.genotype = "WT";  // WRONG!
```

### ✅ CORRECT: Custom fields in customFieldValues
```javascript
subject.customFieldValues.genotype = "WT";  // CORRECT!
```

---

### ❌ WRONG: Using "cage" terminology
```javascript
const cage = housingUnits.find(...);  // WRONG!
```

### ✅ CORRECT: Using "housingUnit" terminology
```javascript
const housingUnit = housingUnits.find(...);  // CORRECT!
```

## API Function Signatures

### addSubject
```javascript
/**
 * @param {string} housingUnitId - ID of housing unit
 * @param {string} subjectId - Human-readable identifier (e.g., "Subject-1")
 * @returns {string} Generated unique ID
 */
api.addSubject(housingUnitId, subjectId)

// ✅ CORRECT
api.addSubject("unit_123", "Subject-1");

// ❌ WRONG
api.addSubject({ housingUnitId: "unit_123", subjectId: "Subject-1" });
```

### updateSubject
```javascript
/**
 * @param {string} subjectId - Subject's unique ID
 * @param {Object} patch - Fields to update
 */
api.updateSubject(subjectId, patch)

// ✅ CORRECT
api.updateSubject("subject_123", { status: "deceased" });
```

### updateSubjectFields
```javascript
/**
 * @param {string} subjectId - Subject's unique ID
 * @param {Object} fields - Custom fields to update
 */
api.updateSubjectFields(subjectId, fields)

// ✅ CORRECT
api.updateSubjectFields("subject_123", { genotype: "WT", sex: "M" });
```

## Component Prop Patterns

### HousingUnitView
```javascript
<HousingUnitView
  housingUnit={housingUnit}           // V2HousingUnit object
  subjects={subjects}                 // V2Subject[] array
  template={template}                 // V2Template object
  onSelectSubject={(subject) => {}}   // Callback with V2Subject
  onAddSubject={(unitId, slot) => {}} // ✅ Two parameters!
  onDeleteSubject={(subjectId) => {}} // Subject's unique ID
/>
```

### SubjectDrawerV2
```javascript
<SubjectDrawerV2
  subject={subject}                   // V2Subject object
  housingUnit={housingUnit}           // V2HousingUnit object
  experiment={experiment}             // V2Experiment object
  template={template}                 // V2Template object
  events={events}                     // V2Event[] array
  api={api}                           // API object from useAppStateV2
/>
```

## Status Values

Always use lowercase status values:

```javascript
const VALID_STATUSES = ['alive', 'deceased', 'removed', 'transferred'];

// ✅ CORRECT
if (subject.status === 'alive') { ... }

// ❌ WRONG
if (subject.status === 'ALIVE') { ... }
```

## Displaying Subject Information

```javascript
// ✅ CORRECT: Access subject identifier
const identifier = subject.subjectId || `Subject ${subject.slot}`;

// ✅ CORRECT: Access custom fields
const genotype = subject.customFieldValues?.genotype || 'Unknown';

// ✅ CORRECT: Check status
const isAlive = subject.status === 'alive';

// ❌ WRONG: Nested access
const identifier = subject.subject?.identifier;  // WRONG!
```

## Type Checking

Use JSDoc comments for type safety:

```javascript
/**
 * @param {V2Subject} subject - The subject to process
 * @returns {string} Formatted display name
 */
function getSubjectDisplayName(subject) {
  return subject.subjectId || `Subject ${subject.slot}`;
}
```

## Migration Checklist

When creating or modifying V2 components:

- [ ] Import type definitions: `import '../types/v2-data-model.js'`
- [ ] Add JSDoc comments with V2 type annotations
- [ ] Use `subject.subjectId` NOT `subject.subject.identifier`
- [ ] Use lowercase status values
- [ ] Access custom fields via `customFieldValues` object
- [ ] Use "housingUnit" NOT "cage" in variable names
- [ ] Test with actual V2 data structure
- [ ] Verify API function signatures match documentation

## Reference Files

- **Type Definitions**: `src/types/v2-data-model.js`
- **State Management**: `src/storage/useAppStateV2.jsx`
- **Migration Logic**: `src/storage/migration.js`
- **Example Components**:
  - `src/components/HousingUnitView.jsx`
  - `src/components/HousingUnitSidebar.jsx`
  - `src/components/SubjectDrawerV2.jsx`

## Testing V2 Components

```javascript
// Create test data following V2 structure
const testSubject = {
  id: "test_subject_1",
  housingUnitId: "test_unit_1",
  experimentId: "test_exp_1",
  subjectId: "Test-Subject-1",  // ✅ Flat property
  slot: 1,
  status: "alive",              // ✅ Lowercase
  statusDate: new Date().toISOString(),
  customFieldValues: {          // ✅ Object for custom fields
    genotype: "WT",
    sex: "M"
  },
  groupId: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  notes: ""
};
```

## Questions?

If you're unsure about the V2 data structure:

1. Check `src/types/v2-data-model.js` for type definitions
2. Look at existing V2 components for examples
3. Review this migration guide
4. Test with console.log to verify data structure

**Remember**: When in doubt, log the actual data structure and verify it matches V2 format!