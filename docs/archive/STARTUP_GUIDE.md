# How to Start the Application

## Quick Start

### Browser Mode (Development)
```bash
npm run dev
```
Then open: **http://localhost:5173/**

### Desktop Mode (Tauri)
```bash
npm run tauri dev
```

## Troubleshooting

### "npm not found"
Install Node.js from https://nodejs.org/ (LTS version recommended)

### "Dependencies not installed"
```bash
npm install
```

### Port 5173 already in use
```bash
# Kill the process using port 5173
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F

# Then restart:
npm run dev
```

### Vite errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Current Status

✅ **App is running V2 architecture**
- All V1 components replaced
- Using AppV2.jsx as main component
- V2 data model throughout

✅ **What works:**
- Add/delete housing units
- Add/delete subjects
- Edit subject fields
- Add/delete events
- Multi-experiment support
- Export/import data

## Browser vs Desktop

### Browser Mode (npm run dev)
- ⚠️ Data stored in browser IndexedDB
- ⚠️ Data persists between sessions BUT can be cleared
- ✅ Faster development/testing
- ✅ No installation needed

### Desktop Mode (npm run tauri dev)
- ✅ Data stored in SQLite database
- ✅ More reliable persistence
- ✅ Native desktop app
- ⚠️ Requires Rust toolchain

## Recommended Workflow

1. **Development/Testing:** Use `npm run dev` (browser mode)
2. **Production Use:** Use `npm run tauri dev` (desktop mode)
3. **Always Export:** Regularly export your data as backup

## Data Location

### Browser Mode
- IndexedDB in browser storage
- Can be viewed in DevTools > Application > IndexedDB

### Desktop Mode
- SQLite database in app data directory
- Location varies by OS

## Next Steps After Startup

1. Create an experiment (or use default "My First Experiment")
2. Add a housing unit (e.g., "Cage 1")
3. Add subjects to the housing unit
4. Fill in subject details
5. Add events as needed
6. Export data regularly!