import { setup, createActor, assign, type ActorRefFrom } from "xstate";
import type { SaveSlot, SaveData } from "../types";

// ---------------------------------------------------------------------------
// Event definitions
// ---------------------------------------------------------------------------
export type GameEvent =
  | { type: "START" }
  | { type: "SELECT_SLOT"; slot: SaveSlot }
  | { type: "NEW_GAME" }
  | { type: "CONTINUE_GAME"; saveData: SaveData }
  | { type: "SKIP_CINEMATIC" }
  | { type: "CINEMATIC_COMPLETE" }
  | { type: "INTRO_COMPLETE" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "SAVE" }
  | { type: "VIEW_MAP" }
  | { type: "CLOSE_MAP" }
  | { type: "EXIT_GAME" }
  | { type: "GAME_OVER" }
  | { type: "RETURN_TO_TITLE" };

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
export interface GameContext {
  selectedSlot: SaveSlot | null;
  saveData: SaveData | null;
  isNewGame: boolean;
}

// ---------------------------------------------------------------------------
// Machine definition
// ---------------------------------------------------------------------------
export const gameMachine = setup({
  types: {
    context: {} as GameContext,
    events: {} as GameEvent,
  },
}).createMachine({
  id: "game",
  initial: "splash",
  context: {
    selectedSlot: null,
    saveData: null,
    isNewGame: false,
  },

  states: {
    // ------ Splash / Title Screen ------
    splash: {
      on: {
        START: "saveSelect",
      },
    },

    // ------ Save Slot Selection ------
    saveSelect: {
      on: {
        SELECT_SLOT: {
          actions: assign({
            selectedSlot: ({ event }) => event.slot,
          }),
        },
        NEW_GAME: {
          target: "openingCinematic",
          actions: assign({ isNewGame: true, saveData: null }),
        },
        CONTINUE_GAME: {
          target: "gameplay",
          actions: assign({
            isNewGame: false,
            saveData: ({ event }) => event.saveData,
          }),
        },
        RETURN_TO_TITLE: "splash",
      },
    },

    // ------ Opening Cinematic ------
    openingCinematic: {
      on: {
        SKIP_CINEMATIC: "gameplay",
        CINEMATIC_COMPLETE: "gameplay",
      },
    },

    // ------ Core Gameplay ------
    gameplay: {
      initial: "introMission",
      on: {
        GAME_OVER: "gameOver",
        EXIT_GAME: "splash",
      },
      states: {
        introMission: {
          on: {
            INTRO_COMPLETE: "mainMission",
            PAUSE: "paused",
          },
        },
        mainMission: {
          on: {
            PAUSE: "paused",
          },
        },
        paused: {
          on: {
            RESUME: "resuming",
            SAVE: "saving",
            VIEW_MAP: "viewingMap",
            EXIT_GAME: "#game.splash",
          },
        },
        resuming: {
          always: [
            // Return to wherever we came from – XState history
            { target: "introMission" },
          ],
        },
        saving: {
          // In a real impl this would invoke a save service
          on: {
            RESUME: "resuming",
          },
        },
        viewingMap: {
          on: {
            CLOSE_MAP: "paused",
          },
        },
      },
    },

    // ------ Game Over ------
    gameOver: {
      on: {
        RETURN_TO_TITLE: "splash",
        CONTINUE_GAME: {
          target: "gameplay",
          actions: assign({
            saveData: ({ event }) => event.saveData,
          }),
        },
      },
    },
  },
});

export type GameMachine = typeof gameMachine;
export type GameActor = ActorRefFrom<GameMachine>;

/** Create and start the game actor */
export function createGameActor() {
  const actor = createActor(gameMachine);
  actor.start();
  return actor;
}
