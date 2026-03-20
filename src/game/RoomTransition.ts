import { Graphics } from "pixi.js";
import type { Container } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT } from "../types";

type TransitionState = "idle" | "fadingOut" | "fadingIn";

const FADE_DURATION = 0.4;

export class RoomTransition {
  private overlay: Graphics;
  private state: TransitionState = "idle";
  private timer = 0;
  private onMidpoint: (() => void) | null = null;
  private onComplete: (() => void) | null = null;

  constructor(parent: Container) {
    this.overlay = new Graphics();
    this.overlay.rect(0, 0, GAME_WIDTH, GAME_HEIGHT).fill(0x000000);
    this.overlay.alpha = 0;
    parent.addChild(this.overlay);
  }

  get active(): boolean {
    return this.state !== "idle";
  }

  start(onMidpoint: () => void, onComplete: () => void): void {
    if (this.state !== "idle") return;
    this.onMidpoint = onMidpoint;
    this.onComplete = onComplete;
    this.state = "fadingOut";
    this.timer = 0;
    this.overlay.alpha = 0;
  }

  update(dt: number): void {
    if (this.state === "idle") return;

    this.timer += dt;
    const t = Math.min(this.timer / FADE_DURATION, 1);

    if (this.state === "fadingOut") {
      this.overlay.alpha = t;
      if (t >= 1) {
        this.onMidpoint?.();
        this.onMidpoint = null;
        this.state = "fadingIn";
        this.timer = 0;
      }
    } else if (this.state === "fadingIn") {
      this.overlay.alpha = 1 - t;
      if (t >= 1) {
        this.overlay.alpha = 0;
        this.state = "idle";
        this.onComplete?.();
        this.onComplete = null;
      }
    }
  }
}
