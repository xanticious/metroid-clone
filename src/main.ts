import { Application } from "pixi.js";
import { createGameActor } from "./state";
import { SceneManager, topLevelState } from "./core";
import { input } from "./input";
import { GAME_WIDTH, GAME_HEIGHT } from "./types";
import {
  SplashScene,
  SaveSelectScene,
  CinematicScene,
  GameScene,
  CreditsScene,
} from "./scenes";
import type { Scene } from "./scenes/Scene";

async function bootstrap() {
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
  scaleToFit(app.canvas);
  window.addEventListener("resize", () => scaleToFit(app.canvas));

  input.attach(window);

  const actor = createGameActor();

  function sceneForState(stateKey: string): Scene | null {
    switch (stateKey) {
      case "splash":
        return new SplashScene(actor);
      case "saveSelect":
        return new SaveSelectScene(actor);
      case "openingCinematic":
        return new CinematicScene(actor);
      case "gameplay":
        return new GameScene(actor);
      case "credits":
        return new CreditsScene(actor);
      case "gameOver":
        return new SplashScene(actor);
      case "victory":
        return new CreditsScene(actor);
      default:
        return null;
    }
  }

  const sceneManager = new SceneManager(app, sceneForState);
  sceneManager.transitionTo("splash");

  actor.subscribe((snapshot) => {
    const stateKey = topLevelState(snapshot.value);
    sceneManager.transitionTo(stateKey);
  });

  app.ticker.add((ticker) => {
    const dt = ticker.deltaTime / 60;
    sceneManager.update(dt);
    input.endFrame();
  });
}

function scaleToFit(canvas: HTMLCanvasElement): void {
  const scaleX = window.innerWidth / GAME_WIDTH;
  const scaleY = window.innerHeight / GAME_HEIGHT;
  const scale = Math.min(scaleX, scaleY);
  canvas.style.width = `${GAME_WIDTH * scale}px`;
  canvas.style.height = `${GAME_HEIGHT * scale}px`;
  canvas.style.position = "absolute";
  canvas.style.left = `${(window.innerWidth - GAME_WIDTH * scale) / 2}px`;
  canvas.style.top = `${(window.innerHeight - GAME_HEIGHT * scale) / 2}px`;
}

bootstrap().catch(console.error);
