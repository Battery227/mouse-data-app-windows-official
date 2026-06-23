# Comprehensive Bug Review & Fixes

## Date: June 14, 2026
## Status: Post-User Testing Phase

---

## Bugs Fixed in This Session

### 1. ✅ FIXED: Can't Add Subjects
**Issue:** `onAddSubject` callback had wrong signature - expected data object but API takes two parameters.

**Root Cause:** Mismatch between component prop signature and API function signature.

**Fix:**
```javascript
// BEFORE (broken)
onAddSubject={(data) => api.addSubject({ ...data })}

// AFTER (fixed)
onAddSubject={(housingUnitId, slot) => api.addSubject(housingUnitId, `Subject-${slot}`)}
```

**Files Changed:**
- `src/AppV2.jsx` - Fixed callback signature
- `src/components/HousingUnitView.jsx` - Fixed handleAddSubject

---

### 2. ✅ FIXED: Form Fields Reset While Typing
**Issue:** User types in field, text gets replaced with placeholder or blank.

**Root Cause:** Race condition in `useEffect` - every time subject prop updated (after save), it reset local state, overwriting user input.

**Fix:**
```javascript
// BEFORE (broken)
React.useEffect(() => {
  if (open) {
    setFieldValues(subject?.customFieldValues || {});  // Resets on every subject change
  }
}, [open, subject]);  // Triggers too often

// AFTER (fixed)
const subjectIdRef = React.useRef(subject?.id);
React.useEffect(() => {
  if (open && subject?.id !== subjectIdRef.current) {  // Only on subject switch
    setFieldValues(subject?.customFieldValues || {});
    subjectIdRef.current = subject?.id;
  }
}, [open, subject?.id, subject?.customFieldValues]);
```

**Files Changed:**
- `src/components/SubjectDrawerV2.jsx` - Fixed useEffect dependencies and added ref tracking

---

### 3. ✅ FIXED: Capacity Shows Full When Slots Available
**Issue:** Delete subject in slot 6, capacity shows 9/10 but "Add Subject" button disabled saying "at capacity".

**Root Cause:** Used `subjects.length` instead of counting occupied slots. When subject deleted, array length doesn't change if slots aren't compacted.

**Fix:**
```javascript
// BEFORE (broken)
const currentCount = subjects.length;
const atCapacity = currentCount >= capacity;

// AFTER (fixed)
const slots = Array.from({ length: capacity }, (_, i) => {
  const slot = i + 1;
  const subject = subjects.find(s => s.slot === slot);
  return { slot, subject };
});
const occupiedSlots = slots.filter(s => s.subject).length;
const atCapacity = occupiedSlots >= capacity;
```

**Files Changed:**
- `src/components/HousingUnitView.jsx` - Fixed capacity calculation logic

---

### 4. ✅ FIXED: Can't Add Events in New Experiments
**Issue:** Created new experiment, added subjects, but couldn't add events.

**Root Cause:** EventDialog component not imported/rendered in SubjectDrawerV2. Button existed but did nothing.

**Fix:**
- Created `EventDialogV2.jsx` - V2-compatible event dialog
- Added import and render in SubjectDrawerV2
- Wired up to `api.addEvent`

**Files Changed:**
- `src/components/EventDialogV2.jsx` (NEW) - V2 event creation dialog
- `src/components/SubjectDrawerV2.jsx` - Added EventDialogV2 import and render

---

## Known Issues (Not Yet Fixed)

### 1. ⚠️ Template Editing Not Available
**Issue:** User asked "can i edit a specific experiment design after its been created?"

**Current State:** No UI for editing templates after experiment creation.

**Impact:** Medium - Users can't modify experiment structure without creating new experiment.

**Proposed Fix:** Add template editor UI accessible from experiment settings.

---

### 2. ⚠️ No Template Builder UI
**Issue:** Users can't create custom templates through UI.

**Current State:** Templates are code-based (TypeScript files).

**Impact:** High - Limits customization to developers only.

**Proposed Fix:** Build TemplateBuilder component (already exists but not wired to UI).

---

### 3. ⚠️ Event Types Limited
**Issue:** EventDialogV2 uses hardcoded event types, doesn't fully leverage template event definitions.

**Current State:** Basic event categories work, but not template-specific event types.

**Impact:** Low - Basic functionality works, but not fully utilizing template system.

**Proposed Fix:** Enhance EventDialogV2 to read event types from template.eventTypes array.

---

## Potential Issues to Monitor

### 1. 🔍 Storage Persistence
**Status:** Fixed in Phase 1, but needs ongoing testing.

**What to Watch:**
- Data actually saves in both browser and Tauri modes
- Save indicators accurate
- No data loss on reload

**Test:** Create data, reload page, verify data persists.

---

### 2. 🔍 Migration Reliability
**Status:** V1→V2 migration implemented, but needs real-world testing.

