import { Container, Graphics, Text } from "pixi.js";
import { Scene } from "./Scene";
import { input } from "../input";
import { PauseMenu } from "./PauseMenu";
import type { GameActor } from "../state";
import { parseTmx, ROOM_MAP, type CollisionRect } from "../maps";
import { Camera, HUD, RoomTransition } from "../game";
import { PulsePistol, type Projectile } from "../weapons";
import { Crawler, IntroBoss } from "../enemies";
import { CAMERA_ZOOM } from "../types";

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
const BOSS_CONTACT_DAMAGE = 20;
const BOSS_PROJECTILE_DAMAGE = 15;

const ESCAPE_TIME = 45;
const HEALTH_TANK_HP = 99;

type GamePhase =
  | "exploring"
  | "bossFight"
  | "escapeSequence"
  | "bossDefeated";

interface RoomState {
  id: string;
  collisions: CollisionRect[];
  widthPx: number;
  heightPx: number;
  crawlers: Crawler[];
  boss: IntroBoss | null;
  healthTankCollected: boolean;
}

function overlapsX(al: number, ar: number, bl: number, br: number): boolean {
  return al < br && ar > bl;
}

function overlapsY(at: number, ab: number, bt: number, bb: number): boolean {
  return at < bb && ab > bt;
}

export class GameScene extends Scene {
  private pauseMenu: PauseMenu;
  private world!: Container;
  private playerGfx!: Graphics;
  private projectileGfx!: Graphics;
  private crawlerGfx!: Graphics;
  private bossGfx!: Graphics;
  private hud!: HUD;
  private transition!: RoomTransition;
  private camera = new Camera();

  private currentRoomId = "intro_room_01";
  private room!: RoomState;

  private px: number = 100;
  private py: number = 1040;
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

  private weapon = new PulsePistol();
  private projectiles: Projectile[] = [];

  private phase: GamePhase = "exploring";
  private escapeTimer = 0;
  private bossDefeatedTextTimer = 0;

  constructor(actor: GameActor) {
    super(actor);
    this.pauseMenu = new PauseMenu(actor);
    this.loadRoom("intro_room_01", "spawn");
  }

  private loadRoom(id: string, enterFrom: "left" | "right" | "spawn" = "spawn"): void {
    const tmx = ROOM_MAP[id];
    if (!tmx) return;
    const parsed = parseTmx(tmx);
    this.currentRoomId = id;

    const crawlers: Crawler[] = [];
    let boss: IntroBoss | null = null;
    let spawnX = 100;
    let spawnY = parsed.heightPx - 32;

    for (const entity of parsed.entities) {
      switch (entity.type) {
        case "player_spawn":
          spawnX = entity.x;
          spawnY = entity.y;
          break;
        case "enemy_crawler":
          crawlers.push(new Crawler(entity.x, entity.y));
          break;
        case "intro_boss":
          boss = new IntroBoss(entity.x, entity.y);
          break;
      }
    }

    this.room = {
      id,
      collisions: parsed.collisions,
      widthPx: parsed.widthPx,
      heightPx: parsed.heightPx,
      crawlers,
      boss,
      healthTankCollected: false,
    };

    if (enterFrom === "spawn") {
      this.px = spawnX;
      this.py = spawnY;
    } else if (enterFrom === "right") {
      this.px = parsed.widthPx - 80;
      this.py = spawnY;
    } else {
      this.px = 80;
      this.py = spawnY;
    }

    this.vx = 0;
    this.vy = 0;

    if (parsed.properties["isBossRoom"] === "true") {
      this.phase = "bossFight";
    } else if (this.phase !== "escapeSequence") {
      this.phase = "exploring";
    }
  }

  private rebuildWorldGraphics(): void {
    this.world.removeChildren();

    const bg = new Graphics();
    bg.rect(0, 0, this.room.widthPx, this.room.heightPx).fill(0x0a0a14);
    this.world.addChild(bg);

    const colGfx = new Graphics();
    for (const rect of this.room.collisions) {
      colGfx.rect(rect.x, rect.y, rect.width, rect.height).fill(0x1e3a5f);
    }
    this.world.addChild(colGfx);

    this.crawlerGfx = new Graphics();
    this.world.addChild(this.crawlerGfx);

    this.bossGfx = new Graphics();
    this.world.addChild(this.bossGfx);

    this.projectileGfx = new Graphics();
    this.world.addChild(this.projectileGfx);

    this.playerGfx = new Graphics();
    this.world.addChild(this.playerGfx);
  }

