import { Application } from "pixi.js";
import { createGameActor } from "./state";
import { SceneManager } from "./core/SceneManager";
import { input } from "./input";
import {
  SplashScene,
  SaveSelectScene,
  CinematicScene,
  GameScene,
} from "./scenes";
import type { Scene } from "./scenes/Scene";

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

async function bootstrap() {
  // ---- PixiJS Application ----
  const app = new Application();
  await app.init({
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: 0x000000,
    antialias: false,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });
  document.body.appendChild(app.canvas);

  // ---- Input ----
  input.attach(window);

  // ---- XState Actor ----
  const actor = createGameActor();

  // ---- Scene factory ----
  function sceneForState(stateKey: string): Scene | null {
    switch (stateKey) {
      case "splash":
        return new SplashScene(actor, GAME_WIDTH, GAME_HEIGHT);
      case "saveSelect":
        return new SaveSelectScene(actor, GAME_WIDTH, GAME_HEIGHT);
      case "openingCinematic":
        return new CinematicScene(actor, GAME_WIDTH, GAME_HEIGHT);
      case "gameplay":
        return new GameScene(actor, GAME_WIDTH, GAME_HEIGHT);
      case "gameOver":
        // TODO: dedicated Game Over scene
        return new SplashScene(actor, GAME_WIDTH, GAME_HEIGHT);
      default:
        return null;
    }
  }

  // ---- Scene Manager ----
  const sceneManager = new SceneManager(app, actor, sceneForState);
  sceneManager.transitionTo("splash");

  // Subscribe to state changes and swap scenes
  let previousState = "splash";
  actor.subscribe((snapshot) => {
    // Get the top-level state key
    const value = snapshot.value;
    const topLevel = typeof value === "string" ? value : Object.keys(value)[0];
    if (topLevel && topLevel !== previousState) {
      previousState = topLevel;
      sceneManager.transitionTo(topLevel);
    }
  });

  // ---- Game Loop ----
  app.ticker.add((ticker) => {
    const dt = ticker.deltaTime / 60; // deltaTime is in frames at 60fps; convert to seconds
    sceneManager.update(dt);
    input.endFrame();
  });
}

bootstrap().catch(console.error);
