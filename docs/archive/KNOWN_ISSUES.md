# Known Issues & Limitations

**Last Updated:** June 12, 2026  
**Status:** Phase 0 fixes in progress

## 🔴 CRITICAL - Do Not Use for Production Data

### Issue #1: Browser Mode Storage Failure
**Severity:** CRITICAL  
**Status:** ⚠️ PARTIALLY FIXED (Phase 0)

**Problem:**
- Storage layer calls Tauri SQL plugin which is unavailable in browser mode
- `idbSet()` returns `false` but app previously showed "Saved ✓"
- Data exists only in memory and is lost on reload

**Phase 0 Fixes Applied:**
- ✅ Save status now checks `idbSet()` return value
- ✅ Shows "⚠️ NOT SAVED" chip when storage fails
- ✅ Prominent warning banner appears when storage unavailable
- ✅ Console warnings added

**Still Needed (Phase 1):**
- Environment detection (Tauri vs browser)
- Real IndexedDB adapter for browser mode using Dexie
- Storage abstraction layer
- Automated persistence tests

**Workaround:**
- Use desktop app via `npm run tauri dev`
- Export data frequently
- Do not use browser mode for real data

---

### Issue #2: V1/V2 Data Model Mismatch
**Severity:** CRITICAL  
**Status:** ❌ NOT FIXED

**Problem:**
- V2 backend stores `subject.fields.mouseId`
- V1 UI (MouseDrawer) edits `mouse.mouseId`
- Data entered in drawer doesn't appear in table
- Template system exists but not wired to UI

**Impact:**
- Users see data in drawer but not in main table
- Custom fields from templates not accessible
- Export contains mixed data structures

**Fix Required (Phase 2):**
- Build V2 SubjectDrawer component
- Build V2 EventDialog component
- Migrate useAppState to V2 model
- Create V1→V2 migration utility
- Wire template system to UI

**Workaround:**
- None - this is a fundamental architecture issue

---

### Issue #3: Events Cannot Be Saved Properly
**Severity:** CRITICAL  
**Status:** ❌ NOT FIXED

**Problem:**
- EventDialog sends `mouseId`, storage expects `subjectId`
- V2 storage may drop `type` and `trials` fields
- Timeline filters by `mouseId`, won't show V2 events

**Impact:**
- Events may not appear after creation
- Test trials can be silently lost
- Event data incomplete

**Fix Required (Phase 2):**
- Build V2 EventDialog
- Use `subjectId` consistently
- Preserve all event fields
- Update timeline filtering

**Workaround:**
- Verify events appear after creation
- Export frequently to check data integrity

---

## ⚠️ HIGH Priority Issues

### Issue #4: Default State Creates Invalid Housing Unit
**Severity:** HIGH  
**Status:** ❌ NOT FIXED

**Problem:**
- `defaultState()` creates housing unit with undefined cohort
- Hardcoded dependency on `cohorts.jsx` (temporary file)
- UI shows housing unit but warns cohorts needed

**Fix Required (Phase 2):**
- Remove hardcoded cohorts dependency
- Use template-based cohort system
- Create valid default state or start empty

---

### Issue #5: Add Housing Ignores Selected Cohort
**Severity:** HIGH  
**Status:** ❌ NOT FIXED

**Problem:**
- Sidebar collects `cohortId` but `addCage()` may ignore it
- Always assigns first cohort regardless of selection

**Fix Required (Phase 2):**
- Pass explicit cohortId through API
- Add test for non-first cohort assignment

---

### Issue #6: Experiment Config Not Wired to UI
**Severity:** HIGH  
**Status:** ⚠️ BACKEND COMPLETE, UI MISSING

**Problem:**
- Template system fully built (666 lines)
- Custom fields defined but not editable
- Event categories configured but not used
- Users can't access customization features

**What Exists:**
- ✅ Complete type system (types.ts)
- ✅ Validation system (validation.ts)
- ✅ Built-in templates
- ✅ Template builder
- ✅ Dynamic field components

