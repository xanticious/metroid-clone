import { Graphics, Text, Container } from 'pixi.js';
import { GAME_WIDTH } from '../types';

const HP_PER_TANK = 99;
const TANK_W = 120;
const TANK_H = 14;
const TANK_GAP = 4;

export class HUD {
  readonly container: Container;
  private healthGfx: Graphics;
  private ammoText: Text;
  private weaponText: Text;

  constructor() {
    this.container = new Container();

    const bg = new Graphics();
    bg.rect(0, 0, GAME_WIDTH, 48).fill({ color: 0x000000, alpha: 0.75 });
    this.container.addChild(bg);

    const hpLabel = new Text({
      text: 'HP',
      style: { fontFamily: 'monospace', fontSize: 20, fill: 0x0088aa },
    });
    hpLabel.position.set(16, 15);
    this.container.addChild(hpLabel);

    this.healthGfx = new Graphics();
    this.container.addChild(this.healthGfx);

    this.ammoText = new Text({
      text: 'AMMO: \u221e',
      style: { fontFamily: 'monospace', fontSize: 20, fill: 0x00ffcc },
    });
    this.ammoText.position.set(500, 14);
    this.container.addChild(this.ammoText);

    this.weaponText = new Text({
      text: 'PULSE PISTOL',
      style: { fontFamily: 'monospace', fontSize: 20, fill: 0xff00cc },
    });
    this.weaponText.position.set(780, 14);
    this.container.addChild(this.weaponText);
  }

  update(hp: number, maxHp: number, ammo: number | null, weaponName: string): void {
    this.drawHealth(hp, maxHp);
    this.ammoText.text =
      ammo === null ? 'AMMO: \u221e' : `AMMO: ${String(ammo).padStart(3, '0')}`;
    this.weaponText.text = weaponName.toUpperCase();
  }

  private drawHealth(hp: number, maxHp: number): void {
    this.healthGfx.clear();
    const totalTanks = Math.max(1, Math.ceil(maxHp / HP_PER_TANK));
    const x0 = 56;
    const y0 = 17;

    for (let i = 0; i < totalTanks; i++) {
      const tankX = x0 + i * (TANK_W + TANK_GAP);
      const tankFilled = Math.max(0, Math.min(hp - i * HP_PER_TANK, HP_PER_TANK));
      const fillRatio = tankFilled / HP_PER_TANK;

      this.healthGfx.rect(tankX, y0, TANK_W, TANK_H).fill(0x091a2a);
      if (fillRatio > 0) {
        this.healthGfx
          .rect(tankX, y0, Math.floor(TANK_W * fillRatio), TANK_H)
          .fill(hp < HP_PER_TANK * 0.25 ? 0xff2244 : 0x00ffcc);
      }
      // Border lines
      this.healthGfx.rect(tankX, y0, TANK_W, 1).fill(0x0088aa);
      this.healthGfx.rect(tankX, y0 + TANK_H - 1, TANK_W, 1).fill(0x0088aa);
      this.healthGfx.rect(tankX, y0, 1, TANK_H).fill(0x0088aa);
      this.healthGfx.rect(tankX + TANK_W - 1, y0, 1, TANK_H).fill(0x0088aa);
    }
  }
}
