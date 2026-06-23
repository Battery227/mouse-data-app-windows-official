# Phase 2 & 3 Implementation Plan

## What's Been Done So Far

### Phase 0 ✅
- Fixed false save indicators
- Added warning banners
- Updated documentation

### Phase 1 ✅
- Environment detection
- Browser IndexedDB adapter
- Tauri SQLite adapter
- Storage abstraction layer

### Phase 2 Started ✅
- ✅ Created status constants (`src/models/constants.js`)
- ✅ Created migration utility (`src/storage/migration.js`)
- ✅ Updated MouseDrawer to use new status values
- ⏳ Still need: V2 components and state management

## What Remains for Phase 2 & 3

### Phase 2: V2 Data Model (Estimated: $40-50, 5-7 days)

#### 1. Build V2 SubjectDrawer Component
**File:** `src/components/SubjectDrawer.jsx` (NEW)

**Purpose:** Replace MouseDrawer with template-driven component

**Features:**
- Renders fields from experiment template
- Uses `subject.customFieldValues` instead of flat properties
- Supports any species (not just mice)
- Dynamic field rendering with DynamicField component

**Complexity:** HIGH - ~300 lines, needs careful design

#### 2. Build V2 EventDialog Component  
**File:** `src/components/EventDialogV2.jsx` (NEW)

**Purpose:** Replace EventDialog with template-driven component

**Features:**
- Renders event types from experiment template
- Uses `event.fieldValues` structure
- Supports trials properly
- Uses `subjectId` instead of `mouseId`

**Complexity:** HIGH - ~250 lines

#### 3. Create V2 State Management
**File:** `src/storage/useAppStateV2.jsx` (NEW)

**Purpose:** New state hook for V2 data model

**Features:**
- Manages experiments, housingUnits, subjects, events
- Template-based operations
- Migration on first load
- Backward compatible with V1 data

**Complexity:** VERY HIGH - ~500 lines

#### 4. Update Main App for V2
**File:** `src/App.jsx` (MODIFY)

**Changes:**
- Import useAppStateV2 instead of useAppState
- Handle experiments instead of just cages
- Show active experiment
- Support experiment switching

**Complexity:** MEDIUM - ~100 lines of changes

#### 5. Add Migration UI
**File:** `src/components/MigrationDialog.jsx` (NEW)

**Purpose:** Show migration progress and results

**Features:**
- Detect V1 data on load
- Show migration prompt
- Display migration progress
- Validate results
- Create backup

**Complexity:** MEDIUM - ~150 lines

---

### Phase 3: Template Integration (Estimated: $30-40, 3-4 days)

#### 1. Add Experiment Switcher
**File:** `src/components/ExperimentSwitcher.jsx` (NEW)

**Purpose:** List and switch between experiments

**Features:**
- List all experiments
- Show active experiment
- Switch experiments
- Create new experiment
- Delete experiments

**Complexity:** MEDIUM - ~200 lines

#### 2. Wire Template System
**Files:** Multiple components

**Changes:**
- Use template definitions everywhere
- Remove hardcoded field lists
- Dynamic form generation
- Template-based validation

**Complexity:** HIGH - touches many files

#### 3. Add Template Customization UI
**File:** `src/components/TemplateCustomizer.jsx` (NEW)

**Purpose:** Let users customize templates

**Features:**
- Add/edit/remove fields
- Configure event types
- Set validation rules
- Save custom templates

**Complexity:** HIGH - ~400 lines

---

## Token Cost Estimate

| Phase | Task | Lines | Tokens | Cost |
|-------|------|-------|--------|------|
| 2.1 | SubjectDrawer | 300 | 15K | $3 |
| 2.2 | EventDialogV2 | 250 | 12K | $2.40 |
| 2.3 | useAppStateV2 | 500 | 25K | $5 |
| 2.4 | App.jsx updates | 100 | 5K | $1 |
| 2.5 | MigrationDialog | 150 | 7K | $1.40 |
| 3.1 | ExperimentSwitcher | 200 | 10K | $2 |
| 3.2 | Template wiring | 300 | 15K | $3 |
| 3.3 | TemplateCustomizer | 400 | 20K | $4 |
| **TOTAL** | | **2,200** | **109K** | **$21.80** |

