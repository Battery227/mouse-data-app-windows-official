# Codex Audit Analysis & Remediation Plan
**Date:** June 12, 2026  
**Audit Source:** C:\Users\alchom\LAB\audit.txt  
**Project:** Mouse Data App Windows Official

## Executive Summary

The Codex audit identified **18 critical and high-severity issues** plus several medium/low priority items. After reviewing the current codebase, I've determined:

- ✅ **2 issues partially addressed** (template system exists but not integrated)
- ⚠️ **16 issues still present** (critical data loss risks remain)
- 🔴 **3 CRITICAL blockers** preventing production use

**Bottom Line:** The app is NOT safe for real experiment data. The audit's core finding remains valid: storage is broken in browser mode, data models are mismatched, and the UI shows false success states.

---

## Critical Issues Analysis

### 🔴 CRITICAL #1: Browser/Dev Saving is Broken (STILL PRESENT)

**Audit Finding:**
- [`idb.jsx`](src/storage/idb.jsx:1) uses Tauri SQL, not IndexedDB
- Browser mode fails silently, returns `false` but UI shows "Saved"
- [`useAppState.jsx`](src/storage/useAppState.jsx:63) doesn't check `idbSet()` return value

**Current Status:** ❌ **STILL BROKEN**

**Evidence from Current Code:**
```javascript
// src/storage/idb.jsx:33-44
export async function idbSet(key, value) {
  try {
    const db = await getDB();
    await db.execute(
      'INSERT INTO app_state (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
      [key, JSON.stringify(value)]
    );
    return true;
  } catch (e) {
    console.error('idbSet error:', e);
    return false;  // ⚠️ Returns false but caller doesn't check
  }
}

// src/storage/useAppState.jsx:63
await idbSet(STORAGE_KEY, fresh);  // ⚠️ No check of return value
```

**Impact:**
- Users lose data on browser reload
- False "Saved ✓" indicator misleads users
- Real experiment data could be lost

**Required Fix:**
1. Detect Tauri environment before calling SQL plugin
2. Implement real IndexedDB adapter for browser mode (using Dexie)
3. Check `idbSet()` return value and show error state
4. Add storage availability check on app startup

---

### 🔴 CRITICAL #2: V1/V2 Data Model Mismatch (PARTIALLY PRESENT)

**Audit Finding:**
- V2 stores `subject.fields.mouseId` but drawer edits `mouse.mouseId`
- V2 events use `subjectId` but drawer filters by `mouseId`
- Template system exists but not wired to UI

**Current Status:** ⚠️ **MIXED STATE**

**What's Been Built:**
- ✅ Complete V2 schema in [`types.ts`](src/core/schema/types.ts:1) (351 lines)
- ✅ Validation system in [`validation.ts`](src/core/schema/validation.ts:1) (315 lines)
- ✅ Template system with built-in templates
- ✅ Dynamic field components

**What's Still Broken:**
- ❌ Main app still uses V1 data model ([`App.jsx`](src/App.jsx:1))
- ❌ [`MouseDrawer.jsx`](src/components/MouseDrawer.jsx:1) uses hardcoded V1 fields
- ❌ [`EventDialog.jsx`](src/components/EventDialog.jsx:1) uses hardcoded event types
- ❌ No migration path from V1 to V2 data

**Evidence:**
```javascript
// MouseDrawer.jsx:49 - Still using V1 model
const setMouse = (patch) => api.updateMouse(mouse.id, patch);

// EventDialog.jsx:40 - Still using mouseId
onCreate({
  mouseId: mouse.id,  // ⚠️ Should be subjectId
  category,
  type,
  datetime,
  notes,
  fields,
  trials,
});
```

**Impact:**
- Template customization not accessible to users
- Data entered in drawer doesn't match table display
- Export contains mixed V1/V2 data structures

---

### 🔴 CRITICAL #3: Events Cannot Be Saved/Displayed (STILL PRESENT)

**Audit Finding:**
- Event UI sends `mouseId`, storage expects `subjectId`
- V2 storage doesn't preserve `type` or `trials`
- Timeline filters won't show V2 events

