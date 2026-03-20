import { Text, Graphics } from 'pixi.js';
import { Scene } from './Scene';
import { input } from '../input';
import type { GameActor } from '../state';

export class CreditsScene extends Scene {
  constructor(actor: GameActor) {
    super(actor);
  }

  onEnter(): void {
    const bg = new Graphics();
    bg.rect(0, 0, this.width, this.height).fill(0x05050f);
    this.container.addChild(bg);

    const title = new Text({
      text: 'SUBLEVEL UPRISING',
      style: {
        fontFamily: 'monospace',
        fontSize: 48,
        fill: 0x00ffcc,
      },
    });
    title.anchor.set(0.5);
    title.position.set(this.width / 2, this.height * 0.3);
    this.container.addChild(title);

    const credit = new Text({
      text: 'A cyberpunk Metroidvania experience',
      style: {
        fontFamily: 'monospace',
        fontSize: 28,
        fill: 0x888888,
      },
    });
    credit.anchor.set(0.5);
    credit.position.set(this.width / 2, this.height * 0.45);
    this.container.addChild(credit);

    const hint = new Text({
      text: 'Press ENTER to return to title',
      style: { fontFamily: 'monospace', fontSize: 20, fill: 0x444444 },
    });
    hint.anchor.set(0.5);
    hint.position.set(this.width / 2, this.height * 0.7);
    this.container.addChild(hint);
  }

  update(_dt: number): void {
    const actions = input.poll();
    if (actions.confirm || actions.menu) {
      this.actor.send({ type: 'RETURN_TO_TITLE' });
    }
  }
}