**Current Budget:** $191 remaining  
**After Phase 2 & 3:** ~$169 remaining  
**Plenty for Phase 4 & 5**

---

## Alternative Approaches

### Option A: Complete Implementation Now
- Continue with full Phase 2 & 3 implementation
- Cost: ~$22
- Time: Rest of this session
- Result: Fully functional V2 system
- **Pros:** Everything done, ready to test
- **Cons:** Can't review incrementally

### Option B: Incremental Implementation
- Do Phase 2 now (~$12)
- You test and review
- Then do Phase 3 (~$10)
- **Pros:** Review points, can adjust
- **Cons:** Takes longer, multiple sessions

### Option C: Hybrid with Local LLM
- I create detailed specs for each component
- You use local LLM (Qwen/DeepSeek) for implementation
- I review and integrate
- **Pros:** Cost-effective, you learn the code
- **Cons:** Requires local LLM setup

### Option D: Minimal V2 Bridge
- Create minimal V2 compatibility layer
- Keep V1 components but fix data flow
- Migrate data structure only
- **Pros:** Faster, cheaper (~$10)
- **Cons:** Not fully V2, still has limitations

---

## My Recommendation

Given your budget ($191 remaining) and goals:

### Recommended: Option A (Complete Implementation)

**Why:**
1. You have plenty of budget
2. You want to review before polish (Phase 4 & 5)
3. Full implementation gives you complete picture
4. Can test everything together
5. Still have $169 for Phase 4 & 5

**Timeline:**
- Phase 2: ~2 hours of work
- Phase 3: ~1.5 hours of work
- Total: ~3.5 hours
- Cost: ~$22

**After completion:**
- You test everything
- Tell me what needs adjustment
- I make changes
- Then we do Phase 4 (testing) & 5 (polish)

---

## What You'll Get

### After Phase 2
- ✅ V2 data model working
- ✅ Migration from V1 automatic
- ✅ SubjectDrawer with dynamic fields
- ✅ EventDialog with proper structure
- ✅ Status values consistent
- ✅ Events save/display correctly

### After Phase 3
- ✅ Template system fully wired
- ✅ Experiment switcher working
- ✅ Customization UI accessible
- ✅ Multi-species support enabled
- ✅ Dynamic forms everywhere

### Ready for Your Review
- Test all functionality
- Try different templates
- Add custom fields
- Create experiments
- Tell me what to adjust

### Then Phase 4 & 5
- Add comprehensive tests
- Polish UI/UX
- Fix any issues you found
- Final documentation
- Production ready!

---

## Decision Time

**What would you like me to do?**

**A)** Continue with full Phase 2 & 3 now (~$22, 3.5 hours)  
**B)** Do Phase 2 only, pause for review (~$12, 2 hours)  
**C)** Create detailed specs for local LLM implementation  
**D)** Minimal V2 bridge approach (~$10, 1.5 hours)

**My vote: Option A** - You have the budget, and you want a review point before final polish. This gives you the complete picture to test.

---

## Current Status

**Completed:**
- Phase 0: Safety fixes ✅
- Phase 1: Storage layer ✅
- Phase 2: 30% complete (constants, migration, status fixes)

**Ready to implement:**
- Phase 2: 70% remaining (components, state management)
- Phase 3: 100% remaining (UI integration)

**Budget:**
- Spent: $9.66
- Remaining: $190.34
- Needed for Phase 2 & 3: ~$22
- After: ~$168 (plenty for Phase 4 & 5)

**Your call! What should I do?** 🚀