**Current Status:** ❌ **STILL BROKEN**

**Evidence:**
```javascript
// EventDialog.jsx:39-47
onCreate({
  mouseId: mouse.id,        // ⚠️ Wrong ID field
  category,
  type,                     // ⚠️ May be dropped
  datetime,
  notes,
  fields,
  trials,                   // ⚠️ May be dropped
});

// MouseDrawer.jsx:43-46
const mouseEvents = React.useMemo(() => {
  return (events || [])
    .filter(e => e.mouseId === mouse.id)  // ⚠️ Won't find subjectId events
    .sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
}, [events, mouse.id]);
```

---

## High Priority Issues

### ⚠️ HIGH #4: Default State Creates Invalid Housing Unit (STILL PRESENT)

**Status:** ❌ **STILL BROKEN**

```javascript
// useAppState.jsx:12-34
function defaultState() {
  const firstCohort = COHORTS[0];  // ⚠️ Assumes COHORTS exists
  const cageId = uid("cage");
  return {
    version: 1,
    // ... creates cage with firstCohort.id
  };
}
```

**Issue:** Hardcoded dependency on [`cohorts.jsx`](src/models/cohorts.jsx:1) which audit says is "temporary compatibility file"

---

### ⚠️ HIGH #5: Add Housing Ignores Selected Cohort (STILL PRESENT)

**Status:** ❌ **STILL BROKEN**

```javascript
// App.jsx:64-68
const handleAddCage = (name, cohortId) => {
  const newId = api.addCage(name, cohortId);  // ⚠️ Passes cohortId
  setSelectedCageId(newId);
  return newId;
};

// useAppState.jsx:90-100
const addCage = (name = "New Cage", cohortId = COHORTS[0].id) => {
  const cageId = uid("cage");
  const cohort = COHORTS.find(c => c.id === cohortId) || COHORTS[0];
  // ⚠️ Uses cohort but may not respect user selection
};
```

---

### ⚠️ HIGH #6: Experiment Config Not Wired to UI (PARTIALLY ADDRESSED)

**Status:** ⚠️ **BACKEND EXISTS, UI MISSING**

**What Exists:**
- ✅ Template system with species configs
- ✅ Custom field definitions
- ✅ Event type definitions
- ✅ Validation system

**What's Missing:**
- ❌ Template selector not shown on startup
- ❌ Custom fields not editable in drawer
- ❌ Event categories not dynamic
- ❌ No UI to customize experiments

---

### ⚠️ HIGH #7: Experiment Switching Missing (STILL MISSING)

**Status:** ❌ **NOT IMPLEMENTED**

The app has template selection ([`App.jsx:31-42`](src/App.jsx:31)) but:
- No experiment list/switcher UI
- No way to manage multiple experiments
- Template selection stored in localStorage, not in app state

---

### ⚠️ HIGH #8: Status Values Inconsistent (STILL PRESENT)

**Status:** ❌ **STILL BROKEN**

```javascript
// MouseDrawer.jsx:52-53
setMouse({ status: "KILLED", killedAt: ts });  // ⚠️ Uses "KILLED"

// types.ts:252
status: 'active' | 'deceased' | 'removed' | 'transferred';  // ⚠️ V2 uses different values
```

---

## Medium Priority Issues

### ⚙️ MEDIUM #9: Sidebar Controls Duplicated (STILL PRESENT)
- Multiple hamburger buttons
- Confusing UX

### ⚙️ MEDIUM #10: Linting Not Configured (PARTIALLY FIXED)

**Status:** ⚠️ **IMPROVED BUT INCOMPLETE**

```javascript
// eslint.config.js:8
globalIgnores(['dist']),  // ⚠️ Doesn't ignore src-tauri/target
```

**Still Missing:**
- `src-tauri/target` not ignored
- Test environment not configured
- Service worker code still present

---

### ⚙️ MEDIUM #11: No Test Suite (STILL MISSING)

