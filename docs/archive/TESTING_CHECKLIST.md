# Comprehensive Testing Checklist

## Before You Come Back to Bob

Test everything below and note any issues you find. This will help me fix problems efficiently.

---

## 🚀 Startup & Basic Navigation

- [ ] App starts without errors (`npm run dev`)
- [ ] App loads at http://localhost:5173/
- [ ] No console errors on initial load
- [ ] Default experiment "My First Experiment" appears
- [ ] Sidebar opens/closes with menu button
- [ ] All toolbar buttons visible (Undo, Redo, Schedule, Experiments, Settings, Export, Import)

---

## 🏠 Housing Unit Management

### Adding Housing Units
- [ ] Click "Add Housing Unit" in sidebar
- [ ] Enter name (e.g., "Cage 1")
- [ ] Housing unit appears in sidebar
- [ ] Housing unit shows "0/10" capacity
- [ ] Can select housing unit from sidebar

### Deleting Housing Units
- [ ] Click delete button on housing unit
- [ ] Confirmation dialog appears
- [ ] After confirming, housing unit is removed
- [ ] If housing unit had subjects, they're also removed
- [ ] Can add housing unit with same name after deleting

### Edge Cases
- [ ] Delete housing unit with subjects in middle slots (e.g., slots 2, 5, 8)
- [ ] Add new housing unit after deleting one
- [ ] Switch between multiple housing units
- [ ] Housing unit count updates correctly in sidebar

---

## 🐭 Subject Management

### Adding Subjects
- [ ] Click "Add Subject" button
- [ ] Subject appears in first empty slot
- [ ] Subject ID auto-generates (e.g., "Subject-1")
- [ ] Can add subjects up to capacity (default 10)
- [ ] Button disables when at capacity
- [ ] Tooltip shows "Housing unit at capacity" when full

### Deleting Subjects
- [ ] Click delete button on subject card
- [ ] Confirmation dialog appears with subject ID
- [ ] After confirming, subject is removed
- [ ] Slot becomes available again
- [ ] Can add new subject to freed slot
- [ ] Capacity count updates correctly (e.g., 9/10 after deleting one)

### Editing Subject Details
- [ ] Click on subject card to open drawer
- [ ] Subject ID field is editable
- [ ] Can type in custom fields (genotype, sex, DOB, etc.)
- [ ] **CRITICAL:** Text doesn't get replaced while typing
- [ ] **CRITICAL:** Text doesn't flicker or reset
- [ ] Changes save automatically
- [ ] Close drawer and reopen - changes persist

### Edge Cases
- [ ] Delete subject from slot 6 when at capacity (10/10)
- [ ] Verify capacity shows 9/10
- [ ] Add new subject - should fill slot 6
- [ ] Delete multiple subjects from different slots
- [ ] Add subjects - should fill lowest empty slots first
- [ ] Edit subject, switch to another subject, come back - data persists

---

## 📅 Events

### Adding Events
- [ ] Open subject drawer
- [ ] Click "Events" tab
- [ ] Click "Add Event" button
- [ ] Event dialog opens
- [ ] Can select category (injection, test, care, death, note)
- [ ] Can enter event type/name
- [ ] Can set date/time
- [ ] Can add notes
- [ ] Click "Add Event" - event appears in list
- [ ] Event shows with correct category chip color

### Deleting Events
- [ ] Click delete button on event
- [ ] Event is removed from list
- [ ] Event count updates in tab label

### Edge Cases
- [ ] Add multiple events to same subject
- [ ] Events sort by date (newest first)
- [ ] Switch subjects - each keeps their own events
- [ ] Delete subject - all events are also deleted

---

## ↩️ Undo/Redo

### Basic Undo
- [ ] Add a housing unit
- [ ] Click Undo button
- [ ] Housing unit is removed
- [ ] Undo button disables when nothing to undo

### Basic Redo
- [ ] After undoing, click Redo button
- [ ] Housing unit reappears
- [ ] Redo button disables when nothing to redo

### Complex Undo/Redo
- [ ] Add housing unit
- [ ] Add 3 subjects
- [ ] Edit subject details
- [ ] Add event
- [ ] Click Undo 5 times - should reverse all actions
- [ ] Click Redo 5 times - should restore all actions
- [ ] Make new change after undo - redo stack clears

### Edge Cases
- [ ] Undo/redo with multiple housing units
- [ ] Undo delete operation
- [ ] Undo/redo doesn't break data integrity
- [ ] Can still save/export after undo/redo

---

## 📊 Schedule/Timeline

### Creating Schedule
- [ ] Click Schedule button (calendar icon) in toolbar
- [ ] Schedule dialog opens
- [ ] Click "Add Event" button
- [ ] Enter day number (e.g., 0, 7, 14, 21)
- [ ] Select category
- [ ] Enter event name (e.g., "Drug Injection", "RotaRod Test")
- [ ] Add description
- [ ] Click "Add" - event appears on timeline

### Timeline Display
- [ ] Events appear at correct position on timeline
- [ ] Day markers show (Day 0, Day 7, Day 14, etc.)
- [ ] Event cards show day, category, name, description
- [ ] Color coding matches category

