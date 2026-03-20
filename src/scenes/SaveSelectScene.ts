import { Text, Graphics, Container } from 'pixi.js';
import { Scene } from './Scene';
import { input } from '../input';
import { loadSave } from '../save/SaveManager';
import type { GameActor } from '../state';
import type { SaveSlot, SaveData } from '../types';

const SLOTS: SaveSlot[] = ['A', 'B', 'C'];

export class SaveSelectScene extends Scene {
  private selectedIndex = 0;
  private slotContainers: Container[] = [];
  private saves: (SaveData | null)[] = [];
  private cursor!: Graphics;

  constructor(actor: GameActor) {
    super(actor);
  }

  onEnter(): void {
    const bg = new Graphics();
    bg.rect(0, 0, this.width, this.height).fill(0x05050f);
    this.container.addChild(bg);

    const heading = new Text({
      text: 'SELECT SAVE SLOT',
      style: { fontFamily: 'monospace', fontSize: 48, fill: 0x00ffcc },
    });
    heading.anchor.set(0.5, 0);
    heading.position.set(this.width / 2, 80);
    this.container.addChild(heading);

    this.saves = SLOTS.map((s) => loadSave(s));

    SLOTS.forEach((slot, i) => {
      const c = new Container();
      const save = this.saves[i];
      const label = save
        ? `Slot ${slot}  \u2013  ${save.currentArea}  ${formatTime(save.playTime)}  ${save.completionPercent}%`
        : `Slot ${slot}  \u2013  [Empty]`;

      const t = new Text({
        text: label,
        style: { fontFamily: 'monospace', fontSize: 30, fill: 0xcccccc },
      });
      t.position.set(80, 0);
      c.addChild(t);
      c.position.set(this.width / 2 - 300, 240 + i * 80);
      this.container.addChild(c);
      this.slotContainers.push(c);
    });

    this.cursor = new Graphics();
    this.cursor.poly([0, 0, 20, 12, 0, 24]).fill(0x00ffcc);
    this.container.addChild(this.cursor);
    this.updateCursor();

    const hint = new Text({
      text: 'ESC \u2013 Back to title',
      style: { fontFamily: 'monospace', fontSize: 20, fill: 0x666666 },
    });
    hint.anchor.set(0.5, 1);
    hint.position.set(this.width / 2, this.height - 40);
    this.container.addChild(hint);
  }

  update(_dt: number): void {
    const actions = input.poll();

    if (actions.menu) {
      this.actor.send({ type: 'RETURN_TO_TITLE' });
      return;
    }

    if (actions.down) {
      this.selectedIndex = (this.selectedIndex + 1) % SLOTS.length;
      this.updateCursor();
    }
    if (actions.up) {
      this.selectedIndex =
        (this.selectedIndex + SLOTS.length - 1) % SLOTS.length;
      this.updateCursor();
    }

    if (actions.confirm) {
      const slot = SLOTS[this.selectedIndex];
      this.actor.send({ type: 'SELECT_SLOT', slot });
      const save = this.saves[this.selectedIndex];
      if (save) {
        this.actor.send({ type: 'SLOT_CONTINUE', saveData: save });
      } else {
        this.actor.send({ type: 'SLOT_NEW_GAME' });
      }
    }
  }

  private updateCursor(): void {
    const target = this.slotContainers[this.selectedIndex];
    if (target) {
      this.cursor.position.set(target.x - 30, target.y + 4);
    }
  }
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