**What's Missing:**
- ❌ Template selector on startup
- ❌ Custom field editor in drawer
- ❌ Dynamic event dialog
- ❌ Template customization UI

**Fix Required (Phase 3):**
- Add welcome/setup flow
- Wire DynamicField components
- Build template customization UI
- Add experiment switcher

---

### Issue #7: No Experiment Switching
**Severity:** HIGH  
**Status:** ❌ NOT IMPLEMENTED

**Problem:**
- Can create/import experiments
- No UI to list or switch between them
- Template selection in localStorage, not app state

**Fix Required (Phase 3):**
- Build experiment list/switcher
- Show active experiment
- Confirm unsaved changes

---

### Issue #8: Status Values Inconsistent
**Severity:** HIGH  
**Status:** ❌ NOT FIXED

**Problem:**
- MouseDrawer sets `status: "KILLED"`
- V2 types define `'active' | 'deceased' | 'removed' | 'transferred'`
- Mismatch causes display issues

**Fix Required (Phase 2):**
- Define single status enum
- Use consistent terminology
- Add migration for existing values

---

## ⚙️ MEDIUM Priority Issues

### Issue #9: Sidebar Controls Duplicated
**Severity:** MEDIUM  
**Status:** ❌ NOT FIXED

**Problem:**
- Multiple hamburger buttons
- Confusing UX with app bar + floating buttons

**Fix Required (Phase 5):**
- Single primary toggle
- Responsive variant (persistent/temporary)

---

### Issue #10: Linting Not Configured
**Severity:** MEDIUM  
**Status:** ⚠️ PARTIALLY FIXED

**Problem:**
- ESLint scans `src-tauri/target` (generated files)
- Test globals not configured
- Service worker code uses invalid `process.env`

**Partial Fix:**
- `eslint.config.js` ignores `dist`

**Still Needed (Phase 5):**
- Ignore `src-tauri/target`
- Configure test environment or remove tests
- Remove unused service worker code

---

### Issue #11: No Test Suite
**Severity:** MEDIUM  
**Status:** ❌ NO TESTS

**Problem:**
- No test runner configured
- No unit tests
- No integration tests
- No E2E tests

**Impact:**
- Critical bugs not caught
- No regression protection
- Refactoring risky

**Fix Required (Phase 4):**
- Install Playwright
- Add unit tests for validation/migration
- Add integration tests for storage
- Add E2E tests for workflows

---

### Issue #12: Desktop Build Partially Fails
**Severity:** MEDIUM  
**Status:** ⚠️ PARTIAL

**Problem:**
- Vite build succeeds
- Rust build succeeds
- `.app` created
- DMG bundling fails

**Fix Required (Phase 5):**
- Debug DMG bundler
- Add CI build verification

---

### Issue #13: Tauri Security Too Loose
**Severity:** MEDIUM  
**Status:** ❌ NOT FIXED

**Problem:**
- CSP set to `null`
- Broad SQL permissions
- Not ideal for data app

**Fix Required (Phase 5):**
- Add real Content Security Policy
- Narrow SQL permissions
- Review before distribution

---

### Issue #14: JSON Blob Storage
**Severity:** MEDIUM  
**Status:** ❌ BY DESIGN (acceptable for now)

**Problem:**
- Entire state stored as single JSON string
- No row-level constraints
- No transaction history
- Hard to query directly

**Impact:**
- Harder migrations
- Harder recovery from corruption
- Can't analyze directly in SQLite

**Fix Required (Future):**
- For prototype: acceptable with backups
- For production: normalized tables or versioned document store

---

### Issue #15: Import/Export Too Trusting
**Severity:** MEDIUM  
**Status:** ❌ NOT FIXED

**Problem:**
- No schema validation on import
- No preview or diff
- No automatic backup before import
- Can corrupt entire state

**Fix Required (Phase 5):**
- Validate imports with schema
- Create backup before import
- Show import summary

