import Database from '@tauri-apps/plugin-sql';

let db = null;

export async function getDB() {
  if (db) return db;
  db = await Database.load('sqlite:mouse_data.db');
  await db.execute(`PRAGMA foreign_keys = ON;`);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS cages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      name TEXT NOT NULL,
      cohort TEXT,
      group_name TEXT,
      drug TEXT,
      cohort_summary TEXT,
      capacity INTEGER DEFAULT 5,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS mice (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cage_id INTEGER NOT NULL REFERENCES cages(id) ON DELETE CASCADE,
      slot INTEGER NOT NULL,
      mouse_id TEXT,
      genotype TEXT,
      sex TEXT,
      drug TEXT,
      status TEXT DEFAULT 'ALIVE',
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS lab_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cage_id INTEGER,
      mouse_id INTEGER,
      scope TEXT,
      content TEXT NOT NULL,
      tags TEXT,
      timestamp TEXT DEFAULT (datetime('now'))
    );
  `);
  return db;
}