  onEnter(): void {
    this.world = new Container();
    this.container.addChild(this.world);

    this.crawlerGfx = new Graphics();
    this.bossGfx = new Graphics();
    this.projectileGfx = new Graphics();
    this.playerGfx = new Graphics();

    this.rebuildWorldGraphics();
    this.drawPlayer();

    this.hud = new HUD();
    this.container.addChild(this.hud.container);
    this.hud.update(this.playerHp, this.playerMaxHp, null, "Pulse Pistol");

    this.transition = new RoomTransition(this.container);

    this.container.addChild(this.pauseMenu.container);
    this.pauseMenu.hide();
  }

  update(dt: number): void {
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

    if (this.transition.active) {
      this.transition.update(dt);
      this.drawPlayer();
      this.updateCamera();
      return;
    }

    const actions = input.poll();

    if (actions.menu) {
      this.actor.send({ type: "PAUSE" });
      this.pauseMenu.show();
      return;
    }

    this.weapon.update(dt);
    this.updatePhysics(dt, actions);
    this.updateFiring(actions);
    this.updateProjectiles(dt);
    this.updateCrawlers(dt);

    if (this.phase === "bossFight") {
      this.updateBoss(dt);
    }

    this.checkProjectileCrawlerHits();
    this.checkProjectileBossHits();
    this.checkPlayerCrawlerContact();
    this.checkPlayerBossContact();
    this.checkPlayerBossProjectileContact();
    this.checkDoorTransitions();
    this.checkHealthTankPickup();

    if (this.phase === "escapeSequence") {
      this.escapeTimer -= dt;
      this.hud.showEscapeTimer(this.escapeTimer);
      if (this.escapeTimer <= 0) {
        this.actor.send({ type: "GAME_OVER" });
        return;
      }
      this.checkExtractionPoint();
    }

    if (this.phase === "bossDefeated") {
      this.bossDefeatedTextTimer -= dt;
      if (this.bossDefeatedTextTimer <= 0) {
        this.startEscapeSequence();
      }
    }

    this.updateInvincibility(dt);
    this.updateCamera();

    this.hud.update(this.playerHp, this.playerMaxHp, null, "Pulse Pistol");
    if (this.phase === "bossFight" && this.room.boss) {
      this.hud.showBossBar("WARDEN UNIT");
      this.hud.updateBossBar(this.room.boss.hp, this.room.boss.maxHp);
    } else if (this.phase !== "bossDefeated") {
      this.hud.hideBossBar();
    }

    this.drawPlayer();
    this.drawProjectiles();
    this.drawCrawlers();
    this.drawBoss();
  }

  private updateBoss(dt: number): void {
    const boss = this.room.boss;
    if (!boss || !boss.alive) {
      if (boss && !boss.alive && this.phase === "bossFight") {
        this.phase = "bossDefeated";
        this.hud.hideBossBar();
        this.bossDefeatedTextTimer = 2.5;
        this.showBossDefeatedText();
      }
      return;
    }
    boss.update(dt, this.room.collisions, this.px, this.py);
  }

  private showBossDefeatedText(): void {
    const t = new Text({
      text: "WARDEN UNIT DESTROYED",
      style: { fontFamily: "monospace", fontSize: 40, fill: 0x00ffcc },
    });
    t.anchor.set(0.5, 0.5);
    t.position.set(this.width / 2, this.height / 2);
    t.name = "bossDefeatedText";
    this.container.addChild(t);
  }

  private startEscapeSequence(): void {
    const existing = this.container.getChildByName("bossDefeatedText");
    if (existing) this.container.removeChild(existing);
    this.phase = "escapeSequence";
    this.escapeTimer = ESCAPE_TIME;
    this.transitionToRoom("intro_room_04", "left");
  }