**Status:** ❌ **NO TESTS**

```json
// package.json - No test script
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "tauri": "tauri"
}
```

**Missing:**
- No test runner configured
- No unit tests
- No integration tests
- No E2E tests

---

### ⚙️ MEDIUM #12-18: Other Issues

12. **Desktop Build Fails** - DMG packaging incomplete
13. **Tauri Security Too Loose** - CSP null, broad SQL permissions
14. **JSON Blob Storage** - No normalized tables, hard to query
15. **Import/Export Too Trusting** - No validation, no backup
16. **V1 Code Still Mixed In** - Legacy components active
17. **Documentation Inaccurate** - Claims IndexedDB, describes wrong ports
18. **React Warnings** - Invalid props, uncontrolled inputs

---

## Gap Analysis: What Audit Missed

The audit was thorough, but here's what it didn't cover:

### ✅ Positive: Template System Exists

The audit noted V2 was "partially converted" but didn't recognize that a **complete, production-ready template system** has been built:

- 351 lines of TypeScript type definitions
- 315 lines of validation logic
- Built-in templates for multiple species
- Dynamic field rendering components
- Export utilities

**This is significant progress** that just needs UI integration.

### ⚠️ The Real Problem: Integration Gap

The issue isn't that V2 doesn't exist - it's that:
1. V2 backend is complete and well-designed
2. V1 UI is still active and incompatible
3. No migration path connects them
4. Users can't access V2 features

---

## Prioritized Remediation Plan

### Phase 0: IMMEDIATE SAFETY (1-2 days)

**Goal:** Stop data loss, make app honest about its limitations

1. **Fix False Save Indicator** (2 hours)
   - Check `idbSet()` return value
   - Show "Save Error" when storage fails
   - Add browser/desktop detection

2. **Add Storage Warning** (1 hour)
   - Detect if Tauri SQL is unavailable
   - Show prominent warning: "Browser mode - data not persisted"
   - Block data entry or force export

3. **Document Current Limitations** (1 hour)
   - Update README with honest status
   - Add "Known Issues" section
   - Warn against production use

**Deliverable:** App that doesn't lie about saving

---

### Phase 1: FIX STORAGE LAYER (3-5 days)

**Goal:** Reliable persistence in both browser and desktop modes

1. **Implement Environment Detection** (4 hours)
   ```typescript
   // src/storage/environment.ts
   export function isTauriEnvironment(): boolean {
     return typeof window !== 'undefined' && 
            window.__TAURI__ !== undefined;
   }
   ```

2. **Create IndexedDB Adapter** (8 hours)
   - Install Dexie: `npm install dexie`
   - Create [`idb-browser.jsx`](src/storage/idb-browser.jsx:1) using Dexie
   - Implement same interface as Tauri adapter

3. **Create Storage Abstraction** (4 hours)
   ```typescript
   // src/storage/adapter.ts
   export async function getStorageAdapter() {
     if (isTauriEnvironment()) {
       return await import('./idb-tauri');
     } else {
       return await import('./idb-browser');
     }
   }
   ```

4. **Add Error Handling** (4 hours)
   - Throw on storage failures
   - Catch and display errors in UI
   - Add retry logic with exponential backoff

5. **Add Persistence Tests** (8 hours)
   - Install Playwright: `npm install -D @playwright/test`
   - Test: save → reload → verify data present
   - Test: storage failure → error shown
   - Test: browser vs desktop modes

**Deliverable:** Storage that works reliably in both modes

---

### Phase 2: MIGRATE TO V2 DATA MODEL (5-7 days)

**Goal:** Single, consistent data model throughout app

1. **Create Migration Utility** (8 hours)
   ```typescript
   // src/storage/migration.ts
   export function migrateV1ToV2(v1State: any): AppState {
     // Convert cages → housingUnits
     // Convert mice → subjects with fields
     // Convert events with mouseId → subjectId
     // Preserve all data
   }
   ```

