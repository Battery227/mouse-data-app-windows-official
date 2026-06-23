# Setup Instructions - Getting Started

## Prerequisites Installation

### 1. Install Node.js (Required for npm)

**Windows:**
1. Download from: https://nodejs.org/
2. Choose "LTS" version (recommended)
3. Run installer, accept defaults
4. Restart PowerShell/terminal after install

**Verify installation:**
```powershell
node --version  # Should show v20.x.x or similar
npm --version   # Should show 10.x.x or similar
```

### 2. Install Rust (Required for Tauri desktop app)

**Windows:**
1. Download from: https://rustup.rs/
2. Run installer
3. Follow prompts (accept defaults)
4. Restart terminal after install

**Verify installation:**
```powershell
rustc --version  # Should show rustc 1.x.x
cargo --version  # Should show cargo 1.x.x
```

## Project Setup

### 1. Navigate to Project
```powershell
cd C:\Users\alchom\LAB\mouse-data-app-windows-official
```

### 2. Install Dependencies
```powershell
npm install
```

This will install all required packages (~5 minutes first time).

### 3. Run the App

**Browser Mode (Development):**
```powershell
npm run dev
```
Then open: http://localhost:5173

**Desktop Mode (Tauri):**
```powershell
npm run tauri dev
```
This builds and runs the desktop app.

## Troubleshooting

### "npm is not recognized"
- Node.js not installed or not in PATH
- Solution: Install Node.js from nodejs.org
- Restart terminal after install

### "cargo is not recognized"  
- Rust not installed
- Solution: Install from rustup.rs
- Only needed for desktop app (npm run tauri dev)

### Port 5173 already in use
```powershell
# Kill the process using the port
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F
```

### Dependencies fail to install
```powershell
# Clear cache and retry
npm cache clean --force
rm -r node_modules
rm package-lock.json
npm install
```

## What You'll See After Phase 1

### Browser Mode
- App loads at http://localhost:5173
- Console shows: `📦 Storage initialized: { environment: 'browser', adapter: 'IndexedDB' }`
- Add data (cage, mouse, event)
- Reload page - data persists! ✅

### Desktop Mode  
- Native window opens
- Console shows: `📦 Storage initialized: { environment: 'tauri', adapter: 'SQLite' }`
- Add data
- Close and reopen - data persists! ✅

## Next Steps After Setup

1. Install Node.js and Rust
2. Run `npm install` in project directory
3. Test with `npm run dev`
4. Let me know if it works
5. Then I'll continue with Phase 2 & 3

## Quick Reference

```powershell
# Development (browser)
npm run dev

# Desktop app
npm run tauri dev

# Build for production
npm run build
npm run tauri build

# Lint code
npm run lint