  private checkDoorTransitions(): void {
    if (this.phase === "bossFight" || this.transition.active) return;

    const pLeft = this.px - PLAYER_HW;
    const pRight = this.px + PLAYER_HW;
    const pTop = this.py - PLAYER_H;
    const pBottom = this.py;

    const tmx = ROOM_MAP[this.currentRoomId];
    if (!tmx) return;
    const parsed = parseTmx(tmx);

    for (const entity of parsed.entities) {
      if (entity.type !== "door_left" && entity.type !== "door_right") continue;
      const target = entity.properties["target"];
      if (!target) continue;

      const door = { x: entity.x, y: entity.y, w: entity.width, h: entity.height };
      if (
        pRight > door.x &&
        pLeft < door.x + door.w &&
        pBottom > door.y &&
        pTop < door.y + door.h
      ) {
        const enterFrom = entity.type === "door_right" ? "left" : "right";
        this.transitionToRoom(target, enterFrom);
        return;
      }
    }
  }

  private checkExtractionPoint(): void {
    if (this.transition.active || this.currentRoomId !== "intro_room_01") return;
    const tmx = ROOM_MAP["intro_room_01"];
    if (!tmx) return;
    const parsed = parseTmx(tmx);
    const extraction = parsed.entities.find((e) => e.type === "extraction_point");
    if (!extraction) return;
    const pLeft = this.px - PLAYER_HW;
    const pRight = this.px + PLAYER_HW;
    const pTop = this.py - PLAYER_H;
    const pBottom = this.py;
    if (
      pRight > extraction.x &&
      pLeft < extraction.x + extraction.width &&
      pBottom > extraction.y &&
      pTop < extraction.y + extraction.height
    ) {
      this.hud.hideEscapeTimer();
      this.actor.send({ type: "INTRO_COMPLETE" });
    }
  }

  private checkHealthTankPickup(): void {
    if (this.room.healthTankCollected) return;
    const tmx = ROOM_MAP[this.currentRoomId];
    if (!tmx) return;
    const parsed = parseTmx(tmx);
    for (const entity of parsed.entities) {
      if (entity.type !== "health_tank") continue;
      const ex = entity.x;
      const ey = entity.y;
      const pLeft = this.px - PLAYER_HW;
      const pRight = this.px + PLAYER_HW;
      const pTop = this.py - PLAYER_H;
      const pBottom = this.py;
      if (
        pRight > ex - 20 &&
        pLeft < ex + 20 &&
        pBottom > ey - 20 &&
        pTop < ey + 20
      ) {
        this.playerHp = Math.min(this.playerHp + HEALTH_TANK_HP, this.playerMaxHp);
        this.room.healthTankCollected = true;
      }
    }
  }

  private transitionToRoom(targetId: string, enterFrom: "left" | "right"): void {
    if (this.transition.active) return;
    this.transition.start(
      () => {
        this.projectiles = [];
        this.loadRoom(targetId, enterFrom);
        this.rebuildWorldGraphics();
      },
      () => {
        // transition complete
      },
    );
  }

