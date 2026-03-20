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
  confirm: boolean; // Enter  – for menu / dialog confirm
}

type ActionName = keyof GameActions;

const _EMPTY_ACTIONS: Readonly<GameActions> = Object.freeze({
  left: false,
  right: false,
  up: false,
  down: false,
  run: false,
  jump: false,
  fire: false,
  cycleWeapon: false,
  menu: false,
  confirm: false,
});

/** Keys that should be "just pressed" – only true for a single poll cycle */
const _ONE_SHOT_ACTIONS: ReadonlySet<ActionName> = new Set([
  "cycleWeapon",
  "menu",
  "confirm",
]);

export class InputManager {
  /** Raw key-down state keyed by `event.code` */
  private keys = new Map<string, boolean>();

  /** Keys pressed this frame (for one-shot detection) */
  private justPressed = new Set<string>();

  /** Keys already consumed by a one-shot read */
  private consumed = new Set<string>();

  /** Timestamp of last Down press (for ball-mode double-tap) */
  private lastDownPressTime = 0;
  /** True when a double-tap-down was detected this frame */
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

  /** Call once per frame AFTER reading `poll()` to reset one-shot state. */
  endFrame(): void {
    this.justPressed.clear();
    this.consumed.clear();
    this.doubleTapDown = false;
  }

  /** Snapshot current actions. */
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
      up: held("ArrowUp"),
      down: held("ArrowDown"),
      run: ctrl && (held("ArrowLeft") || held("ArrowRight")),
      jump: held("Space") || held("ArrowUp"),
      fire: held("ShiftLeft"),
      cycleWeapon: just("Tab"),
      menu: just("Escape"),
      confirm: just("Enter"),
    };
  }

  // ------ internal handlers ------

  private onKeyDown = (e: Event): void => {
    const ke = e as KeyboardEvent;
    // Prevent browser defaults for game keys
    if (this.isGameKey(ke.code)) {
      ke.preventDefault();
    }

    if (!this.keys.get(ke.code)) {
      this.justPressed.add(ke.code);
    }
    this.keys.set(ke.code, true);

    // Double-tap down detection
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

  private isGameKey(code: string): boolean {
    return [
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
    ].includes(code);
  }
}

/** Singleton input manager */
export const input = new InputManager();
