import { Text, Graphics } from 'pixi.js';
import { Scene } from './Scene';
import { input } from '../input';
import type { GameActor, GameEvent } from '../state';

const MENU_ITEMS: { label: string; event: GameEvent['type'] }[] = [
  { label: 'New Game', event: 'NEW_GAME' },
  { label: 'Continue', event: 'CONTINUE' },
  { label: 'Credits', event: 'CREDITS' },
];

export class SplashScene extends Scene {
  private blinkTimer = 0;
  private selectedIndex = 0;
  private cursor!: Graphics;
  private itemTexts: Text[] = [];

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
        fontSize: 72,
        fill: 0x00ffcc,
        align: 'center',
        dropShadow: {
          color: 0x003322,
          distance: 6,
          angle: Math.PI / 4,
          blur: 4,
        },
      },
    });
    title.anchor.set(0.5);
    title.position.set(this.width / 2, this.height * 0.3);
    this.container.addChild(title);

    const startY = this.height * 0.55;
    MENU_ITEMS.forEach((item, i) => {
      const t = new Text({
        text: item.label,
        style: {
          fontFamily: 'monospace',
          fontSize: 32,
          fill: 0xaaaaaa,
        },
      });
      t.anchor.set(0.5);
      t.position.set(this.width / 2, startY + i * 60);
      this.container.addChild(t);
      this.itemTexts.push(t);
    });

    this.cursor = new Graphics();
    this.cursor.poly([0, 0, 20, 12, 0, 24]).fill(0x00ffcc);
    this.container.addChild(this.cursor);
    this.updateCursor();
  }

  update(dt: number): void {
    this.blinkTimer += dt;
    const actions = input.poll();

    if (actions.down) {
      this.selectedIndex = (this.selectedIndex + 1) % MENU_ITEMS.length;
      this.updateCursor();
    }
    if (actions.up) {
      this.selectedIndex =
        (this.selectedIndex + MENU_ITEMS.length - 1) % MENU_ITEMS.length;
      this.updateCursor();
    }
    if (actions.confirm) {
      this.actor.send({
        type: MENU_ITEMS[this.selectedIndex].event,
      } as GameEvent);
    }
  }

  private updateCursor(): void {
    this.itemTexts.forEach((t, i) => {
      t.style.fill = i === this.selectedIndex ? 0x00ffcc : 0xaaaaaa;
    });
    const target = this.itemTexts[this.selectedIndex];
    this.cursor.position.set(target.x - 120, target.y - 12);
  }
}
