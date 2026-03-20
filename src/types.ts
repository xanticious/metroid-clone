export type SaveSlot = 'A' | 'B' | 'C';

export type World = 'irl' | 'cyberspace';

export type WeaponType =
  | 'pulsePistol'
  | 'scatterShot'
  | 'railBeam'
  | 'empGrenade'
  | 'voidLance';

export type Ability =
  | 'wallJump'
  | 'dash'
  | 'doubleJump'
  | 'ball'
  | 'grappleHook'
  | 'phaseShift';

export interface SaveData {
  slot: SaveSlot;
  /** Milliseconds of play time */
  playTime: number;
  currentArea: string;
  currentWorld: World;
  items: string[];
  abilities: Ability[];
  weapons: WeaponType[];
  health: number;
  maxHealth: number;
  ammo: number;
  maxAmmo: number;
  positionX: number;
  positionY: number;
  /** Set of visited room IDs */
  visitedRooms: string[];
  /** 0–100 */
  completionPercent: number;
}

export type MenuOption = 'resume' | 'save' | 'viewMap' | 'exitGame';

export const GAME_WIDTH = 1920;
export const GAME_HEIGHT = 1080;
/** How many world-pixels map to one screen pixel. 4× gives Super Metroid proportions. */
export const CAMERA_ZOOM = 4;