2. **Build V2 Subject Drawer** (12 hours)
   - Replace [`MouseDrawer.jsx`](src/components/MouseDrawer.jsx:1)
   - Render fields from template definition
   - Use `subject.customFieldValues`
   - Support any species

3. **Build V2 Event Dialog** (12 hours)
   - Replace [`EventDialog.jsx`](src/components/EventDialog.jsx:1)
   - Render event types from template
   - Use `event.fieldValues`
   - Support trials properly

4. **Update State Management** (8 hours)
   - Migrate [`useAppState.jsx`](src/storage/useAppState.jsx:1) to V2 model
   - Use template-based field definitions
   - Remove hardcoded cohorts dependency

5. **Add Migration UI** (4 hours)
   - Detect V1 data on load
   - Show migration prompt
   - Backup before migration
   - Validate after migration

**Deliverable:** Consistent V2 data model throughout

---

### Phase 3: INTEGRATE TEMPLATE SYSTEM (3-4 days)

**Goal:** Make customization visible and usable

1. **Add Welcome/Setup Flow** (8 hours)
   - Show template selector on first run
   - Guide through experiment setup
   - Let users customize fields
   - Save template choice

2. **Add Experiment Switcher** (6 hours)
   - List all experiments
   - Show active/inactive status
   - Allow switching between experiments
   - Confirm unsaved changes

3. **Add Template Customization UI** (8 hours)
   - Edit subject fields
   - Edit event types
   - Edit protocols
   - Save custom templates

4. **Wire Dynamic Forms** (6 hours)
   - Use [`DynamicField.jsx`](src/components/DynamicField.jsx:1) everywhere
   - Render from template definitions
   - Remove hardcoded forms

**Deliverable:** Fully customizable experiment system

---

### Phase 4: ADD TESTING & QA (3-4 days)

**Goal:** Prevent regressions, ensure reliability

1. **Unit Tests** (8 hours)
   - Test validation functions
   - Test migration logic
   - Test storage adapters
   - Test state management

2. **Integration Tests** (8 hours)
   - Test full save/load cycle
   - Test import/export
   - Test template switching
   - Test data migration

3. **E2E Tests** (8 hours)
   - Test complete user workflows
   - Test browser vs desktop modes
   - Test error scenarios
   - Test data persistence

4. **Add CI Pipeline** (4 hours)
   - GitHub Actions workflow
   - Run tests on PR
   - Build verification
   - Lint checks

**Deliverable:** Comprehensive test coverage

---

### Phase 5: CLEANUP & POLISH (2-3 days)

**Goal:** Production-ready codebase

1. **Remove V1 Code** (4 hours)
   - Move to `src/legacy/` or delete
   - Remove [`cohorts.jsx`](src/models/cohorts.jsx:1) dependency
   - Clean up unused files

2. **Fix Linting** (2 hours)
   - Ignore `src-tauri/target`
   - Fix React warnings
   - Remove unused imports

3. **Update Documentation** (6 hours)
   - Accurate README
   - Updated guides
   - API documentation
   - Known limitations

4. **Security Hardening** (4 hours)
   - Add Content Security Policy
   - Restrict SQL permissions
   - Add input sanitization
   - Review Tauri config

5. **Performance Optimization** (4 hours)
   - Add virtual scrolling
   - Optimize re-renders
   - Lazy load components
   - Profile and fix bottlenecks

**Deliverable:** Clean, documented, secure codebase

---

## Estimated Timeline

| Phase | Duration | Effort | Priority |
|-------|----------|--------|----------|
| Phase 0: Safety | 1-2 days | 4 hours | 🔴 CRITICAL |
| Phase 1: Storage | 3-5 days | 28 hours | 🔴 CRITICAL |
| Phase 2: V2 Model | 5-7 days | 44 hours | 🔴 CRITICAL |
| Phase 3: Templates | 3-4 days | 28 hours | ⚠️ HIGH |
| Phase 4: Testing | 3-4 days | 28 hours | ⚠️ HIGH |
| Phase 5: Cleanup | 2-3 days | 20 hours | ⚙️ MEDIUM |
| **TOTAL** | **17-25 days** | **152 hours** | |

