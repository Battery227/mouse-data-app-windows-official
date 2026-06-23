/**
 * Browser storage adapter using IndexedDB
 * Provides same interface as Tauri SQL adapter
 */

const DB_NAME = 'mouse_data_app';
const DB_VERSION = 1;
const STORE_NAME = 'app_state';

let dbInstance = null;

/**
 * Open IndexedDB connection
 * @returns {Promise<IDBDatabase>}
 */
async function openDB() {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB: ' + request.error));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
  });
}

/**
 * Get value from IndexedDB
 * @param {string} key - Storage key
 * @returns {Promise<any|undefined>} Parsed value or undefined
 */
export async function idbGet(key) {
  try {
    const db = await openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        if (request.result && request.result.value) {
          try {
            resolve(JSON.parse(request.result.value));
          } catch (e) {
            console.error('Failed to parse stored value:', e);
            resolve(undefined);
          }
        } else {
          resolve(undefined);
        }
      };

      request.onerror = () => {
        console.error('idbGet error:', request.error);
        resolve(undefined);
      };
    });
  } catch (e) {
    console.error('idbGet error:', e);
    return undefined;
  }
}

/**
 * Set value in IndexedDB
 * @param {string} key - Storage key
 * @param {any} value - Value to store (will be JSON stringified)
 * @returns {Promise<boolean>} True if successful
 */
export async function idbSet(key, value) {
  try {
    const db = await openDB();
    
    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const data = {
        key: key,
        value: JSON.stringify(value)
      };
      
      const request = store.put(data);

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = () => {
        console.error('idbSet error:', request.error);
        resolve(false);
      };

      transaction.onerror = () => {
        console.error('idbSet transaction error:', transaction.error);
        resolve(false);
      };
    });
  } catch (e) {
    console.error('idbSet error:', e);
    return false;
  }
}

/**
 * Delete value from IndexedDB
 * @param {string} key - Storage key
 * @returns {Promise<boolean>} True if successful
 */
export async function idbDelete(key) {
  try {
    const db = await openDB();
    
    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = () => {
        console.error('idbDelete error:', request.error);
        resolve(false);
      };
    });
  } catch (e) {
    console.error('idbDelete error:', e);
    return false;
  }
}

/**
 * Clear all data from IndexedDB
 * @returns {Promise<boolean>} True if successful
 */
export async function idbClear() {
  try {
    const db = await openDB();
    
    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = () => {
        console.error('idbClear error:', request.error);
        resolve(false);
      };
    });
  } catch (e) {
    console.error('idbClear error:', e);
    return false;
  }
}

// Made with Bob
