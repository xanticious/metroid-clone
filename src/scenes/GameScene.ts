import { Text, Graphics } from "pixi.js";
import { Scene } from "./Scene";
import { input } from "../input";
import { PauseMenu } from "./PauseMenu";
import type { GameActor } from "../state";

/**
 * Main gameplay scene shell.
 * Draws a placeholder level area, player rectangle, and handles
 * basic movement + shooting stubs. The pause menu overlays on top.
 */
export class GameScene extends Scene {
  private pauseMenu: PauseMenu;
  private playerGfx!: Graphics;
  private hud!: Text;

  // Simple player state
  private px: number;
  private py: number;
  private vx = 0;
  private vy = 0;
  private onGround = true;

  private readonly GRAVITY = 900;
  private readonly MOVE_SPEED = 200;
  private readonly RUN_SPEED = 340;
  private readonly JUMP_VELOCITY = -420;
  private readonly GROUND_Y: number;

  constructor(
    actor: GameActor,
    private width: number,
    private height: number,
  ) {
    super(actor);
    this.pauseMenu = new PauseMenu(actor, width, height);
    this.px = width / 2;
    this.GROUND_Y = height - 48;
    this.py = this.GROUND_Y;
  }

  onEnter(): void {
    // Background
    const bg = new Graphics();
    bg.rect(0, 0, this.width, this.height).fill(0x0c0c20);
    this.container.addChild(bg);

    // Ground
    const ground = new Graphics();
    ground
      .rect(0, this.GROUND_Y, this.width, this.height - this.GROUND_Y)
      .fill(0x333355);
    this.container.addChild(ground);

    // Player placeholder
    this.playerGfx = new Graphics();
    this.drawPlayer();
    this.container.addChild(this.playerGfx);

    // HUD
    this.hud = new Text({
      text: "HP: 99  |  Weapon: Power Beam",
      style: { fontFamily: "monospace", fontSize: 16, fill: 0x00ff88 },
    });
    this.hud.position.set(12, 8);
    this.container.addChild(this.hud);

    // Pause menu layer (starts hidden)
    this.container.addChild(this.pauseMenu.container);
    this.pauseMenu.hide();
  }

  update(dt: number): void {
    // Check state for pause
    const snapshot = this.actor.getSnapshot();
    const isPaused =
      snapshot.matches({ gameplay: "paused" }) ||
      snapshot.matches({ gameplay: "saving" }) ||
      snapshot.matches({ gameplay: "viewingMap" });

    if (isPaused) {
      this.pauseMenu.update(dt);
      return;
    }

    this.pauseMenu.hide();
    const actions = input.poll();

    // Pause
    if (actions.menu) {
      this.actor.send({ type: "PAUSE" });
      this.pauseMenu.show();
      return;
    }

    // Horizontal movement
    const speed = actions.run ? this.RUN_SPEED : this.MOVE_SPEED;
    this.vx = 0;
    if (actions.left) this.vx = -speed;
    if (actions.right) this.vx = speed;

    // Jump
    if (actions.jump && this.onGround) {
      this.vy = this.JUMP_VELOCITY;
      this.onGround = false;
    }

    // Gravity
    if (!this.onGround) {
      this.vy += this.GRAVITY * dt;
    }

    // Apply velocity
    this.px += this.vx * dt;
    this.py += this.vy * dt;

    // Ground collision
    if (this.py >= this.GROUND_Y) {
      this.py = this.GROUND_Y;
      this.vy = 0;
      this.onGround = true;
    }

    // Keep player within bounds
    this.px = Math.max(12, Math.min(this.width - 12, this.px));

    // Fire stub
    if (actions.fire) {
      // TODO: spawn bullet entity
    }

    this.drawPlayer();
  }

  private drawPlayer(): void {
    this.playerGfx.clear();
    // Body
    this.playerGfx.rect(this.px - 12, this.py - 40, 24, 40).fill(0xff6600);
    // Visor
    this.playerGfx.rect(this.px - 6, this.py - 36, 12, 6).fill(0x00ffcc);
  }
}
