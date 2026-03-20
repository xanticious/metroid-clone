import type { SaveSlot, SaveData } from "../types";

const STORAGE_PREFIX = "smc_save_";

/** Persist save data to localStorage. */
export function writeSave(data: SaveData): void {
  const key = STORAGE_PREFIX + data.slot;
  localStorage.setItem(key, JSON.stringify(data));
}

/** Load save data for a slot. Returns null if empty. */
export function loadSave(slot: SaveSlot): SaveData | null {
  const key = STORAGE_PREFIX + slot;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SaveData;
  } catch {
    return null;
  }
}

/** Delete a save slot. */
export function deleteSave(slot: SaveSlot): void {
  localStorage.removeItem(STORAGE_PREFIX + slot);
}

/** Create a blank save for a new game. */
export function createNewSave(slot: SaveSlot): SaveData {
  return {
    slot,
    playerName: "Samus",
    playTime: 0,
    currentArea: "intro",
    items: [],
    abilities: [],
    health: 99,
    maxHealth: 99,
    positionX: 100,
    positionY: 400,
  };
}
