import { GAME_WIDTH, GAME_HEIGHT, CAMERA_ZOOM } from '../types';

export class Camera {
  x = 0;
  y = 0;

  update(
    targetX: number,
    targetY: number,
    roomWidth: number,
    roomHeight: number,
  ): void {
    const viewW = GAME_WIDTH / CAMERA_ZOOM;
    const viewH = GAME_HEIGHT / CAMERA_ZOOM;
    this.x = Math.max(0, Math.min(targetX - viewW / 2, roomWidth - viewW));
    this.y = Math.max(0, Math.min(targetY - viewH / 2, roomHeight - viewH));
  }
}
