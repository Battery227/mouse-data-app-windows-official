/**
 * Storage abstraction layer
 * Automatically selects the correct storage adapter based on environment
 */
import { isTauriEnvironment } from './environment.js';

// Dynamic imports for adapters
let storageAdapter = null;

/**
 * Get the appropriate storage adapter for current environment
 * @returns {Promise<{idbGet: Function, idbSet: Function}>}
 */
async function getStorageAdapter() {
  if (storageAdapter) return storageAdapter;

  if (isTauriEnvironment()) {
    console.log('🖥️ Using Tauri SQLite storage adapter');
    storageAdapter = await import('./idb-tauri.jsx');
  } else {
    console.log('🌐 Using browser IndexedDB storage adapter');
    storageAdapter = await import('./idb-browser.js');
  }

  return storageAdapter;
}

/**
 * Get value from storage
 * @param {string} key - Storage key
 * @returns {Promise<any|undefined>}
 */
export async function idbGet(key) {
  try {
    const adapter = await getStorageAdapter();
    return await adapter.idbGet(key);
  } catch (error) {
    console.error('Storage get error:', error);
    return undefined;
  }
}

/**
 * Set value in storage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @returns {Promise<boolean>} True if successful
 */
export async function idbSet(key, value) {
  try {
    const adapter = await getStorageAdapter();
    const result = await adapter.idbSet(key, value);
    
    if (!result) {
      console.error('Storage write failed - data not persisted');
    }
    
    return result;
  } catch (error) {
    console.error('Storage set error:', error);
    return false;
  }
}

/**
 * Delete value from storage
 * @param {string} key - Storage key
 * @returns {Promise<boolean>} True if successful
 */
export async function idbDelete(key) {
  try {
    const adapter = await getStorageAdapter();
    if (adapter.idbDelete) {
      return await adapter.idbDelete(key);
    }
    return false;
  } catch (error) {
    console.error('Storage delete error:', error);
    return false;
  }
}

/**
 * Clear all storage
 * @returns {Promise<boolean>} True if successful
 */
export async function idbClear() {
  try {
    const adapter = await getStorageAdapter();
    if (adapter.idbClear) {
      return await adapter.idbClear();
    }
    return false;
  } catch (error) {
    console.error('Storage clear error:', error);
    return false;
  }
}

/**
 * Get storage info for debugging
 * @returns {Promise<{environment: string, adapter: string}>}
 */
export async function getStorageInfo() {
  const env = isTauriEnvironment() ? 'tauri' : 'browser';
  const adapterType = isTauriEnvironment() ? 'SQLite' : 'IndexedDB';
  
  return {
    environment: env,
    adapter: adapterType,
    available: true
  };
}

// Made with Bob
