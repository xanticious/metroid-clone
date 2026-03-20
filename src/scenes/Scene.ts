import { Container } from 'pixi.js';
import type { GameActor } from '../state';
import { GAME_WIDTH, GAME_HEIGHT } from '../types';

export abstract class Scene {
  public readonly container = new Container();
  protected readonly width = GAME_WIDTH;
  protected readonly height = GAME_HEIGHT;

  constructor(protected actor: GameActor) {}

  abstract onEnter(): void;
  abstract update(dt: number): void;

  onExit(): void {
    this.container.removeChildren();
  }
}
