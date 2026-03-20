import { Text, Graphics } from 'pixi.js';
import { Scene } from './Scene';
import { input } from '../input';
import type { GameActor } from '../state';

const LORE_LINES = [
  'March 6, 2089.',
  '',
  'Yesterday, I had no idea my world was going to turn upside down.',
  'I was high on the new echelon pills when I went in to the Manifold.',
  'I saw something down there that spooked me.',
  'It would have spooked anyone.',
  '',
  'MegaCorp has been running experiments in the deep layers of cyberspace.',
  "Things that shouldn't exist. Programs with teeth.",
  'ICE constructs that hunt autonomous agents like animals.',
  '',
  'They think no one knows. They think the Manifold keeps their secrets.',
  "They're wrong.",
  '',
  "My name is ThreadVessel, and I'm going to tear it all down.",
];

const CHARS_PER_SECOND = 28;

export class CinematicScene extends Scene {
  private charIndex = 0;
  private elapsed = 0;
  private loreText!: Text;
  private fullText: string;

  constructor(actor: GameActor) {
    super(actor);
    this.fullText = LORE_LINES.join('\n');
  }

  onEnter(): void {
    const bg = new Graphics();
    bg.rect(0, 0, this.width, this.height).fill(0x020208);
    this.container.addChild(bg);

    const stars = new Graphics();
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * this.width;
      const y = Math.random() * this.height;
      const r = Math.random() * 1.5 + 0.5;
      stars.circle(x, y, r).fill(0xffffff);
    }
    this.container.addChild(stars);

    this.loreText = new Text({
      text: '',
      style: {
        fontFamily: 'monospace',
        fontSize: 28,
        fill: 0x00ffcc,
        wordWrap: true,
        wordWrapWidth: this.width - 240,
        lineHeight: 42,
      },
    });
    this.loreText.position.set(120, 140);
    this.container.addChild(this.loreText);

    const skipText = new Text({
      text: 'Press ENTER or ESC to skip',
      style: { fontFamily: 'monospace', fontSize: 18, fill: 0x444444 },
    });
    skipText.anchor.set(0.5, 1);
    skipText.position.set(this.width / 2, this.height - 30);
    this.container.addChild(skipText);
  }

  update(dt: number): void {
    const actions = input.poll();

    if (actions.confirm || actions.menu) {
      this.actor.send({ type: 'SKIP_CINEMATIC' });
      return;
    }

    this.elapsed += dt;
    const targetChars = Math.floor(this.elapsed * CHARS_PER_SECOND);
    if (targetChars > this.charIndex) {
      this.charIndex = Math.min(targetChars, this.fullText.length);
      this.loreText.text = this.fullText.slice(0, this.charIndex);
    }

    if (this.charIndex >= this.fullText.length) {
      if (this.elapsed > this.fullText.length / CHARS_PER_SECOND + 3) {
        this.actor.send({ type: 'CINEMATIC_COMPLETE' });
      }
    }
  }
}