  private updatePhysics(dt: number, actions: ReturnType<typeof input.poll>): void {
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
      p.update(dt, this.room.collisions);
    }
    this.projectiles = this.projectiles.filter((p) => p.alive);
  }

  private updateCrawlers(dt: number): void {
    for (const c of this.room.crawlers) {
      c.update(dt, this.room.collisions);
    }
  }

  private checkProjectileCrawlerHits(): void {
    for (const p of this.projectiles) {
      if (!p.alive) continue;
      for (const c of this.room.crawlers) {
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

  private checkProjectileBossHits(): void {
    const boss = this.room.boss;
    if (!boss || !boss.alive) return;
    for (const p of this.projectiles) {
      if (!p.alive) continue;
      if (p.right > boss.left && p.left < boss.right && p.bottom > boss.top && p.top < boss.bottom) {
        boss.takeDamage(1);
        p.alive = false;
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
    for (const c of this.room.crawlers) {
      if (!c.alive) continue;
      if (pRight > c.left && pLeft < c.right && pBottom > c.top && pTop < c.bottom) {
        this.takeDamage(CRAWLER_CONTACT_DAMAGE);
        break;
      }
    }
  }

  private checkPlayerBossContact(): void {
    const boss = this.room.boss;
    if (!boss || !boss.alive || this.playerInvTimer > 0) return;
    const pLeft = this.px - PLAYER_HW;
    const pRight = this.px + PLAYER_HW;
    const pTop = this.py - PLAYER_H;
    const pBottom = this.py;
    if (pRight > boss.left && pLeft < boss.right && pBottom > boss.top && pTop < boss.bottom) {
      this.takeDamage(BOSS_CONTACT_DAMAGE);
    }
  }

  private checkPlayerBossProjectileContact(): void {
    const boss = this.room.boss;
    if (!boss || this.playerInvTimer > 0) return;
    const pLeft = this.px - PLAYER_HW;
    const pRight = this.px + PLAYER_HW;
    const pTop = this.py - PLAYER_H;
    const pBottom = this.py;
    for (const p of boss.projectiles) {
      if (!p.alive) continue;
      if (pRight > p.x - 8 && pLeft < p.x + 8 && pBottom > p.y - 8 && pTop < p.y + 8) {
        this.takeDamage(BOSS_PROJECTILE_DAMAGE);
        p.alive = false;
        break;
      }
    }
  }

  private takeDamage(amount: number): void {
    this.playerHp = Math.max(0, this.playerHp - amount);
    this.playerInvTimer = PLAYER_INV_TIME;
    if (this.playerHp <= 0) this.respawnPlayer();
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
    this.vx = 0;
    this.vy = 0;
    this.playerHp = this.playerMaxHp;
    this.playerInvTimer = PLAYER_INV_TIME;
    if (this.phase === "escapeSequence") {
      this.escapeTimer = Math.min(this.escapeTimer + 10, ESCAPE_TIME);
    }
  }

  private resolveHorizontal(): void {
    const left = this.px - PLAYER_HW;
    const right = this.px + PLAYER_HW;
    const top = this.py - PLAYER_H + 1;
    const bottom = this.py - 1;

    for (const rect of this.room.collisions) {
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

    for (const rect of this.room.collisions) {
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

  private updateCamera(): void {
    this.camera.update(
      this.px,
      this.py - PLAYER_H / 2,
      this.room.widthPx,
      this.room.heightPx,
    );
    this.world.scale.set(CAMERA_ZOOM);
    this.world.position.set(
      -this.camera.x * CAMERA_ZOOM,
      -this.camera.y * CAMERA_ZOOM,
    );
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
    const boss = this.room.boss;
    if (boss) {
      for (const p of boss.projectiles) {
        if (!p.alive) continue;
        this.projectileGfx.circle(p.x, p.y, 8).fill(0xff00aa);
      }
    }
  }

  private drawCrawlers(): void {
    this.crawlerGfx.clear();
    for (const c of this.room.crawlers) {
      if (!c.alive) continue;
      const bodyColor = c.hurtTimer > 0 ? 0xffffff : 0xff2244;
      this.crawlerGfx.rect(c.left, c.top, c.width, c.height).fill(bodyColor);
      this.crawlerGfx.rect(c.left + 4, c.top + 4, 4, 4).fill(0x00ffcc);
      this.crawlerGfx.rect(c.right - 8, c.top + 4, 4, 4).fill(0x00ffcc);
    }
  }

  private drawBoss(): void {
    this.bossGfx.clear();
    const boss = this.room.boss;
    if (!boss || !boss.alive) return;
    this.bossGfx.rect(boss.left, boss.top, boss.width, boss.height).fill(boss.bodyColor);
    this.bossGfx.rect(boss.left + 10, boss.top + 10, 12, 10).fill(0xffff00);
    this.bossGfx.rect(boss.right - 22, boss.top + 10, 12, 10).fill(0xffff00);
    if (boss.bodyColor === 0xff8800) {
      this.bossGfx.rect(boss.left, boss.top - 8, boss.width, 4).fill(0x00ffcc);
    }
  }
}
