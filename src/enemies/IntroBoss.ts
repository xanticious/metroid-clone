import type { CollisionRect } from "../maps";

const BOSS_W = 80;
const BOSS_H = 60;
const BOSS_HW = BOSS_W / 2;
const BOSS_MAX_HP = 40;
const GRAVITY = 900;
const MAX_FALL = 1200;
const HURT_DURATION = 0.25;
const HURT_INVULN = 0.5;

const CHARGE_SPEED = 320;
const CHARGE_DURATION = 1.2;
const CHARGE_COOLDOWN = 2.0;
const PROJECTILE_INTERVAL = 0.35;
const PROJECTILE_BURST = 3;
const SHOOT_PHASE_DURATION = 2.5;
const ARENA_LEFT = 200;
const ARENA_RIGHT = 1400;

export interface BossProjectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alive: boolean;
}

type Phase = "idle" | "charging" | "shooting" | "vulnerable" | "dead";

export class IntroBoss {
  x: number;
  y: number;
  hp: number;
  alive = true;
  hurtTimer = 0;
  invulnTimer = 0;
  projectiles: BossProjectile[] = [];

  private phase: Phase = "idle";
  private phaseTimer = 0;
  private vx = 0;
  private vy = 0;
  private chargeDir: 1 | -1 = 1;
  private shootTimer = 0;
  private shootCount = 0;
  private idleTimer = 1.2;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.hp = BOSS_MAX_HP;
  }

  get maxHp(): number {
    return BOSS_MAX_HP;
  }

  get left(): number {
    return this.x - BOSS_HW;
  }
  get right(): number {
    return this.x + BOSS_HW;
  }
  get top(): number {
    return this.y - BOSS_H;
  }
  get bottom(): number {
    return this.y;
  }
  get width(): number {
    return BOSS_W;
  }
  get height(): number {
    return BOSS_H;
  }

  update(
    dt: number,
    collisions: CollisionRect[],
    playerX: number,
    playerY: number,
  ): void {
    if (!this.alive) return;

    if (this.hurtTimer > 0) this.hurtTimer -= dt;
    if (this.invulnTimer > 0) this.invulnTimer -= dt;

    this.vy = Math.min(this.vy + GRAVITY * dt, MAX_FALL);
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.resolveCollisions(collisions);

    this.updateProjectiles(dt, collisions);
    this.runAI(dt, playerX, playerY);
  }

  private runAI(dt: number, playerX: number, _playerY: number): void {
    switch (this.phase) {
      case "idle":
        this.vx = 0;
        this.idleTimer -= dt;
        if (this.idleTimer <= 0) {
          this.startCharge(playerX);
        }
        break;

      case "charging":
        this.phaseTimer -= dt;
        if (this.x < ARENA_LEFT + BOSS_HW) {
          this.x = ARENA_LEFT + BOSS_HW;
          this.vx = 0;
          this.enterShooting();
        } else if (this.x > ARENA_RIGHT - BOSS_HW) {
          this.x = ARENA_RIGHT - BOSS_HW;
          this.vx = 0;
          this.enterShooting();
        } else if (this.phaseTimer <= 0) {
          this.enterShooting();
        }
        break;

      case "shooting":
        this.phaseTimer -= dt;
        this.shootTimer -= dt;
        if (this.shootTimer <= 0 && this.shootCount < PROJECTILE_BURST) {
          this.fireProjectile(playerX);
          this.shootCount++;
          this.shootTimer = PROJECTILE_INTERVAL;
        }
        if (this.phaseTimer <= 0) {
          this.enterVulnerable();
        }
        break;

      case "vulnerable":
        this.phaseTimer -= dt;
        if (this.phaseTimer <= 0) {
          this.phase = "idle";
          this.idleTimer = 0.8;
          this.vx = 0;
        }
        break;

      case "dead":
        this.vx = 0;
        break;
    }
  }

  private startCharge(playerX: number): void {
    this.chargeDir = playerX > this.x ? 1 : -1;
    this.vx = this.chargeDir * CHARGE_SPEED;
    this.phase = "charging";
    this.phaseTimer = CHARGE_DURATION;
  }

  private enterShooting(): void {
    this.vx = 0;
    this.phase = "shooting";
    this.phaseTimer = SHOOT_PHASE_DURATION;
    this.shootTimer = 0.3;
    this.shootCount = 0;
  }

  private enterVulnerable(): void {
    this.vx = 0;
    this.phase = "vulnerable";
    this.phaseTimer = CHARGE_COOLDOWN;
  }

  private fireProjectile(playerX: number): void {
    const SPEED = 220;
    const dx = playerX - this.x;
    const len = Math.abs(dx) || 1;
    const vx = (dx / len) * SPEED;
    const vy = 180;
    this.projectiles.push({
      x: this.x,
      y: this.y - BOSS_H * 0.5,
      vx,
      vy,
      alive: true,
    });
  }

  private updateProjectiles(dt: number, collisions: CollisionRect[]): void {
    for (const p of this.projectiles) {
      if (!p.alive) continue;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      for (const rect of collisions) {
        if (
          p.x + 6 > rect.x &&
          p.x - 6 < rect.x + rect.width &&
          p.y + 6 > rect.y &&
          p.y - 6 < rect.y + rect.height
        ) {
          p.alive = false;
          break;
        }
      }
    }
    this.projectiles = this.projectiles.filter((p) => p.alive);
  }

  isVulnerable(): boolean {
    return this.phase === "vulnerable" && this.invulnTimer <= 0;
  }

  takeDamage(amount: number): void {
    if (!this.isVulnerable()) return;
    if (this.invulnTimer > 0) return;
    this.hp -= amount;
    this.hurtTimer = HURT_DURATION;
    this.invulnTimer = HURT_INVULN;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
      this.phase = "dead";
    }
  }

  get bodyColor(): number {
    if (this.phase === "vulnerable") return 0xff8800;
    if (this.hurtTimer > 0) return 0xffffff;
    return 0xaa00ff;
  }

  private resolveCollisions(collisions: CollisionRect[]): void {
    const left = this.x - BOSS_HW;
    const right = this.x + BOSS_HW;
    const top = this.y - BOSS_H + 1;
    const bottom = this.y - 1;

    for (const rect of collisions) {
      if (!(top < rect.y + rect.height && bottom > rect.y)) continue;
      if (!(left < rect.x + rect.width && right > rect.x)) continue;
      const overlapL = right - rect.x;
      const overlapR = rect.x + rect.width - left;
      if (overlapL < overlapR) {
        this.x = rect.x - BOSS_HW;
        this.vx = -this.vx;
      } else {
        this.x = rect.x + rect.width + BOSS_HW;
        this.vx = -this.vx;
      }
    }

    const topFull = this.y - BOSS_H;
    const bottomFull = this.y;
    const leftFull = this.x - BOSS_HW;
    const rightFull = this.x + BOSS_HW;

    for (const rect of collisions) {
      if (!(leftFull < rect.x + rect.width && rightFull > rect.x)) continue;
      if (!(topFull < rect.y + rect.height && bottomFull > rect.y)) continue;
      const overlapT = bottomFull - rect.y;
      const overlapB = rect.y + rect.height - topFull;
      if (overlapT < overlapB) {
        this.y = rect.y;
        this.vy = 0;
      } else {
        this.y = rect.y + rect.height + BOSS_H;
        this.vy = 0;
      }
    }
  }
}
