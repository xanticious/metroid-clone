/** Save slot identifier */
export type SaveSlot = "A" | "B" | "C";

/** Data persisted per save slot */
export interface SaveData {
  slot: SaveSlot;
  playerName: string;
  /** Milliseconds of play time */
  playTime: number;
  /** Map area id the player is in */
  currentArea: string;
  /** Collected item ids */
  items: string[];
  /** Unlocked ability ids */
  abilities: string[];
  /** Player health */
  health: number;
  maxHealth: number;
  /** Player position when saved */
  positionX: number;
  positionY: number;
}

/** Available weapon types */
export type WeaponType =
  | "powerBeam"
  | "missile"
  | "superMissile"
  | "iceBeam"
  | "waveBeam";

/** Abilities that can be acquired */
export type Ability =
  | "dash"
  | "ball"
  | "doubleJump"
  | "wallJump"
  | "bomb"
  | "springBall";

/** Player state at runtime */
export interface PlayerState {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  facing: "left" | "right";
  health: number;
  maxHealth: number;
  weapons: WeaponType[];
  selectedWeapon: WeaponType;
  abilities: Ability[];
  items: string[];
}

/** In-game menu options */
export type MenuOption = "resume" | "save" | "viewMap" | "exitGame";
