import { setup, createActor, assign, type ActorRefFrom } from "xstate";
import type { SaveSlot, SaveData } from "../types";

export type GameEvent =
  | { type: "NEW_GAME" }
  | { type: "CONTINUE" }
  | { type: "CREDITS" }
  | { type: "SELECT_SLOT"; slot: SaveSlot }
  | { type: "SLOT_NEW_GAME" }
  | { type: "SLOT_CONTINUE"; saveData: SaveData }
  | { type: "SKIP_CINEMATIC" }
  | { type: "CINEMATIC_COMPLETE" }
  | { type: "INTRO_COMPLETE" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "SAVE" }
  | { type: "SAVE_COMPLETE" }
  | { type: "VIEW_MAP" }
  | { type: "CLOSE_MAP" }
  | { type: "EXIT_GAME" }
  | { type: "GAME_OVER" }
  | { type: "VICTORY" }
  | { type: "RETURN_TO_TITLE" };

export interface GameContext {
  selectedSlot: SaveSlot | null;
  saveData: SaveData | null;
  isNewGame: boolean;
}

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
    splash: {
      on: {
        NEW_GAME: "saveSelect",
        CONTINUE: "saveSelect",
        CREDITS: "credits",
      },
    },

    saveSelect: {
      on: {
        SELECT_SLOT: {
          actions: assign({
            selectedSlot: ({ event }) => event.slot,
          }),
        },
        SLOT_NEW_GAME: {
          target: "openingCinematic",
          actions: assign({ isNewGame: true, saveData: null }),
        },
        SLOT_CONTINUE: {
          target: "gameplay",
          actions: assign({
            isNewGame: false,
            saveData: ({ event }) => event.saveData,
          }),
        },
        RETURN_TO_TITLE: "splash",
      },
    },

    openingCinematic: {
      on: {
        SKIP_CINEMATIC: "gameplay",
        CINEMATIC_COMPLETE: "gameplay",
      },
    },

    gameplay: {
      initial: "exploring",
      on: {
        GAME_OVER: "gameOver",
        VICTORY: "victory",
        EXIT_GAME: "splash",
      },
      states: {
        exploring: {
          on: {
            PAUSE: "paused",
            INTRO_COMPLETE: "exploring",
          },
        },
        paused: {
          on: {
            RESUME: "exploring",
            SAVE: "saving",
            VIEW_MAP: "viewingMap",
            EXIT_GAME: "#game.splash",
          },
        },
        saving: {
          on: {
            SAVE_COMPLETE: "paused",
          },
        },
        viewingMap: {
          on: {
            CLOSE_MAP: "paused",
          },
        },
      },
    },

    gameOver: {
      on: {
        RETURN_TO_TITLE: "splash",
      },
    },

    victory: {
      on: {
        RETURN_TO_TITLE: "credits",
      },
    },

    credits: {
      on: {
        RETURN_TO_TITLE: "splash",
      },
    },
  },
});

export type GameMachine = typeof gameMachine;
export type GameActor = ActorRefFrom<GameMachine>;

export function createGameActor() {
  const actor = createActor(gameMachine);
  actor.start();
  return actor;
}
