/**
 * Local backup: a ring of recent full-state snapshots stored separately from the live
 * state, so an accidental change/import can be rolled back. Works in both browser
 * (IndexedDB) and desktop (SQLite) through the storage adapter.
 */
import { idbGet, idbSet } from "./idb";

const KEY = "backupsV2";
const MAX = 10;

export async function getSnapshots() {
  try {
    return (await idbGet(KEY)) || [];
  } catch {
    return [];
  }
}

export async function pushSnapshot(state) {
  try {
    if (!state) return null;
    const snaps = (await idbGet(KEY)) || [];
    const snap = {
      at: new Date().toISOString(),
      counts: {
        experiments: state.experiments?.length || 0,
        housingUnits: state.housingUnits?.length || 0,
        subjects: state.subjects?.length || 0,
        events: state.events?.length || 0
      },
      state
    };
    const next = [...snaps, snap].slice(-MAX);
    await idbSet(KEY, next);
    return next;
  } catch (e) {
    console.error("Snapshot failed:", e);
    return null;
  }
}

// Made with Bob
