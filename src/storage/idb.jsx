import Database from '@tauri-apps/plugin-sql';

let db = null;

async function getDB() {
  if (db) return db;
  db = await Database.load('sqlite:mouse_data.db');
  await db.execute(`PRAGMA foreign_keys = ON;`);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS app_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
  return db;
}

export async function idbGet(key) {
  try {
    const db = await getDB();
    const rows = await db.select(
      'SELECT value FROM app_state WHERE key = ?',
      [key]
    );
    if (rows.length === 0) return undefined;
    return JSON.parse(rows[0].value);
  } catch (e) {
    console.error('idbGet error:', e);
    return undefined;
  }
}

export async function idbSet(key, value) {
  try {
    const db = await getDB();
    await db.execute(
      'INSERT INTO app_state (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
      [key, JSON.stringify(value)]
    );
    return true;
  } catch (e) {
    console.error('idbSet error:', e);
    return false;
  }
}