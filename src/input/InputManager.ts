/**
 * Input manager – tracks keyboard state and provides a clean API for
 * querying which game actions are active each frame.
 *
 * Controls (matches Super Metroid mapped to keyboard):
 *   Left / Right Arrow ........... move
 *   Ctrl + Left / Right .......... run  (dash after enough distance once acquired)
 *   Space  / Up Arrow ............ jump / wall-jump / double-jump / launch
 *   Down Arrow ................... duck  (double-tap → ball mode once acquired)
 *   Left Shift ................... fire selected weapon
 *   Tab .......................... cycle weapon
 *   Escape ....................... open / close in-game menu
 */

export interface GameActions {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  run: boolean;
  jump: boolean;
  fire: boolean;
  cycleWeapon: boolean;
  menu: boolean;
  confirm: boolean;
  aimUp: boolean;
  aimDiagUp: boolean;
  aimDiagDown: boolean;
  aimDown: boolean;
}

const GAME_KEYS = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Space",
  "ShiftLeft",
  "Tab",
  "Escape",
  "Enter",
  "ControlLeft",
  "ControlRight",
  "KeyA",
  "KeyS",
  "KeyD",
  "KeyF",
]);

export class InputManager {
  private keys = new Map<string, boolean>();
  private justPressed = new Set<string>();
  private consumed = new Set<string>();
  private lastDownPressTime = 0;
  public doubleTapDown = false;

  private readonly DOUBLE_TAP_MS = 250;

  attach(target: EventTarget = window): void {
    target.addEventListener("keydown", this.onKeyDown);
    target.addEventListener("keyup", this.onKeyUp);
  }

  detach(target: EventTarget = window): void {
    target.removeEventListener("keydown", this.onKeyDown);
    target.removeEventListener("keyup", this.onKeyUp);
  }

  endFrame(): void {
    this.justPressed.clear();
    this.consumed.clear();
    this.doubleTapDown = false;
  }

  poll(): GameActions {
    const held = (code: string) => this.keys.get(code) ?? false;
    const just = (code: string) => {
      if (this.justPressed.has(code) && !this.consumed.has(code)) {
        this.consumed.add(code);
        return true;
      }
      return false;
    };

    const ctrl = held("ControlLeft") || held("ControlRight");

    return {
      left: held("ArrowLeft"),
      right: held("ArrowRight"),
      up: just("ArrowUp"),
      down: just("ArrowDown"),
      run: ctrl && (held("ArrowLeft") || held("ArrowRight")),
      jump: just("Space") || just("ArrowUp"),
      fire: held("ShiftLeft"),
      cycleWeapon: just("Tab"),
      menu: just("Escape"),
      confirm: just("Enter"),
      aimUp: held("KeyA"),
      aimDiagUp: held("KeyS"),
      aimDiagDown: held("KeyD"),
      aimDown: held("KeyF"),
    };
  }

  private onKeyDown = (e: Event): void => {
    const ke = e as KeyboardEvent;
    if (GAME_KEYS.has(ke.code)) {
      ke.preventDefault();
    }

    if (!this.keys.get(ke.code)) {
      this.justPressed.add(ke.code);
    }
    this.keys.set(ke.code, true);

    if (ke.code === "ArrowDown") {
      const now = performance.now();
      if (now - this.lastDownPressTime < this.DOUBLE_TAP_MS) {
        this.doubleTapDown = true;
      }
      this.lastDownPressTime = now;
    }
  };

  private onKeyUp = (e: Event): void => {
    this.keys.set((e as KeyboardEvent).code, false);
  };
}

export const input = new InputManager();
