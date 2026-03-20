import { Text, Graphics } from 'pixi.js';
import { Scene } from './Scene';
import { input } from '../input';
import { PauseMenu } from './PauseMenu';
import type { GameActor } from '../state';

export class GameScene extends Scene {
  private pauseMenu: PauseMenu;
  private playerGfx!: Graphics;
  private hud!: Text;

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

  constructor(actor: GameActor) {
    super(actor);
    this.pauseMenu = new PauseMenu(actor);
    this.px = this.width / 2;
    this.GROUND_Y = this.height - 48;
    this.py = this.GROUND_Y;
  }

  onEnter(): void {
    const bg = new Graphics();
    bg.rect(0, 0, this.width, this.height).fill(0x05050f);
    this.container.addChild(bg);

    const ground = new Graphics();
    ground
      .rect(0, this.GROUND_Y, this.width, this.height - this.GROUND_Y)
      .fill(0x1a1a2e);
    this.container.addChild(ground);

    this.playerGfx = new Graphics();
    this.drawPlayer();
    this.container.addChild(this.playerGfx);

    this.hud = new Text({
      text: 'HP: 99  |  Ammo: 30  |  Pulse Pistol',
      style: { fontFamily: 'monospace', fontSize: 24, fill: 0x00ffcc },
    });
    this.hud.position.set(20, 16);
    this.container.addChild(this.hud);

    this.container.addChild(this.pauseMenu.container);
    this.pauseMenu.hide();
  }

  update(dt: number): void {
    const snapshot = this.actor.getSnapshot();
    const isPaused =
      snapshot.matches({ gameplay: 'paused' }) ||
      snapshot.matches({ gameplay: 'saving' }) ||
      snapshot.matches({ gameplay: 'viewingMap' });

    if (isPaused) {
      this.pauseMenu.update(dt);
      return;
    }

    this.pauseMenu.hide();
    const actions = input.poll();

    if (actions.menu) {
      this.actor.send({ type: 'PAUSE' });
      this.pauseMenu.show();
      return;
    }

    const speed = actions.run ? this.RUN_SPEED : this.MOVE_SPEED;
    this.vx = 0;
    if (actions.left) this.vx = -speed;
    if (actions.right) this.vx = speed;

    if (actions.jump && this.onGround) {
      this.vy = this.JUMP_VELOCITY;
      this.onGround = false;
    }

    if (!this.onGround) {
      this.vy += this.GRAVITY * dt;
    }

    this.px += this.vx * dt;
    this.py += this.vy * dt;

    if (this.py >= this.GROUND_Y) {
      this.py = this.GROUND_Y;
      this.vy = 0;
      this.onGround = true;
    }

    this.px = Math.max(12, Math.min(this.width - 12, this.px));

    this.drawPlayer();
  }

  private drawPlayer(): void {
    this.playerGfx.clear();
    this.playerGfx.rect(this.px - 12, this.py - 48, 24, 48).fill(0xff6600);
    this.playerGfx.rect(this.px - 6, this.py - 44, 12, 6).fill(0x00ffcc);
  }
}
