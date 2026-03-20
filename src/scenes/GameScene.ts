import { Container, Graphics } from 'pixi.js';
import { Scene } from './Scene';
import { input } from '../input';
import { PauseMenu } from './PauseMenu';
import type { GameActor } from '../state';
import { parseTmx, type CollisionRect } from '../maps';
import { Camera, HUD } from '../game';
import { PulsePistol, type Projectile } from '../weapons';
import { Crawler } from '../enemies';
import { CAMERA_ZOOM } from '../types';
import introRoomTmx from '../../tiled/intro_room_01.tmx?raw';

const GRAVITY = 900;
const MAX_FALL_SPEED = 1200;
const MOVE_SPEED = 200;
const RUN_SPEED = 340;
const JUMP_VELOCITY = -420;
const WALL_JUMP_VX = 300;
const WALL_JUMP_LOCK = 0.15;

const PLAYER_W = 24;
const PLAYER_H = 48;
const PLAYER_HW = PLAYER_W / 2;
const PLAYER_MAX_HP = 99;
const PLAYER_INV_TIME = 1.0;
const CRAWLER_CONTACT_DAMAGE = 10;

function overlapsX(
  aLeft: number,
  aRight: number,
  bLeft: number,
  bRight: number,
): boolean {
  return aLeft < bRight && aRight > bLeft;
}

function overlapsY(
  aTop: number,
  aBottom: number,
  bTop: number,
  bBottom: number,
): boolean {
  return aTop < bBottom && aBottom > bTop;
}

export class GameScene extends Scene {
  private pauseMenu: PauseMenu;
  private world!: Container;
  private playerGfx!: Graphics;
  private projectileGfx!: Graphics;
  private crawlerGfx!: Graphics;
  private hud!: HUD;
  private camera = new Camera();

  private px: number;
  private py: number;
  private vx = 0;
  private vy = 0;
  private onGround = false;
  private onWallLeft = false;
  private onWallRight = false;
  private wallJumpLockTimer = 0;
  private facing: 1 | -1 = 1;

  private playerHp = PLAYER_MAX_HP;
  private readonly playerMaxHp = PLAYER_MAX_HP;
  private playerInvTimer = 0;
  private playerBlinkOn = true;
  private readonly spawnX: number;
  private readonly spawnY: number;

  private weapon = new PulsePistol();
  private projectiles: Projectile[] = [];
  private crawlers: Crawler[] = [];

  private roomWidth: number;
  private roomHeight: number;
  private collisions: CollisionRect[];

  constructor(actor: GameActor) {
    super(actor);
    this.pauseMenu = new PauseMenu(actor);

    const room = parseTmx(introRoomTmx);
    this.collisions = room.collisions;
    this.roomWidth = room.widthPx;
    this.roomHeight = room.heightPx;

    const spawn = room.entities.find((e) => e.type === 'player_spawn');
    this.px = spawn?.x ?? this.width / 2;
    this.py = spawn?.y ?? this.height / 2;
    this.spawnX = this.px;
    this.spawnY = this.py;

    for (const entity of room.entities) {
      if (entity.type === 'enemy_crawler') {
        this.crawlers.push(new Crawler(entity.x, entity.y));
      }
    }
  }

