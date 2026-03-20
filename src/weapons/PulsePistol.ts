import { Projectile } from "./Projectile";

const PROJECTILE_SPEED = 600;
const FIRE_INTERVAL = 0.12;
const DIAG = Math.SQRT1_2;

export class PulsePistol {
  private cooldown = 0;

  update(dt: number): void {
    if (this.cooldown > 0) this.cooldown -= dt;
  }

  tryFire(
    x: number,
    y: number,
    facing: 1 | -1,
    aimUp: boolean,
    aimDiagUp: boolean,
    aimDiagDown: boolean,
    aimDown: boolean,
  ): Projectile | null {
    if (this.cooldown > 0) return null;
    this.cooldown = FIRE_INTERVAL;

    let vx = 0;
    let vy = 0;

    if (aimDown) {
      vy = PROJECTILE_SPEED;
    } else if (aimUp) {
      vy = -PROJECTILE_SPEED;
    } else if (aimDiagUp) {
      vx = facing * PROJECTILE_SPEED * DIAG;
      vy = -PROJECTILE_SPEED * DIAG;
    } else if (aimDiagDown) {
      vx = facing * PROJECTILE_SPEED * DIAG;
      vy = PROJECTILE_SPEED * DIAG;
    } else {
      vx = facing * PROJECTILE_SPEED;
    }

    return new Projectile(x, y, vx, vy);
  }
}