**What to Watch:**
- Old V1 data migrates correctly
- No data corruption
- Status values normalize properly

**Test:** Import old V1 JSON, verify all data appears correctly.

---

### 3. 🔍 Multi-Experiment Switching
**Status:** Implemented but lightly tested.

**What to Watch:**
- Switching experiments doesn't mix data
- Housing units filter correctly by experiment
- Events associate with correct experiment

**Test:** Create 2+ experiments, switch between them, verify data isolation.

---

## Code Quality Improvements Made

### 1. ✅ Type Documentation
- Created `src/types/v2-data-model.js` with comprehensive JSDoc types
- Added JSDoc comments to all V2 components
- Documented common mistakes

### 2. ✅ Migration Guide
- Created `V2_MIGRATION_GUIDE.md` with examples
- Side-by-side correct vs incorrect patterns
- API function signatures documented

### 3. ✅ README Updates
- Added V2 Data Model section
- Quick reference for developers
- Links to detailed documentation

---

## Testing Checklist

### Core Functionality
- [x] Add housing unit
- [x] Delete housing unit
- [x] Add subject
- [x] Delete subject
- [x] Edit subject fields
- [x] Add event
- [x] Delete event
- [x] Mark subject deceased
- [x] Switch experiments
- [x] Export data
- [x] Import data

### Edge Cases
- [x] Delete subject from middle slot, add new subject (fills empty slot)
- [x] Fill housing unit to capacity (button disables)
- [x] Type in form fields rapidly (no reset/flicker)
- [x] Switch between subjects (each keeps own data)
- [ ] Create experiment with custom template
- [ ] Edit experiment template after creation
- [ ] Import V1 data (migration)

### Browser Compatibility
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Tauri desktop app

---

## Performance Notes

### Current Performance
- ✅ Form fields responsive (no lag)
- ✅ Subject list renders quickly (<100 subjects)
- ✅ Event list renders quickly (<50 events per subject)
- ⚠️ Not tested with large datasets (1000+ subjects)

### Potential Optimizations
1. Virtualize subject grid for large housing units
2. Paginate event lists for subjects with many events
3. Debounce auto-save on field changes
4. Memoize expensive computations

---

## Security Considerations

### Current State
- ✅ No external API calls (offline-first)
- ✅ Data stored locally (browser IndexedDB or Tauri SQLite)
- ✅ No authentication needed (single-user desktop app)
- ⚠️ No data encryption at rest

### Future Considerations
1. Add data encryption for sensitive research data
2. Implement backup/restore with encryption
3. Add export password protection option
4. Consider multi-user scenarios (if needed)

---

## Recommendations for Moving Forward

### Immediate Priorities (Next 1-2 Days)
1. **Template Editor UI** - Allow editing experiment templates
2. **Template Builder Integration** - Wire existing TemplateBuilder to UI
3. **Enhanced Event Types** - Use template-defined event types
4. **Comprehensive Testing** - Test all edge cases with real data

### Short-term (Next Week)
1. **User Documentation** - Create user guide with screenshots
2. **Video Tutorial** - Record walkthrough of key features
3. **Example Templates** - Create templates for common research types
4. **Performance Testing** - Test with large datasets

### Medium-term (Next Month)
1. **Advanced Features**
   - Schedule/calendar view for experiments
   - Data visualization (charts, graphs)
   - Batch operations (bulk edit, bulk import)
   - Search and filter capabilities

2. **Quality of Life**
   - Keyboard shortcuts
   - Undo/redo functionality
   - Customizable UI themes
   - Export templates (CSV, Excel, custom formats)

3. **Collaboration Features** (if needed)
   - Multi-user support
   - Data sharing/export for collaborators
   - Version control for experiments

### Long-term (Next Quarter)
1. **Advanced Analytics**
   - Statistical analysis integration
   - Automated report generation
   - Data quality checks and validation

2. **Integration**
   - Import from other lab software
   - Export to analysis tools (R, Python, MATLAB)
   - API for programmatic access

3. **Mobile Support**
   - Responsive design for tablets
   - Mobile app for data entry in lab
   - Offline sync capabilities

---

## Conclusion

### What's Working Well
✅ Core CRUD operations (Create, Read, Update, Delete)
✅ V2 data model architecture
✅ Template system foundation
✅ Multi-experiment support
✅ Export/Import functionality
✅ Form validation and dynamic fields

### What Needs Work
⚠️ Template editing UI
⚠️ Template builder integration
⚠️ Advanced event type support
⚠️ Large dataset performance
⚠️ Comprehensive user documentation

### Overall Assessment
The application has a **solid foundation** with the V2 architecture. The core functionality works reliably after fixing the critical bugs. The main gaps are in **user-facing customization features** (template editing) and **documentation**.

**Recommendation:** Focus on template editing UI and user documentation next. The core engine is sound; now make it accessible to non-technical users.