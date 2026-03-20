import { describe, it, expect, beforeEach } from "vitest";
import { writeSave, loadSave, deleteSave, createNewSave } from "./SaveManager";

describe("SaveManager", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("creates a new save with default values", () => {
    const save = createNewSave("A");
    expect(save.slot).toBe("A");
    expect(save.health).toBe(99);
    expect(save.items).toEqual([]);
  });

  it("writes and loads a save", () => {
    const save = createNewSave("B");
    save.playTime = 5000;
    writeSave(save);

    const loaded = loadSave("B");
    expect(loaded).not.toBeNull();
    expect(loaded!.playTime).toBe(5000);
    expect(loaded!.slot).toBe("B");
  });

  it("returns null for empty slot", () => {
    expect(loadSave("C")).toBeNull();
  });

  it("deletes a save", () => {
    writeSave(createNewSave("A"));
    expect(loadSave("A")).not.toBeNull();
    deleteSave("A");
    expect(loadSave("A")).toBeNull();
  });

  it("handles corrupted storage gracefully", () => {
    localStorage.setItem("smc_save_A", "not json!!!");
    expect(loadSave("A")).toBeNull();
  });
});
