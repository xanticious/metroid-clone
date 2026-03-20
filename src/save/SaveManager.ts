import type { SaveSlot, SaveData } from "../types";

const STORAGE_PREFIX = "su_save_";

export function writeSave(data: SaveData): void {
  const key = STORAGE_PREFIX + data.slot;
  localStorage.setItem(key, JSON.stringify(data));
}

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

export function deleteSave(slot: SaveSlot): void {
  localStorage.removeItem(STORAGE_PREFIX + slot);
}

export function createNewSave(slot: SaveSlot): SaveData {
  return {
    slot,
    playTime: 0,
    currentArea: "underworks",
    currentWorld: "irl",
    items: [],
    abilities: [],
    weapons: ["pulsePistol"],
    health: 99,
    maxHealth: 99,
    ammo: 30,
    maxAmmo: 30,
    positionX: 100,
    positionY: 400,
    visitedRooms: [],
    completionPercent: 0,
  };
}
