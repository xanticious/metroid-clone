import type { Application } from 'pixi.js';
import type { Scene } from '../scenes/Scene';
import type { GameActor } from '../state';

export type SceneFactory = (stateKey: string) => Scene | null;

export class SceneManager {
  private currentScene: Scene | null = null;
  private currentKey: string | null = null;

  constructor(
    private app: Application,
    private sceneFactory: SceneFactory,
  ) {}

  transitionTo(stateKey: string): void {
    if (stateKey === this.currentKey) return;
    this.currentKey = stateKey;

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

  update(dt: number): void {
    this.currentScene?.update(dt);
  }
}

export function topLevelState(value: string | Record<string, unknown>): string {
  return typeof value === 'string' ? value : Object.keys(value)[0];
}
