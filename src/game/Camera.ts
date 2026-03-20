import { GAME_WIDTH, GAME_HEIGHT } from '../types';

export class Camera {
  x = 0;
  y = 0;

  update(
    targetX: number,
    targetY: number,
    roomWidth: number,
    roomHeight: number,
  ): void {
    this.x = Math.max(
      0,
      Math.min(targetX - GAME_WIDTH / 2, roomWidth - GAME_WIDTH),
    );
    this.y = Math.max(
      0,
      Math.min(targetY - GAME_HEIGHT / 2, roomHeight - GAME_HEIGHT),
    );
  }
}