  onEnter(): void {
    this.world = new Container();
    this.container.addChild(this.world);

    const bg = new Graphics();
    bg.rect(0, 0, this.roomWidth, this.roomHeight).fill(0x0a0a14);
    this.world.addChild(bg);

    const colGfx = new Graphics();
    for (const rect of this.collisions) {
      colGfx.rect(rect.x, rect.y, rect.width, rect.height).fill(0x1e3a5f);
    }
    this.world.addChild(colGfx);

    this.crawlerGfx = new Graphics();
    this.world.addChild(this.crawlerGfx);

    this.projectileGfx = new Graphics();
    this.world.addChild(this.projectileGfx);

    this.playerGfx = new Graphics();
    this.world.addChild(this.playerGfx);
    this.drawPlayer();

    this.hud = new HUD();
    this.container.addChild(this.hud.container);
    this.hud.update(this.playerHp, this.playerMaxHp, null, 'Pulse Pistol');

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

    this.weapon.update(dt);
    this.updatePhysics(dt, actions);
    this.updateFiring(actions);
    this.updateProjectiles(dt);
    this.updateCrawlers(dt);
    this.checkProjectileCrawlerHits();
    this.checkPlayerCrawlerContact();
    this.updateInvincibility(dt);

    this.camera.update(
      this.px,
      this.py - PLAYER_H / 2,
      this.roomWidth,
      this.roomHeight,
    );
    this.world.scale.set(CAMERA_ZOOM);
    this.world.position.set(
      -this.camera.x * CAMERA_ZOOM,
      -this.camera.y * CAMERA_ZOOM,
    );

    this.hud.update(this.playerHp, this.playerMaxHp, null, 'Pulse Pistol');
    this.drawPlayer();
    this.drawProjectiles();
    this.drawCrawlers();
  }

  private updatePhysics(
    dt: number,
    actions: ReturnType<typeof input.poll>,
  ): void {
    if (this.wallJumpLockTimer > 0) {
      this.wallJumpLockTimer -= dt;
    }

    const canControl = this.wallJumpLockTimer <= 0;
    if (canControl) {
      const speed = actions.run ? RUN_SPEED : MOVE_SPEED;
      this.vx = 0;
      if (actions.left) {
        this.vx = -speed;
        this.facing = -1;
      }
      if (actions.right) {
        this.vx = speed;
        this.facing = 1;
      }
    }

    if (actions.jump) {
      if (this.onGround) {
        this.vy = JUMP_VELOCITY;
        this.onGround = false;
      } else if (this.onWallLeft || this.onWallRight) {
        this.vy = JUMP_VELOCITY;
        this.vx = this.onWallLeft ? WALL_JUMP_VX : -WALL_JUMP_VX;
        this.wallJumpLockTimer = WALL_JUMP_LOCK;
        this.onWallLeft = false;
        this.onWallRight = false;
      }
    }

    this.vy = Math.min(this.vy + GRAVITY * dt, MAX_FALL_SPEED);

    this.px += this.vx * dt;
    this.onWallLeft = false;
    this.onWallRight = false;
    this.resolveHorizontal();

    this.py += this.vy * dt;
    this.onGround = false;
    this.resolveVertical();
  }

  private updateFiring(actions: ReturnType<typeof input.poll>): void {
    if (!actions.fire) return;
    const muzzleX = this.px + this.facing * (PLAYER_HW + 2);
    const muzzleY = this.py - PLAYER_H * 0.5;
    const projectile = this.weapon.tryFire(
      muzzleX,
      muzzleY,
      this.facing,
      actions.aimUp,
      actions.aimDiagUp,
      actions.aimDiagDown,
      actions.aimDown,
    );
    if (projectile) this.projectiles.push(projectile);
  }

  private updateProjectiles(dt: number): void {
    for (const p of this.projectiles) {
      p.update(dt, this.collisions);
    }
    this.projectiles = this.projectiles.filter((p) => p.alive);
  }

  private updateCrawlers(dt: number): void {
    for (const c of this.crawlers) {
      c.update(dt, this.collisions);
    }
  }

  private checkProjectileCrawlerHits(): void {
    for (const p of this.projectiles) {
      if (!p.alive) continue;
      for (const c of this.crawlers) {
        if (!c.alive) continue;
        if (p.right > c.left && p.left < c.right && p.bottom > c.top && p.top < c.bottom) {
          c.takeDamage(1);
          p.alive = false;
          break;
        }
      }
    }
    this.projectiles = this.projectiles.filter((p) => p.alive);
  }

