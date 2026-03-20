import { Text, Graphics, Container } from "pixi.js";
import { input } from "../input";
import type { GameActor, GameEvent } from "../state";
import type { MenuOption } from "../types";

const MENU_ITEMS: { label: string; event: MenuOption }[] = [
  { label: "Resume", event: "resume" },
  { label: "Save", event: "save" },
  { label: "View Map", event: "viewMap" },
  { label: "Exit Game", event: "exitGame" },
];

const MACHINE_EVENTS = {
  resume: "RESUME",
  save: "SAVE",
  viewMap: "VIEW_MAP",
  exitGame: "EXIT_GAME",
} as const satisfies Record<MenuOption, GameEvent["type"]>;

/**
 * In-game pause menu overlay.
 * Rendered on top of the game scene. Controlled by arrow keys + Enter.
 */
export class PauseMenu {
  public readonly container = new Container();
  private selectedIndex = 0;
  private cursor!: Graphics;
  private itemTexts: Text[] = [];

  constructor(
    private actor: GameActor,
    private width: number,
    private height: number,
  ) {}

  show(): void {
    this.container.removeChildren();
    this.selectedIndex = 0;

    // Semi-transparent backdrop
    const backdrop = new Graphics();
    backdrop
      .rect(0, 0, this.width, this.height)
      .fill({ color: 0x000000, alpha: 0.7 });
    this.container.addChild(backdrop);

    const panelW = 280;
    const panelH = 260;
    const px = (this.width - panelW) / 2;
    const py = (this.height - panelH) / 2;

    const panel = new Graphics();
    panel
      .roundRect(px, py, panelW, panelH, 8)
      .fill(0x111133)
      .stroke({ color: 0x00ff88, width: 2 });
    this.container.addChild(panel);

    const heading = new Text({
      text: "PAUSED",
      style: { fontFamily: "monospace", fontSize: 26, fill: 0x00ff88 },
    });
    heading.anchor.set(0.5, 0);
    heading.position.set(this.width / 2, py + 16);
    this.container.addChild(heading);

    MENU_ITEMS.forEach((item, i) => {
      const t = new Text({
        text: item.label,
        style: { fontFamily: "monospace", fontSize: 20, fill: 0xcccccc },
      });
      t.position.set(px + 60, py + 70 + i * 40);
      this.container.addChild(t);
      this.itemTexts.push(t);
    });

    this.cursor = new Graphics();
    this.cursor.poly([0, 0, 14, 8, 0, 16]).fill(0x00ff88);
    this.container.addChild(this.cursor);
    this.updateCursor();

    this.container.visible = true;
  }

  hide(): void {
    this.container.visible = false;
  }

  update(_dt: number): void {
    if (!this.container.visible) return;
    const actions = input.poll();

    if (actions.menu) {
      this.actor.send({ type: "RESUME" });
      return;
    }

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
      const item = MENU_ITEMS[this.selectedIndex];
      const machineEvent = MACHINE_EVENTS[item.event];
      this.actor.send({ type: machineEvent });
    }
  }

  private updateCursor(): void {
    const t = this.itemTexts[this.selectedIndex];
    if (t) {
      this.cursor.position.set(t.x - 26, t.y + 3);
    }
  }
}