### Editing Schedule
- [ ] Click edit button on scheduled event
- [ ] Can modify day, category, name, description
- [ ] Click "Update" - changes appear
- [ ] Click delete button - event is removed

### Edge Cases
- [ ] Add events on same day - both appear
- [ ] Add event at day 0 (start)
- [ ] Add event at day 30+ (extends timeline)
- [ ] Close and reopen schedule - events persist
- [ ] Switch experiments - each has own schedule

---

## 🧪 Experiments

### Creating Experiments
- [ ] Click experiment chip in toolbar
- [ ] Click "Switch Experiment"
- [ ] Click "Add Experiment" button
- [ ] Enter experiment name
- [ ] Select template (Mouse, Zebrafish, etc.)
- [ ] Experiment appears in list
- [ ] Can switch to new experiment

### Switching Experiments
- [ ] Create 2+ experiments
- [ ] Switch between them
- [ ] Each experiment has own housing units
- [ ] Each experiment has own subjects
- [ ] Each experiment has own schedule
- [ ] No data mixing between experiments

### Deleting Experiments
- [ ] Click delete button on experiment
- [ ] Confirmation dialog appears
- [ ] After confirming, experiment is removed
- [ ] All housing units, subjects, events deleted
- [ ] Cannot delete last experiment

---

## 🎨 Templates

### Changing Template
- [ ] Click experiment chip
- [ ] Click "Change Template"
- [ ] Select different template (e.g., Mouse → Zebrafish)
- [ ] Subject fields update to match new template
- [ ] Existing subjects keep their data

### Creating Custom Template
- [ ] Click experiment chip
- [ ] Click "Create Custom Template"
- [ ] Template builder dialog opens
- [ ] Fill in basic info (name, description)
- [ ] Configure species (name, plural, icon)
- [ ] Add custom fields
- [ ] Add event types
- [ ] Click through all steps
- [ ] Save template
- [ ] New template appears in template selector

---

## 💾 Data Persistence

### Auto-Save
- [ ] Make changes (add housing unit, subject, etc.)
- [ ] Wait 1 second
- [ ] "Saving..." chip appears briefly
- [ ] "Saved ✓" chip appears
- [ ] Reload page (F5)
- [ ] All data persists

### Export
- [ ] Click "Export" button
- [ ] Export dialog opens
- [ ] Select experiment(s) to export
- [ ] Click "Export JSON"
- [ ] File downloads
- [ ] Open file - verify data is readable JSON

### Import
- [ ] Click "Import" button
- [ ] Select previously exported JSON file
- [ ] Data loads successfully
- [ ] All housing units, subjects, events appear
- [ ] No data corruption

---

## 🐛 Known Issues to Watch For

### Critical Issues (Report Immediately)
- [ ] Form fields reset while typing
- [ ] Data loss on reload
- [ ] Cannot add subjects
- [ ] Cannot add events
- [ ] Capacity calculation wrong
- [ ] Undo/redo breaks app

### Minor Issues (Note But Not Critical)
- [ ] UI glitches or visual bugs
- [ ] Slow performance with many subjects
- [ ] Confusing error messages
- [ ] Missing tooltips or help text

---

## 📈 Performance Testing

### Small Dataset (< 50 subjects)
- [ ] App loads quickly (< 2 seconds)
- [ ] No lag when adding subjects
- [ ] No lag when switching housing units
- [ ] Smooth scrolling

### Medium Dataset (50-200 subjects)
- [ ] App still responsive
- [ ] Subject list renders quickly
- [ ] Can search/filter if needed
- [ ] Export completes in reasonable time

### Large Dataset (200+ subjects)
- [ ] Note any slowdowns
- [ ] Note memory usage (check browser task manager)
- [ ] Note if UI becomes unresponsive
- [ ] Note export time

---

## 🔍 Browser Compatibility

Test in at least one browser:
- [ ] Chrome/Edge (recommended)
- [ ] Firefox
- [ ] Safari (if on Mac)

---

## 📝 Notes Section

Use this space to write down any issues, questions, or observations:

```
Issue 1: [Describe what happened]
Steps to reproduce:
1. 
2. 
3. 

Expected: [What should happen]
Actual: [What actually happened]

---

Issue 2: [Describe what happened]
...

---

Questions:
- 
- 

---

Suggestions:
- 
- 
```

---

## ✅ Sign Off

Once you've completed all tests above:

- [ ] I have tested all core functionality
- [ ] I have noted all issues found
- [ ] I have tested with realistic data (not just 1-2 items)
- [ ] I am ready to report back to Bob

**Date Tested:** _______________
**Browser Used:** _______________
**Number of Issues Found:** _______________

---

## 🎯 Priority Issues to Report

When you come back to Bob, report issues in this order:

1. **Critical** - App crashes, data loss, cannot perform basic tasks
2. **High** - Major features broken, significant usability problems
3. **Medium** - Minor bugs, UI issues, performance problems
4. **Low** - Cosmetic issues, nice-to-have features

**Good luck testing! 🚀**