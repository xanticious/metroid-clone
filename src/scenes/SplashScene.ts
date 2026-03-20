import { Text, Graphics } from "pixi.js";
import { Scene } from "./Scene";
import { input } from "../input";
import type { GameActor } from "../state";

/**
 * Splash / Title screen.
 * Shows the game title and "Press ENTER to start".
 */
export class SplashScene extends Scene {
  private blinkTimer = 0;
  private promptText!: Text;

  constructor(
    actor: GameActor,
    private width: number,
    private height: number,
  ) {
    super(actor);
  }

  onEnter(): void {
    // Dark background
    const bg = new Graphics();
    bg.rect(0, 0, this.width, this.height).fill(0x000000);
    this.container.addChild(bg);

    // Title
    const title = new Text({
      text: "SUPER METROID CLONE",
      style: {
        fontFamily: "monospace",
        fontSize: 48,
        fill: 0x00ff88,
        align: "center",
        dropShadow: {
          color: 0x003322,
          distance: 4,
          angle: Math.PI / 4,
          blur: 2,
        },
      },
    });
    title.anchor.set(0.5);
    title.position.set(this.width / 2, this.height * 0.35);
    this.container.addChild(title);

    // Prompt
    this.promptText = new Text({
      text: "Press ENTER to Start",
      style: {
        fontFamily: "monospace",
        fontSize: 22,
        fill: 0xaaaaaa,
        align: "center",
      },
    });
    this.promptText.anchor.set(0.5);
    this.promptText.position.set(this.width / 2, this.height * 0.6);
    this.container.addChild(this.promptText);
  }

  update(dt: number): void {
    // Blink the prompt text
    this.blinkTimer += dt;
    this.promptText.visible = Math.floor(this.blinkTimer * 2) % 2 === 0;

    const actions = input.poll();
    if (actions.confirm) {
      this.actor.send({ type: "START" });
    }
  }
}
