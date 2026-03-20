import type { Application } from "pixi.js";
import type { Scene } from "../scenes/Scene";
import type { GameActor } from "../state";

/**
 * Manages the active scene. Listens to XState state transitions
 * and swaps scenes accordingly.
 */
export class SceneManager {
  private currentScene: Scene | null = null;

  constructor(
    private app: Application,
    private actor: GameActor,
    private sceneFactory: (stateValue: string) => Scene | null,
  ) {}

  /** Transition to a new scene keyed by its state name. */
  transitionTo(stateKey: string): void {
    // Tear down old scene
    if (this.currentScene) {
      this.currentScene.onExit();
      this.app.stage.removeChild(this.currentScene.container);
    }

    const next = this.sceneFactory(stateKey);
    if (next) {
      this.currentScene = next;
      this.app.stage.addChild(next.container);
      next.onEnter();
    } else {
      this.currentScene = null;
    }
  }

  /** Called every frame. */
  update(dt: number): void {
    this.currentScene?.update(dt);
  }
}
