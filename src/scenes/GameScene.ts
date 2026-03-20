import { Container, Text, Graphics } from 'pixi.js';
import { Scene } from './Scene';
import { input } from '../input';
import { PauseMenu } from './PauseMenu';
import type { GameActor } from '../state';
import { parseTmx, type CollisionRect } from '../maps';
import { Camera } from '../game';
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
  private hud!: Text;
  private camera = new Camera();

  private px: number;
  private py: number;
  private vx = 0;
  private vy = 0;
  private onGround = false;
  private onWallLeft = false;
  private onWallRight = false;
  private wallJumpLockTimer = 0;

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

    this.playerGfx = new Graphics();
    this.world.addChild(this.playerGfx);
    this.drawPlayer();

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

    this.updatePhysics(dt, actions);

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

    this.drawPlayer();
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
      if (actions.left) this.vx = -speed;
      if (actions.right) this.vx = speed;
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
    this.playerGfx
      .rect(this.px - PLAYER_HW, this.py - PLAYER_H, PLAYER_W, PLAYER_H)
      .fill(0xff6600);
    this.playerGfx
      .rect(this.px - 6, this.py - PLAYER_H + 4, 12, 6)
      .fill(0x00ffcc);
  }
}
