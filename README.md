# In Vivo Colony Manager

A local-first desktop app for managing in-vivo research studies — subjects, housing
units (cages), experiments, cohorts/groups, and scheduled tasks — customizable to any
species or protocol through a template system. No coding required to adapt it to your
study.

Built with React 19 + Vite + MUI v9, packaged as a native desktop app with Tauri (Rust).
Data is stored locally (SQLite in the desktop app, IndexedDB in the browser) and the app
works fully offline.

## Status

Feature-complete for daily lab use. The single remaining step before lab handoff is
producing the signed-or-unsigned Windows installer (see
[Building the downloadable app](#building-the-downloadable-windows-app)).

- **Platform focus: Windows.** macOS/Linux are supported by Tauri but not yet set up in
  CI or code-signed.
- The installer is **not yet code-signed**, so Windows SmartScreen warns on first run —
  click *More info → Run anyway* (one-time per machine).

## Features

- **Cages → subjects** with a customizable template (Mouse ID, genotype, strain, sex,
  DOB/DOD, your own fields).
- **Cohorts & groups**, assignable on the fly — assign a whole cage at once, override
  per-animal, color-coded throughout.
- **Timeline per subject**: a group **schedule** (incl. events repeated over a span of
  days) plus ad-hoc events, all in one place, each checkable off.
- **Daily Task Board**: everything due across all animals, bucketed Overdue / Today /
  This week, with check-off and a **note/measurement** field (weight, trial times…).
- **Bulk entry**: log one event for a whole cage at once.
- **Find/filter** animals by Mouse ID, custom fields, status, or cohort/group.
- **Backup & restore**: automatic local snapshots + downloadable backup file, with safe
  (validated, reversible) restore.

## Requirements

- **Node.js LTS** (<https://nodejs.org>) — to run and develop.
- **Rust** (<https://rustup.rs>) — only to build the desktop app *locally* (not needed
  for the CI build below, and not needed by people who just install the finished app).

## Run & develop

```powershell
npm install            # one-time
npm run dev            # browser dev server -> http://localhost:5173
npm run build          # build the web frontend into dist/
npm run tauri dev      # run the desktop app in dev (requires Rust)
```

## Building the downloadable Windows app

The app is one React codebase; Tauri wraps that same code into a native `.exe`. Nothing
is lost between the browser and the desktop build — the only difference is storage
(IndexedDB in the browser, a real SQLite file in the `.exe`), handled automatically.

**Option A — GitHub Actions (no local Rust needed; recommended for distribution):**
Push to `main`; the `.github/workflows/build-windows.yml` workflow builds the installer
on a Windows runner. Download it from the repo's **Actions → latest run → Artifacts**.

```powershell
git push origin main
```

**Option B — build locally (needs Rust installed):**

```powershell
npm run tauri build
```

The installer is written to `src-tauri/target/release/bundle/nsis/` (`.exe`).

## Distributing to lab members

Share the `.exe`. On first launch Windows SmartScreen shows a warning (the app is
unsigned) — **More info → Run anyway** (one-time per machine). Installed users do **not**
need Node or Rust.

## Where data is stored

- **Desktop (Tauri):** a local SQLite database in the app's per-user data folder.
  Persists across launches and updates.
- **Browser (dev):** IndexedDB (`mouse_data_app`). Cleared if you clear site data.

Use **Backup → Download backup file** for an off-machine copy; the app also keeps
automatic in-app snapshots you can roll back to.

## Customizing for your study

Define species, housing units, subject fields, and cohorts/groups — without code — via
the experiment setup wizard and templates. See **[docs/CUSTOMIZATION.md](docs/CUSTOMIZATION.md)**.

## V2 data model (for developers)

Full reference: `src/types/v2-data-model.js` and `src/core/schedule.js`.

- `subject.subjectId` — human-readable Mouse ID
- `subject.status` — lowercase: `alive | deceased | removed | transferred`
- `subject.cohortId` / `groupId` — experimental grouping (inherited from the cage)
- `subject.timelineCompletions` / `timelineNotes` — per-scheduled-item check-off + note
- `subject.customFieldValues` — template-defined fields
- Cohorts/groups + their schedules live in `experiment.config.cohorts[].groups[].timeline`
- Hierarchy: **experiments → housing units → subjects → events**, plus **templates**

## Project structure

```
src/
  main.jsx            entry -> AppV2
  AppV2.jsx           app shell: top bar, navigation, dialogs
  components/         HousingUnit{View,Sidebar}, SubjectDrawerV2, EventDialogV2,
                      CohortAssignDialog, GroupScheduleDialog, TimelineNoteField,
                      TaskBoard, BulkEventDialog, SubjectSearch, BackupDialog,
                      Experiment{Switcher,SetupWizard}, Template{Selector,Builder},
                      DynamicField, EnhancedExport
  core/schedule.js    shared timeline computation (drawer + task board)
  core/schema/        template engine, built-in/generic templates, validation, types
  core/export/        export utilities (JSON/CSV)
  storage/            useAppStateV2 (state), idb adapter (idb-tauri = SQLite,
                      idb-browser = IndexedDB), backup.js (snapshots), migration
  models/constants.js status + event-category enums
src-tauri/            Tauri (Rust) shell, SQLite plugin, bundling config
.github/workflows/    build-windows.yml (CI builds the Windows installer)
backups/              pre-merge snapshot of the separate Events+Timeline UI (revertable)
```

## Roadmap / known gaps

- Code-sign the Windows installer to remove the SmartScreen warning.
- macOS build + notarization (when Mac distribution is needed).
- Automated tests (none yet) and CI build verification beyond Windows.

Past design notes and session reports are in `docs/archive/` (may be out of date).