---

### Issue #16: V1 Code Still Mixed In
**Severity:** MEDIUM  
**Status:** ❌ NOT FIXED

**Problem:**
- Old App.jsx, useAppState.jsx still present
- MouseDrawer/EventDialog are V1 but used by V2
- cohorts.jsx marked as "temporary"
- db.js defines unused tables

**Impact:**
- Codebase confusing
- Old assumptions leak into new features
- Compilation works but wrong data shape

**Fix Required (Phase 5):**
- Move V1 to `src/legacy/` or delete
- Remove compatibility imports
- Clean up unused files

---

### Issue #17: Documentation Inaccurate
**Severity:** MEDIUM  
**Status:** ⚠️ PARTIALLY FIXED (Phase 0)

**Problems Fixed:**
- ✅ README now has prominent warnings
- ✅ Status changed to "ALPHA"
- ✅ Known limitations documented

**Still Inaccurate:**
- BUILD_GUIDE.md claims IndexedDB auto-save
- QUICK_START.md says "Cohort A" exists by default
- clear_storage.html targets wrong databases
- Port numbers inconsistent

**Fix Required (Phase 5):**
- Rewrite all docs after fixes complete
- Add "known limitations" sections
- Don't claim persistence until tested

---

### Issue #18: React Runtime Warnings
**Severity:** LOW-MEDIUM  
**Status:** ❌ NOT FIXED

**Problems:**
- Invalid DOM props (alignItems, justifyContent)
- Invalid HTML nesting
- Uncontrolled→controlled input changes
- Deprecated MUI props

**Fix Required (Phase 5):**
- Audit MUI v9 API changes
- Use current MUI APIs
- Fix controlled input defaults

---

## 📊 Issue Summary

| Severity | Total | Fixed | In Progress | Not Fixed |
|----------|-------|-------|-------------|-----------|
| CRITICAL | 3 | 0 | 1 | 2 |
| HIGH | 5 | 0 | 1 | 4 |
| MEDIUM | 10 | 0 | 2 | 8 |
| **TOTAL** | **18** | **0** | **4** | **14** |

## 🎯 Fix Priority Order

### Phase 0 (Current - 1-2 days) ✅ IN PROGRESS
- [x] Fix false save indicator
- [x] Add storage warning banner
- [x] Update documentation

### Phase 1 (Next - 3-5 days)
- [ ] Environment detection
- [ ] IndexedDB adapter (Dexie)
- [ ] Storage abstraction
- [ ] Error handling
- [ ] Persistence tests

### Phase 2 (5-7 days)
- [ ] V1→V2 migration utility
- [ ] V2 SubjectDrawer
- [ ] V2 EventDialog
- [ ] Migrate useAppState
- [ ] Fix status values
- [ ] Fix default state
- [ ] Fix cohort selection

### Phase 3 (3-4 days)
- [ ] Welcome/setup flow
- [ ] Experiment switcher
- [ ] Template customization UI
- [ ] Wire dynamic forms

### Phase 4 (3-4 days)
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] CI pipeline

### Phase 5 (2-3 days)
- [ ] Remove V1 code
- [ ] Fix linting
- [ ] Update docs
- [ ] Security hardening
- [ ] Fix DMG build
- [ ] Polish UI

## 🔒 Safety Recommendations

**Until Phase 1 Complete:**
- ❌ Do not use for real experiment data
- ✅ Use desktop app only (not browser)
- ✅ Export data after every session
- ✅ Keep multiple backups

**Until Phase 2 Complete:**
- ⚠️ Verify data appears correctly after entry
- ⚠️ Check exports contain expected data
- ⚠️ Test reload to confirm persistence

**Production Ready:**
- After Phase 5 complete
- After comprehensive testing
- After documentation updated
- Estimated: 3-4 weeks from June 12, 2026

---

**For detailed remediation plan, see [AUDIT_ANALYSIS.md](AUDIT_ANALYSIS.md)**