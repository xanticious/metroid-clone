import { Graphics, Text, Container } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT } from "../types";

const HP_PER_TANK = 99;
const TANK_W = 120;
const TANK_H = 14;
const TANK_GAP = 4;

const BOSS_BAR_W = 480;
const BOSS_BAR_H = 18;

const ESCAPE_CRITICAL_SECS = 10;

export class HUD {
  readonly container: Container;
  private healthGfx: Graphics;
  private ammoText: Text;
  private weaponText: Text;
  private bossBarContainer: Container;
  private bossBarGfx: Graphics;
  private bossLabel: Text;
  private timerText: Text;

  constructor() {
    this.container = new Container();

    const bg = new Graphics();
    bg.rect(0, 0, GAME_WIDTH, 48).fill({ color: 0x000000, alpha: 0.75 });
    this.container.addChild(bg);

    const hpLabel = new Text({
      text: "HP",
      style: { fontFamily: "monospace", fontSize: 20, fill: 0x0088aa },
    });
    hpLabel.position.set(16, 15);
    this.container.addChild(hpLabel);

    this.healthGfx = new Graphics();
    this.container.addChild(this.healthGfx);

    this.ammoText = new Text({
      text: "AMMO: \u221e",
      style: { fontFamily: "monospace", fontSize: 20, fill: 0x00ffcc },
    });
    this.ammoText.position.set(500, 14);
    this.container.addChild(this.ammoText);

    this.weaponText = new Text({
      text: "PULSE PISTOL",
      style: { fontFamily: "monospace", fontSize: 20, fill: 0xff00cc },
    });
    this.weaponText.position.set(780, 14);
    this.container.addChild(this.weaponText);

    this.bossBarContainer = new Container();
    this.bossBarContainer.visible = false;
    this.container.addChild(this.bossBarContainer);

    const bossBg = new Graphics();
    bossBg
      .rect(0, 0, BOSS_BAR_W, BOSS_BAR_H + 28)
      .fill({ color: 0x000000, alpha: 0.75 });
    this.bossBarContainer.addChild(bossBg);

    this.bossLabel = new Text({
      text: "BOSS",
      style: { fontFamily: "monospace", fontSize: 16, fill: 0xaa00ff },
    });
    this.bossLabel.position.set(8, 4);
    this.bossBarContainer.addChild(this.bossLabel);

    this.bossBarGfx = new Graphics();
    this.bossBarContainer.addChild(this.bossBarGfx);

    this.bossBarContainer.position.set(
      (GAME_WIDTH - BOSS_BAR_W) / 2,
      GAME_HEIGHT - 60,
    );

    this.timerText = new Text({
      text: "",
      style: { fontFamily: "monospace", fontSize: 32, fill: 0xff2244, fontWeight: "bold" },
    });
    this.timerText.anchor.set(0.5, 0);
    this.timerText.position.set(GAME_WIDTH / 2, 56);
    this.timerText.visible = false;
    this.container.addChild(this.timerText);
  }

  update(
    hp: number,
    maxHp: number,
    ammo: number | null,
    weaponName: string,
  ): void {
    this.drawHealth(hp, maxHp);
    this.ammoText.text =
      ammo === null ? "AMMO: \u221e" : `AMMO: ${String(ammo).padStart(3, "0")}`;
    this.weaponText.text = weaponName.toUpperCase();
  }

  showBossBar(bossName: string): void {
    this.bossBarContainer.visible = true;
    this.bossLabel.text = bossName.toUpperCase();
  }

  hideBossBar(): void {
    this.bossBarContainer.visible = false;
  }

  updateBossBar(hp: number, maxHp: number): void {
    this.bossBarGfx.clear();
    const ratio = maxHp > 0 ? hp / maxHp : 0;
    this.bossBarGfx.rect(8, 24, BOSS_BAR_W - 16, BOSS_BAR_H).fill(0x1a001a);
    if (ratio > 0) {
      this.bossBarGfx
        .rect(8, 24, Math.floor((BOSS_BAR_W - 16) * ratio), BOSS_BAR_H)
        .fill(0xaa00ff);
    }
    this.bossBarGfx.rect(8, 24, BOSS_BAR_W - 16, 1).fill(0xff00ff);
    this.bossBarGfx
      .rect(8, 24 + BOSS_BAR_H - 1, BOSS_BAR_W - 16, 1)
      .fill(0xff00ff);
  }

  showEscapeTimer(secondsLeft: number): void {
    this.timerText.visible = true;
    const s = Math.max(0, Math.ceil(secondsLeft));
    const min = Math.floor(s / 60);
    const sec = s % 60;
    this.timerText.text = `SELF-DESTRUCT: ${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    this.timerText.style.fill = secondsLeft <= ESCAPE_CRITICAL_SECS ? 0xff0000 : 0xff4400;
  }

  hideEscapeTimer(): void {
    this.timerText.visible = false;
  }

  private drawHealth(hp: number, maxHp: number): void {
    this.healthGfx.clear();
    const totalTanks = Math.max(1, Math.ceil(maxHp / HP_PER_TANK));
    const x0 = 56;
    const y0 = 17;

    for (let i = 0; i < totalTanks; i++) {
      const tankX = x0 + i * (TANK_W + TANK_GAP);
      const tankFilled = Math.max(
        0,
        Math.min(hp - i * HP_PER_TANK, HP_PER_TANK),
      );
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

