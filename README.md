# InVivo Research Manager

A local-first desktop app for managing in-vivo research studies — subjects, housing
units, experiments, and event timelines — fully customizable to any species or
protocol through a template system. No coding required to adapt it to your study.

Built with React + Vite + MUI, packaged as a native desktop app with Tauri (Rust).
Data is stored locally (SQLite in the desktop app, IndexedDB in the browser) and the
app works fully offline.

## Status

Active development. The V2 application is the live app and builds cleanly; day-to-day
use works. A few capabilities are built but not yet wired into the UI (template-driven
validation, an alternate import component) — see [Roadmap](#roadmap--known-gaps).

- **Platform focus: Windows** (desktop build via Tauri). macOS/Linux are supported by
  Tauri but are not yet set up in CI or code-signed.
- The desktop installer is **not yet code-signed**, so Windows SmartScreen warns on
  first run — click *More info → Run anyway* (one-time per machine).
- Until automated backups land, **export a JSON backup periodically**.

## Requirements

- **Node.js LTS** (<https://nodejs.org>) — required to run and develop.
- **Rust** (<https://rustup.rs>) — required *only* to build the desktop app.

## Run & build

```powershell
npm install            # one-time: install dependencies

npm run dev            # browser dev server -> http://localhost:5173
npm run tauri dev      # desktop app (dev) — requires Rust

npm run build          # build the web frontend into dist/
npm run tauri build    # build the desktop app + Windows installer
```

The desktop installer is written to `src-tauri/target/release/bundle/nsis/` (`.exe`).

## Distributing to lab members (Windows)

1. Build the installer: `npm run tauri build`.
2. Share the `.exe` from `src-tauri/target/release/bundle/nsis/`.
3. On first launch, Windows SmartScreen shows a warning (the app is unsigned) — click
   **More info → Run anyway**. This is one-time per machine.

Installed users do **not** need Node or Rust — those are only needed to *build* the app.

## Where data is stored

- **Desktop (Tauri):** a local SQLite database in the app's per-user data folder,
  managed by the OS. Persists across launches and updates.
- **Browser (dev):** the browser's IndexedDB (`mouse_data_app`). Cleared if you clear
  site data.

Use **Export** (JSON) for portable backups and to move data between machines.

## Customizing for your study

The template system lets you define species, housing units, subject fields, event
types, protocols, and groups — without code. See **[docs/CUSTOMIZATION.md](docs/CUSTOMIZATION.md)**.

## V2 data model (for developers)

The live app uses the V2 schema. Full reference: `src/types/v2-data-model.js`.

- `subject.subjectId` — human-readable ID (not nested under `subject.subject`)
- `subject.status` — lowercase: `alive | deceased | removed | transferred`
- `subject.customFieldValues` — template-defined fields live here (not as root props)
- Entity hierarchy: **experiments → housing units → subjects → events**, plus **templates**

## Project structure

```
src/
  main.jsx            entry point -> AppV2
  AppV2.jsx           app shell: layout, navigation, top bar
  components/         V2 UI — HousingUnit{View,Sidebar}, SubjectDrawerV2,
                      EventDialogV2, Experiment{Switcher,SetupWizard},
                      ScheduleTimeline, Template{Selector,Builder},
                      DynamicField, EnhancedExport
  storage/            useAppStateV2 (state) + idb adapter
                      (idb-tauri = SQLite, idb-browser = IndexedDB),
                      environment detection, V1->V2 migration
  core/schema/        template engine, built-in/generic templates, validation, types
  core/export/        export utilities (JSON/CSV)
  models/constants.js status + event-category enums
src-tauri/            Tauri (Rust) shell, SQLite plugin, bundling config
.github/workflows/    build-windows.yml (CI builds the Windows installer)
```

## Roadmap / known gaps

- Wire template-driven validation (`src/core/schema/validation.ts`) into the forms.
- Add convenience npm scripts (`tauri:dev`, `tauri:build`).
- macOS build + code-signing/notarization (when Mac distribution is needed).
- Automated tests (none yet) and CI build verification beyond Windows.
- Code-sign the Windows installer to remove the SmartScreen warning.

Past design notes, audits, and session reports are kept in `docs/archive/` for
reference — they describe earlier states of the project and may be out of date.
