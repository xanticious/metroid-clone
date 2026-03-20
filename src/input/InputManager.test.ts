import { describe, it, expect, beforeEach } from "vitest";
import { InputManager } from "./InputManager";

function makeKeyEvent(code: string, type: "keydown" | "keyup"): KeyboardEvent {
  return new KeyboardEvent(type, { code, bubbles: true });
}

describe("InputManager", () => {
  let mgr: InputManager;

  beforeEach(() => {
    mgr = new InputManager();
    mgr.attach(window);
    return () => mgr.detach(window);
  });

  it("registers arrow key presses", () => {
    window.dispatchEvent(makeKeyEvent("ArrowRight", "keydown"));
    const actions = mgr.poll();
    expect(actions.right).toBe(true);
    expect(actions.left).toBe(false);
  });

  it("detects run when Ctrl is held with arrow", () => {
    window.dispatchEvent(makeKeyEvent("ControlLeft", "keydown"));
    window.dispatchEvent(makeKeyEvent("ArrowRight", "keydown"));
    const actions = mgr.poll();
    expect(actions.run).toBe(true);
    expect(actions.right).toBe(true);
  });

  it("detects jump on Space", () => {
    window.dispatchEvent(makeKeyEvent("Space", "keydown"));
    const actions = mgr.poll();
    expect(actions.jump).toBe(true);
  });

  it("detects fire on ShiftLeft", () => {
    window.dispatchEvent(makeKeyEvent("ShiftLeft", "keydown"));
    const actions = mgr.poll();
    expect(actions.fire).toBe(true);
  });

  it("cycleWeapon is one-shot (only true once per press)", () => {
    window.dispatchEvent(makeKeyEvent("Tab", "keydown"));
    const first = mgr.poll();
    expect(first.cycleWeapon).toBe(true);
    // Second poll in same frame – already consumed
    const second = mgr.poll();
    expect(second.cycleWeapon).toBe(false);
  });

  it("menu (Escape) is one-shot", () => {
    window.dispatchEvent(makeKeyEvent("Escape", "keydown"));
    const first = mgr.poll();
    expect(first.menu).toBe(true);
    const second = mgr.poll();
    expect(second.menu).toBe(false);
  });

  it("releases keys on keyup", () => {
    window.dispatchEvent(makeKeyEvent("ArrowLeft", "keydown"));
    expect(mgr.poll().left).toBe(true);
    window.dispatchEvent(makeKeyEvent("ArrowLeft", "keyup"));
    expect(mgr.poll().left).toBe(false);
  });
});
