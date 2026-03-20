import { describe, it, expect, beforeEach } from 'vitest';
import { InputManager } from './InputManager';

function makeKeyEvent(code: string, type: 'keydown' | 'keyup'): KeyboardEvent {
  return new KeyboardEvent(type, { code, bubbles: true });
}

describe('InputManager', () => {
  let mgr: InputManager;

  beforeEach(() => {
    mgr = new InputManager();
    mgr.attach(window);
    return () => mgr.detach(window);
  });

  it('registers arrow key left/right as held', () => {
    window.dispatchEvent(makeKeyEvent('ArrowRight', 'keydown'));
    const actions = mgr.poll();
    expect(actions.right).toBe(true);
    expect(actions.left).toBe(false);
  });

  it('detects run when Ctrl is held with arrow', () => {
    window.dispatchEvent(makeKeyEvent('ControlLeft', 'keydown'));
    window.dispatchEvent(makeKeyEvent('ArrowRight', 'keydown'));
    const actions = mgr.poll();
    expect(actions.run).toBe(true);
    expect(actions.right).toBe(true);
  });

  it('detects jump on Space (one-shot)', () => {
    window.dispatchEvent(makeKeyEvent('Space', 'keydown'));
    const first = mgr.poll();
    expect(first.jump).toBe(true);
    const second = mgr.poll();
    expect(second.jump).toBe(false);
  });

  it('detects fire on ShiftLeft (held)', () => {
    window.dispatchEvent(makeKeyEvent('ShiftLeft', 'keydown'));
    const actions = mgr.poll();
    expect(actions.fire).toBe(true);
  });

  it('cycleWeapon is one-shot', () => {
    window.dispatchEvent(makeKeyEvent('Tab', 'keydown'));
    const first = mgr.poll();
    expect(first.cycleWeapon).toBe(true);
    const second = mgr.poll();
    expect(second.cycleWeapon).toBe(false);
  });

  it('menu (Escape) is one-shot', () => {
    window.dispatchEvent(makeKeyEvent('Escape', 'keydown'));
    const first = mgr.poll();
    expect(first.menu).toBe(true);
    const second = mgr.poll();
    expect(second.menu).toBe(false);
  });

  it('up/down are one-shot', () => {
    window.dispatchEvent(makeKeyEvent('ArrowUp', 'keydown'));
    const first = mgr.poll();
    expect(first.up).toBe(true);
    const second = mgr.poll();
    expect(second.up).toBe(false);
  });

  it('releases keys on keyup', () => {
    window.dispatchEvent(makeKeyEvent('ArrowLeft', 'keydown'));
    expect(mgr.poll().left).toBe(true);
    window.dispatchEvent(makeKeyEvent('ArrowLeft', 'keyup'));
    expect(mgr.poll().left).toBe(false);
  });

  it('detects aim controls', () => {
    window.dispatchEvent(makeKeyEvent('KeyA', 'keydown'));
    expect(mgr.poll().aimUp).toBe(true);
    window.dispatchEvent(makeKeyEvent('KeyA', 'keyup'));
    window.dispatchEvent(makeKeyEvent('KeyS', 'keydown'));
    expect(mgr.poll().aimDiagUp).toBe(true);
  });
});
