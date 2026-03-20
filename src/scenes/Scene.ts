import { Container } from "pixi.js";
import type { GameActor } from "../state";

/**
 * Base class for every scene in the game.
 * Each scene owns a PixiJS Container that gets added/removed from the stage.
 */
export abstract class Scene {
  public readonly container = new Container();

  constructor(protected actor: GameActor) {}

  /** Called once when the scene becomes active. */
  abstract onEnter(): void;

  /** Called every frame (delta in seconds). */
  abstract update(dt: number): void;

  /** Called once when the scene is removed. */
  onExit(): void {
    this.container.removeChildren();
  }
}
