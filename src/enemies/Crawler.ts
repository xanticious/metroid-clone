import type { CollisionRect } from '../maps';

const CRAWLER_W = 28;
const CRAWLER_H = 20;
const CRAWLER_HW = CRAWLER_W / 2;
const CRAWLER_SPEED = 60;
const MAX_HP = 3;
const GRAVITY = 900;
const MAX_FALL = 1200;
const HURT_DURATION = 0.15;

export class Crawler {
  x: number;
  y: number; // bottom (feet)
  private vx: number;
  private vy = 0;
  hp: number;
  alive = true;
  hurtTimer = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.hp = MAX_HP;
    this.vx = CRAWLER_SPEED;
  }

  update(dt: number, collisions: CollisionRect[]): void {
    if (!this.alive) return;

    if (this.hurtTimer > 0) this.hurtTimer -= dt;

    this.vy = Math.min(this.vy + GRAVITY * dt, MAX_FALL);

    this.x += this.vx * dt;
    this.resolveHorizontal(collisions);

    this.y += this.vy * dt;
    const onGround = this.resolveVertical(collisions);

    if (onGround) {
      const probeX = this.x + Math.sign(this.vx) * (CRAWLER_HW + 2);
      const probeY = this.y + 4;
      let groundAhead = false;
      for (const rect of collisions) {
        if (
          probeX > rect.x &&
          probeX < rect.x + rect.width &&
          probeY >= rect.y &&
          probeY <= rect.y + rect.height
        ) {
          groundAhead = true;
          break;
        }
      }
      if (!groundAhead) this.vx = -this.vx;
    }
  }

  takeDamage(amount: number): void {
    if (this.hurtTimer > 0) return;
    this.hp -= amount;
    if (this.hp <= 0) {
      this.alive = false;
    } else {
      this.hurtTimer = HURT_DURATION;
    }
  }

  get left(): number {
    return this.x - CRAWLER_HW;
  }
  get right(): number {
    return this.x + CRAWLER_HW;
  }
  get top(): number {
    return this.y - CRAWLER_H;
  }
  get bottom(): number {
    return this.y;
  }
  get width(): number {
    return CRAWLER_W;
  }
  get height(): number {
    return CRAWLER_H;
  }

  private resolveHorizontal(collisions: CollisionRect[]): void {
    const left = this.x - CRAWLER_HW;
    const right = this.x + CRAWLER_HW;
    const top = this.y - CRAWLER_H + 1;
    const bottom = this.y - 1;

    for (const rect of collisions) {
      if (!(top < rect.y + rect.height && bottom > rect.y)) continue;
      if (!(left < rect.x + rect.width && right > rect.x)) continue;

      const overlapFromLeft = right - rect.x;
      const overlapFromRight = rect.x + rect.width - left;
      if (overlapFromLeft < overlapFromRight) {
        this.x = rect.x - CRAWLER_HW;
        this.vx = -Math.abs(this.vx);
      } else {
        this.x = rect.x + rect.width + CRAWLER_HW;
        this.vx = Math.abs(this.vx);
      }
    }
  }

  private resolveVertical(collisions: CollisionRect[]): boolean {
    const left = this.x - CRAWLER_HW;
    const right = this.x + CRAWLER_HW;
    const top = this.y - CRAWLER_H;
    const bottom = this.y;
    let onGround = false;

    for (const rect of collisions) {
      if (!(left < rect.x + rect.width && right > rect.x)) continue;
      if (!(top < rect.y + rect.height && bottom > rect.y)) continue;

      const overlapFromTop = bottom - rect.y;
      const overlapFromBottom = rect.y + rect.height - top;
      if (overlapFromTop < overlapFromBottom) {
        this.y = rect.y;
        this.vy = 0;
        onGround = true;
      } else {
        this.y = rect.y + rect.height + CRAWLER_H;
        this.vy = 0;
      }
    }

    return onGround;
  }
}
