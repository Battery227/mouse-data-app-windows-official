# Lab Setup Guide - For Team Distribution

## What Gets Installed Where

### System-Wide (One-Time Setup)
These install globally on the computer (not in your LAB folder):

1. **Node.js** - Installs to: `C:\Program Files\nodejs\`
   - Adds `npm` command to system PATH
   - Download: https://nodejs.org/ (LTS version)

2. **Rust** (Optional - only for desktop builds)
   - Installs to: `C:\Users\<username>\.cargo\`
   - Adds `cargo` command to system PATH
   - Download: https://rustup.rs/

### Project-Specific (In Your LAB Folder)
These stay in your project folder:

```
C:\Users\alchom\LAB\mouse-data-app-windows-official\
├── node_modules\          (Created by npm install - ~500MB)
├── src\                   (Your code - already here)
├── package.json           (Already here)
└── ...
```

## Quick Setup for Lab Members

### First Time Setup (Each Person)

**Step 1: Install Node.js (5 minutes)**
```
1. Go to: https://nodejs.org/
2. Download LTS version (Windows Installer)
3. Run installer, click Next/Next/Install
4. Restart computer (or at least PowerShell)
```

**Step 2: Clone/Copy Project**
```powershell
# If using Git:
cd C:\Users\<username>\LAB
git clone <repository-url>

# Or just copy the folder:
# Copy mouse-data-app-windows-official folder to your LAB directory
```

**Step 3: Install Project Dependencies**
```powershell
cd C:\Users\<username>\LAB\mouse-data-app-windows-official
npm install
```

This downloads ~500MB of packages into `node_modules\` folder (only in this project).

**Step 4: Run the App**
```powershell
npm run dev
```

Open browser to: http://localhost:5173

## For Distribution to Lab

### Option A: Share the Whole Folder (Recommended)
```
1. Zip the entire mouse-data-app-windows-official folder
2. Share with lab members
3. They extract to their LAB folder
4. They install Node.js (one-time)
5. They run: npm install
6. They run: npm run dev
```

### Option B: Git Repository (Best for Updates)
```
1. Push code to GitHub/GitLab
2. Lab members clone the repo
3. They install Node.js (one-time)
4. They run: npm install
5. They run: npm run dev
```

### Option C: Portable Desktop App (Future)
After Phase 5, we can build a standalone .exe:
```
npm run tauri build
```
This creates a single .exe file that doesn't need Node.js!

## What Lab Members Need

### Minimum (Browser Mode Only)
- ✅ Node.js installed (one-time, system-wide)
- ✅ Project folder copied to their computer
- ✅ Run `npm install` once in project folder
- ✅ Run `npm run dev` to start

### Full (Desktop App Too)
- ✅ Node.js installed
- ✅ Rust installed (one-time, system-wide)
- ✅ Project folder copied
- ✅ Run `npm install` once
- ✅ Run `npm run tauri dev` for desktop app

## File Locations Explained

### Your LAB Folder Structure
```
C:\Users\alchom\LAB\
├── mouse-data-app-windows-official\    ← Your project
│   ├── node_modules\                   ← Packages (created by npm install)
│   ├── src\                            ← Your code
│   ├── package.json                    ← Dependencies list
│   ├── README.md                       ← Documentation
│   └── ...
│
└── audit.txt                           ← Your audit file
```

### System Folders (Don't Touch)
```
C:\Program Files\nodejs\                ← Node.js installation
C:\Users\<username>\.cargo\             ← Rust installation (if installed)
C:\Users\<username>\AppData\Roaming\npm\ ← Global npm packages
```

## Data Storage Locations

### Browser Mode
Data stored in browser's IndexedDB:
- Location: Browser's internal storage
- View in: Chrome DevTools > Application > IndexedDB > mouse_data_app
- Persists: Until browser cache cleared

### Desktop Mode (Tauri)
Data stored in SQLite file:
```
C:\Users\alchom\LAB\mouse-data-app-windows-official\src-tauri\mouse_data.db
```

## Quick Commands Reference

```powershell
# Navigate to project
cd C:\Users\alchom\LAB\mouse-data-app-windows-official

# Install dependencies (first time only)
npm install

# Run in browser (development)
npm run dev

# Run desktop app (development)
npm run tauri dev

# Build for production (browser)
npm run build

# Build desktop app (creates .exe)
npm run tauri build

# Check for issues
npm run lint
```

## Sharing with Lab - Step by Step

### For You (Project Owner)
1. ✅ Code is already in: `C:\Users\alchom\LAB\mouse-data-app-windows-official`
2. ✅ All changes are saved in this folder
3. Option A: Zip the folder and share
4. Option B: Push to Git and share repo link

### For Lab Members
1. Install Node.js from nodejs.org (one-time)
2. Copy project folder to their LAB directory
3. Open PowerShell in project folder
4. Run: `npm install` (one-time, ~5 minutes)
5. Run: `npm run dev`
6. Open: http://localhost:5173

## Troubleshooting

### "npm is not recognized"
- Node.js not installed or PATH not updated
- Solution: Install Node.js, restart PowerShell

### "Cannot find module"
- Dependencies not installed
- Solution: Run `npm install` in project folder

### "Port 5173 already in use"
- Another instance running
- Solution: Close other terminal, or use different port

### "Permission denied"
- Antivirus blocking
- Solution: Add project folder to antivirus exceptions

## Future: Standalone Distribution

After Phase 5, we can create a single .exe file:

```powershell
npm run tauri build
```

Output: `src-tauri\target\release\mouse-data-app.exe`

This .exe:
- ✅ Runs without Node.js
- ✅ Includes everything needed
- ✅ Can be shared as single file
- ✅ Double-click to run

Perfect for lab distribution!

## Summary

**What's in your LAB folder:**
- ✅ All project code
- ✅ node_modules (after npm install)
- ✅ Data files (when using desktop mode)

**What's system-wide:**
- Node.js (needed to run npm commands)
- Rust (optional, only for building desktop app)

**To share with lab:**
- Share the project folder
- They install Node.js
- They run `npm install` once
- They run `npm run dev`

**Easy! 🚀**