  private checkPlayerCrawlerContact(): void {
    if (this.playerInvTimer > 0) return;
    const pLeft = this.px - PLAYER_HW;
    const pRight = this.px + PLAYER_HW;
    const pTop = this.py - PLAYER_H;
    const pBottom = this.py;
    for (const c of this.crawlers) {
      if (!c.alive) continue;
      if (pRight > c.left && pLeft < c.right && pBottom > c.top && pTop < c.bottom) {
        this.playerHp = Math.max(0, this.playerHp - CRAWLER_CONTACT_DAMAGE);
        this.playerInvTimer = PLAYER_INV_TIME;
        if (this.playerHp <= 0) this.respawnPlayer();
        break;
      }
    }
  }

  private updateInvincibility(dt: number): void {
    if (this.playerInvTimer > 0) {
      this.playerInvTimer -= dt;
      this.playerBlinkOn = Math.floor(this.playerInvTimer / 0.1) % 2 === 0;
    } else {
      this.playerBlinkOn = true;
    }
  }

  private respawnPlayer(): void {
    this.px = this.spawnX;
    this.py = this.spawnY;
    this.vx = 0;
    this.vy = 0;
    this.playerHp = this.playerMaxHp;
    this.playerInvTimer = PLAYER_INV_TIME;
  }

  private resolveHorizontal(): void {
    const left = this.px - PLAYER_HW;
    const right = this.px + PLAYER_HW;
    // Inset vertical bounds by 1px to avoid false positives when standing on a surface
    const top = this.py - PLAYER_H + 1;
    const bottom = this.py - 1;

    for (const rect of this.collisions) {
      if (!overlapsY(top, bottom, rect.y, rect.y + rect.height)) continue;
      if (!overlapsX(left, right, rect.x, rect.x + rect.width)) continue;

      const overlapFromLeft = right - rect.x;
      const overlapFromRight = rect.x + rect.width - left;

      if (overlapFromLeft < overlapFromRight) {
        this.px = rect.x - PLAYER_HW;
        this.vx = 0;
        this.onWallRight = true;
      } else {
        this.px = rect.x + rect.width + PLAYER_HW;
        this.vx = 0;
        this.onWallLeft = true;
      }
    }
  }

  private resolveVertical(): void {
    const left = this.px - PLAYER_HW;
    const right = this.px + PLAYER_HW;
    const top = this.py - PLAYER_H;
    const bottom = this.py;

    for (const rect of this.collisions) {
      if (!overlapsX(left, right, rect.x, rect.x + rect.width)) continue;
      if (!overlapsY(top, bottom, rect.y, rect.y + rect.height)) continue;

      const overlapFromTop = bottom - rect.y;
      const overlapFromBottom = rect.y + rect.height - top;

      if (overlapFromTop < overlapFromBottom) {
        this.py = rect.y;
        this.vy = 0;
        this.onGround = true;
      } else {
        this.py = rect.y + rect.height + PLAYER_H;
        this.vy = 0;
      }
    }
  }

  private drawPlayer(): void {
    this.playerGfx.clear();
    this.playerGfx.visible = this.playerBlinkOn;
    this.playerGfx
      .rect(this.px - PLAYER_HW, this.py - PLAYER_H, PLAYER_W, PLAYER_H)
      .fill(0xff6600);
    this.playerGfx
      .rect(this.px - 6, this.py - PLAYER_H + 4, 12, 6)
      .fill(0x00ffcc);
  }

  private drawProjectiles(): void {
    this.projectileGfx.clear();
    for (const p of this.projectiles) {
      this.projectileGfx.rect(p.left, p.top, 8, 4).fill(0xffff00);
    }
  }

  private drawCrawlers(): void {
    this.crawlerGfx.clear();
    for (const c of this.crawlers) {
      if (!c.alive) continue;
      const bodyColor = c.hurtTimer > 0 ? 0xffffff : 0xff2244;
      this.crawlerGfx.rect(c.left, c.top, c.width, c.height).fill(bodyColor);
      // Eyes
      this.crawlerGfx.rect(c.left + 4, c.top + 4, 4, 4).fill(0x00ffcc);
      this.crawlerGfx.rect(c.right - 8, c.top + 4, 4, 4).fill(0x00ffcc);
    }
  }
}
