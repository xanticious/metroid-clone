import { Text, Graphics } from "pixi.js";
import { Scene } from "./Scene";
import { input } from "../input";
import type { GameActor } from "../state";

/**
 * Opening cinematic – lore text is typed character-by-character while
 * a visual backdrop plays below. The player can press Enter or Escape
 * at any time to skip to gameplay.
 */
const LORE_LINES = [
  "The year is 20X5.",
  "The galaxy is in turmoil.",
  "",
  "The Space Pirates have stolen the last Metroid",
  "from the Galactic Federation research station.",
  "",
  "Bounty hunter Samus Aran has been dispatched",
  "to planet Zebes to recover the specimen",
  "and eliminate the Space Pirate threat.",
  "",
  "The fate of the galaxy rests in her hands…",
];

const CHARS_PER_SECOND = 28;

export class CinematicScene extends Scene {
  private charIndex = 0;
  private elapsed = 0;
  private loreText!: Text;
  private skipText!: Text;
  private fullText: string;

  constructor(
    actor: GameActor,
    private width: number,
    private height: number,
  ) {
    super(actor);
    this.fullText = LORE_LINES.join("\n");
  }

  onEnter(): void {
    // Starfield background
    const bg = new Graphics();
    bg.rect(0, 0, this.width, this.height).fill(0x000011);
    this.container.addChild(bg);

    // Randomly placed "stars"
    const stars = new Graphics();
    for (let i = 0; i < 120; i++) {
      const x = Math.random() * this.width;
      const y = Math.random() * this.height;
      const r = Math.random() * 1.5 + 0.5;
      stars.circle(x, y, r).fill(0xffffff);
    }
    this.container.addChild(stars);

    // Lore text (typed out)
    this.loreText = new Text({
      text: "",
      style: {
        fontFamily: "monospace",
        fontSize: 20,
        fill: 0x88ccff,
        wordWrap: true,
        wordWrapWidth: this.width - 120,
        lineHeight: 30,
      },
    });
    this.loreText.position.set(60, 80);
    this.container.addChild(this.loreText);

    // Skip hint
    this.skipText = new Text({
      text: "Press ENTER or ESC to skip",
      style: { fontFamily: "monospace", fontSize: 14, fill: 0x555555 },
    });
    this.skipText.anchor.set(0.5, 1);
    this.skipText.position.set(this.width / 2, this.height - 16);
    this.container.addChild(this.skipText);
  }

  update(dt: number): void {
    const actions = input.poll();

    // Skip cinematic
    if (actions.confirm || actions.menu) {
      this.actor.send({ type: "SKIP_CINEMATIC" });
      return;
    }

    // Type text
    this.elapsed += dt;
    const targetChars = Math.floor(this.elapsed * CHARS_PER_SECOND);
    if (targetChars > this.charIndex) {
      this.charIndex = Math.min(targetChars, this.fullText.length);
      this.loreText.text = this.fullText.slice(0, this.charIndex);
    }

    // Auto-advance when done
    if (this.charIndex >= this.fullText.length) {
      // wait a beat then advance
      if (this.elapsed > this.fullText.length / CHARS_PER_SECOND + 3) {
        this.actor.send({ type: "CINEMATIC_COMPLETE" });
      }
    }
  }
}
