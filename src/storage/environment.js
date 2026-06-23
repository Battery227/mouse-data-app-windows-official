/**
 * Environment detection utilities
 * Determines if we're running in Tauri desktop app or browser
 */

/**
 * Check if running in Tauri environment
 * @returns {boolean} True if Tauri is available
 */
export function isTauriEnvironment() {
  return typeof window !== 'undefined' && 
         window.__TAURI__ !== undefined &&
         window.__TAURI_INTERNALS__ !== undefined;
}

/**
 * Check if running in browser/dev mode
 * @returns {boolean} True if in browser without Tauri
 */
export function isBrowserEnvironment() {
  return !isTauriEnvironment();
}

/**
 * Get environment name for logging
 * @returns {string} 'tauri' or 'browser'
 */
export function getEnvironmentName() {
  return isTauriEnvironment() ? 'tauri' : 'browser';
}

/**
 * Check if storage is available
 * @returns {Promise<{available: boolean, type: string, error?: string}>}
 */
export async function checkStorageAvailability() {
  if (isTauriEnvironment()) {
    try {
      // Try to import Tauri SQL
      const Database = await import('@tauri-apps/plugin-sql');
      return { available: true, type: 'tauri-sql' };
    } catch (error) {
      return { 
        available: false, 
        type: 'tauri-sql', 
        error: error.message 
      };
    }
  } else {
    // Check IndexedDB availability
    if (typeof indexedDB !== 'undefined') {
      return { available: true, type: 'indexeddb' };
    } else {
      return { 
        available: false, 
        type: 'indexeddb', 
        error: 'IndexedDB not available in this browser' 
      };
    }
  }
}

// Made with Bob
