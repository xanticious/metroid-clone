import { Text, Graphics, Container } from "pixi.js";
import { Scene } from "./Scene";
import { input } from "../input";
import { loadSave } from "../save/SaveManager";
import type { GameActor } from "../state";
import type { SaveSlot, SaveData } from "../types";

const SLOTS: SaveSlot[] = ["A", "B", "C"];

/**
 * Save-slot selection screen.
 * Shows three slots; player navigates with Up/Down and confirms with Enter.
 * If a slot has save data, "Continue" is offered. Otherwise it's "New Game".
 */
export class SaveSelectScene extends Scene {
  private selectedIndex = 0;
  private slotContainers: Container[] = [];
  private saves: (SaveData | null)[] = [];
  private cursor!: Graphics;

  constructor(
    actor: GameActor,
    private width: number,
    private height: number,
  ) {
    super(actor);
  }

  onEnter(): void {
    const bg = new Graphics();
    bg.rect(0, 0, this.width, this.height).fill(0x0a0a1a);
    this.container.addChild(bg);

    const heading = new Text({
      text: "SELECT SAVE SLOT",
      style: { fontFamily: "monospace", fontSize: 32, fill: 0x00ff88 },
    });
    heading.anchor.set(0.5, 0);
    heading.position.set(this.width / 2, 40);
    this.container.addChild(heading);

    // Load existing saves
    this.saves = SLOTS.map((s) => loadSave(s));

    // Render slots
    SLOTS.forEach((slot, i) => {
      const c = new Container();
      const save = this.saves[i];
      const label = save
        ? `Slot ${slot}  –  ${save.currentArea}  ${this.formatTime(save.playTime)}`
        : `Slot ${slot}  –  [New Game]`;

      const t = new Text({
        text: label,
        style: { fontFamily: "monospace", fontSize: 22, fill: 0xcccccc },
      });
      t.position.set(80, 0);
      c.addChild(t);
      c.position.set(this.width / 2 - 200, 140 + i * 60);
      this.container.addChild(c);
      this.slotContainers.push(c);
    });

    // Cursor
    this.cursor = new Graphics();
    this.cursor.poly([0, 0, 16, 10, 0, 20]).fill(0x00ff88);
    this.container.addChild(this.cursor);
    this.updateCursor();

    // Back hint
    const hint = new Text({
      text: "ESC – Back to title",
      style: { fontFamily: "monospace", fontSize: 16, fill: 0x666666 },
    });
    hint.anchor.set(0.5, 1);
    hint.position.set(this.width / 2, this.height - 20);
    this.container.addChild(hint);
  }

  update(_dt: number): void {
    const actions = input.poll();

    if (actions.menu) {
      this.actor.send({ type: "RETURN_TO_TITLE" });
      return;
    }

    // Navigate slots
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
      this.actor.send({ type: "SELECT_SLOT", slot });
      const save = this.saves[this.selectedIndex];
      if (save) {
        this.actor.send({ type: "CONTINUE_GAME", saveData: save });
      } else {
        this.actor.send({ type: "NEW_GAME" });
      }
    }
  }

  private updateCursor(): void {
    const target = this.slotContainers[this.selectedIndex];
    if (target) {
      this.cursor.position.set(target.x - 30, target.y + 2);
    }
  }

  private formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
}