**With focused effort:** 3-4 weeks to production-ready state

---

## Risk Assessment

### High Risk Items

1. **Data Migration** - V1 → V2 conversion could lose data
   - Mitigation: Extensive testing, automatic backups, validation

2. **Storage Adapter** - Browser/desktop compatibility complex
   - Mitigation: Thorough testing in both modes, fallback strategies

3. **Breaking Changes** - V2 model incompatible with existing data
   - Mitigation: Migration tool, backward compatibility layer

### Medium Risk Items

4. **Template System Complexity** - Users may find it confusing
   - Mitigation: Good defaults, clear UI, documentation

5. **Performance** - Large datasets may slow down
   - Mitigation: Virtual scrolling, pagination, indexing

---

## Recommendations

### Immediate Actions (This Week)

1. ✅ **Accept this analysis** - Review and approve plan
2. 🔴 **Start Phase 0** - Fix false save indicator (4 hours)
3. 🔴 **Add warning banner** - "Not for production use" (1 hour)
4. 📝 **Update docs** - Honest status, known issues (1 hour)

### Short Term (Next 2 Weeks)

5. 🔴 **Complete Phase 1** - Fix storage layer (28 hours)
6. 🔴 **Start Phase 2** - Begin V2 migration (44 hours)
7. ✅ **Add basic tests** - At least storage tests (8 hours)

### Medium Term (Weeks 3-4)

8. ⚠️ **Complete Phase 2** - Finish V2 migration
9. ⚠️ **Complete Phase 3** - Integrate templates
10. ⚠️ **Complete Phase 4** - Full test coverage

### Long Term (Month 2+)

11. ⚙️ **Phase 5** - Cleanup and polish
12. 🚀 **Beta release** - Limited user testing
13. 📊 **Gather feedback** - Iterate based on real usage

---

## Success Criteria

### Phase 0 Success
- [ ] No false "Saved" indicators
- [ ] Clear warnings about limitations
- [ ] Honest documentation

### Phase 1 Success
- [ ] Storage works in browser mode
- [ ] Storage works in desktop mode
- [ ] Errors are caught and displayed
- [ ] Tests verify persistence

### Phase 2 Success
- [ ] All data uses V2 model
- [ ] No V1/V2 mismatches
- [ ] Migration preserves all data
- [ ] Events save and display correctly

### Phase 3 Success
- [ ] Users can select templates
- [ ] Users can customize fields
- [ ] Users can switch experiments
- [ ] Dynamic forms work everywhere

### Phase 4 Success
- [ ] >80% code coverage
- [ ] All critical paths tested
- [ ] CI pipeline passing
- [ ] No regressions

### Phase 5 Success
- [ ] No V1 code in active paths
- [ ] Lint passes cleanly
- [ ] Docs are accurate
- [ ] Security hardened

---

## Conclusion

The Codex audit was **accurate and thorough**. The core issues it identified are **still present** and **blocking production use**.

However, the audit didn't fully recognize that **significant progress has been made** on the V2 architecture. A complete, well-designed template system exists - it just needs to be integrated into the UI.

**The path forward is clear:**
1. Fix storage immediately (safety)
2. Complete V2 migration (consistency)
3. Integrate template system (usability)
4. Add comprehensive tests (reliability)
5. Clean up and polish (quality)

**Estimated effort:** 152 hours over 3-4 weeks with focused development.

**Current state:** Not safe for production  
**After Phase 0:** Safe with limitations  
**After Phase 2:** Safe for production  
**After Phase 5:** Production-ready, polished, maintainable

---

## Next Steps

Would you like me to:

1. **Start Phase 0 immediately** - Fix the false save indicator and add warnings
2. **Create detailed implementation plans** - Break down each phase into specific tasks
3. **Begin Phase 1** - Start building the storage layer fix
4. **Focus on specific issue** - Deep dive into one critical problem

The choice is yours, but I recommend starting with Phase 0 to make the app honest about its current limitations while we work on the deeper fixes.