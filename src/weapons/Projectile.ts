import type { CollisionRect } from "../maps";

const HALF_W = 4;
const HALF_H = 2;
const MAX_RANGE = 400;

export class Projectile {
  x: number;
  y: number;
  readonly vx: number;
  readonly vy: number;
  alive = true;
  private traveled = 0;

  constructor(x: number, y: number, vx: number, vy: number) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
  }

  update(dt: number, collisions: CollisionRect[]): void {
    const dx = this.vx * dt;
    const dy = this.vy * dt;
    this.x += dx;
    this.y += dy;
    this.traveled += Math.sqrt(dx * dx + dy * dy);

    if (this.traveled > MAX_RANGE) {
      this.alive = false;
      return;
    }

    for (const rect of collisions) {
      if (
        this.x + HALF_W > rect.x &&
        this.x - HALF_W < rect.x + rect.width &&
        this.y + HALF_H > rect.y &&
        this.y - HALF_H < rect.y + rect.height
      ) {
        this.alive = false;
        return;
      }
    }
  }

  get left(): number {
    return this.x - HALF_W;
  }
  get right(): number {
    return this.x + HALF_W;
  }
  get top(): number {
    return this.y - HALF_H;
  }
  get bottom(): number {
    return this.y + HALF_H;
  }
}
