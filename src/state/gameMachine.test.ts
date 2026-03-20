import { describe, it, expect } from "vitest";
import { createActor } from "xstate";
import { gameMachine } from "./gameMachine";

function startMachine() {
  const actor = createActor(gameMachine);
  actor.start();
  return actor;
}

describe("gameMachine", () => {
  it("starts in splash state", () => {
    const actor = startMachine();
    expect(actor.getSnapshot().value).toBe("splash");
    actor.stop();
  });

  it("transitions from splash to saveSelect on START", () => {
    const actor = startMachine();
    actor.send({ type: "START" });
    expect(actor.getSnapshot().value).toBe("saveSelect");
    actor.stop();
  });

  it("transitions from saveSelect to openingCinematic on NEW_GAME", () => {
    const actor = startMachine();
    actor.send({ type: "START" });
    actor.send({ type: "SELECT_SLOT", slot: "A" });
    actor.send({ type: "NEW_GAME" });
    expect(actor.getSnapshot().value).toBe("openingCinematic");
    expect(actor.getSnapshot().context.isNewGame).toBe(true);
    actor.stop();
  });

  it("transitions from openingCinematic to gameplay on SKIP_CINEMATIC", () => {
    const actor = startMachine();
    actor.send({ type: "START" });
    actor.send({ type: "NEW_GAME" });
    actor.send({ type: "SKIP_CINEMATIC" });
    const snap = actor.getSnapshot();
    expect(typeof snap.value).toBe("object");
    expect((snap.value as Record<string, string>).gameplay).toBe(
      "introMission",
    );
    actor.stop();
  });

  it("transitions from openingCinematic to gameplay on CINEMATIC_COMPLETE", () => {
    const actor = startMachine();
    actor.send({ type: "START" });
    actor.send({ type: "NEW_GAME" });
    actor.send({ type: "CINEMATIC_COMPLETE" });
    const snap = actor.getSnapshot();
    expect((snap.value as Record<string, string>).gameplay).toBe(
      "introMission",
    );
    actor.stop();
  });

  it("transitions to paused on PAUSE during introMission", () => {
    const actor = startMachine();
    actor.send({ type: "START" });
    actor.send({ type: "NEW_GAME" });
    actor.send({ type: "SKIP_CINEMATIC" });
    actor.send({ type: "PAUSE" });
    expect((actor.getSnapshot().value as Record<string, string>).gameplay).toBe(
      "paused",
    );
    actor.stop();
  });

  it("transitions from paused back to gameplay on RESUME", () => {
    const actor = startMachine();
    actor.send({ type: "START" });
    actor.send({ type: "NEW_GAME" });
    actor.send({ type: "SKIP_CINEMATIC" });
    actor.send({ type: "PAUSE" });
    actor.send({ type: "RESUME" });
    // Should return to introMission via "resuming"
    const gpValue = (actor.getSnapshot().value as Record<string, string>)
      .gameplay;
    expect(gpValue).toBe("introMission");
    actor.stop();
  });

  it("can continue a saved game directly into gameplay", () => {
    const actor = startMachine();
    actor.send({ type: "START" });
    const saveData = {
      slot: "B" as const,
      playerName: "Samus",
      playTime: 12345,
      currentArea: "brinstar",
      items: [],
      abilities: [],
      health: 99,
      maxHealth: 99,
      positionX: 200,
      positionY: 300,
    };
    actor.send({ type: "CONTINUE_GAME", saveData });
    const snap = actor.getSnapshot();
    expect(typeof snap.value).toBe("object");
    expect(snap.context.saveData).toEqual(saveData);
    expect(snap.context.isNewGame).toBe(false);
    actor.stop();
  });

  it("EXIT_GAME from paused returns to splash", () => {
    const actor = startMachine();
    actor.send({ type: "START" });
    actor.send({ type: "NEW_GAME" });
    actor.send({ type: "SKIP_CINEMATIC" });
    actor.send({ type: "PAUSE" });
    actor.send({ type: "EXIT_GAME" });
    expect(actor.getSnapshot().value).toBe("splash");
    actor.stop();
  });

  it("VIEW_MAP goes to viewingMap and CLOSE_MAP returns to paused", () => {
    const actor = startMachine();
    actor.send({ type: "START" });
    actor.send({ type: "NEW_GAME" });
    actor.send({ type: "SKIP_CINEMATIC" });
    actor.send({ type: "PAUSE" });
    actor.send({ type: "VIEW_MAP" });
    expect((actor.getSnapshot().value as Record<string, string>).gameplay).toBe(
      "viewingMap",
    );
    actor.send({ type: "CLOSE_MAP" });
    expect((actor.getSnapshot().value as Record<string, string>).gameplay).toBe(
      "paused",
    );
    actor.stop();
  });

  it("INTRO_COMPLETE advances to mainMission", () => {
    const actor = startMachine();
    actor.send({ type: "START" });
    actor.send({ type: "NEW_GAME" });
    actor.send({ type: "SKIP_CINEMATIC" });
    actor.send({ type: "INTRO_COMPLETE" });
    expect((actor.getSnapshot().value as Record<string, string>).gameplay).toBe(
      "mainMission",
    );
    actor.stop();
  });

  it("GAME_OVER transitions to gameOver state", () => {
    const actor = startMachine();
    actor.send({ type: "START" });
    actor.send({ type: "NEW_GAME" });
    actor.send({ type: "SKIP_CINEMATIC" });
    actor.send({ type: "GAME_OVER" });
    expect(actor.getSnapshot().value).toBe("gameOver");
    actor.stop();
  });

  it("RETURN_TO_TITLE from gameOver goes to splash", () => {
    const actor = startMachine();
    actor.send({ type: "START" });
    actor.send({ type: "NEW_GAME" });
    actor.send({ type: "SKIP_CINEMATIC" });
    actor.send({ type: "GAME_OVER" });
    actor.send({ type: "RETURN_TO_TITLE" });
    expect(actor.getSnapshot().value).toBe("splash");
    actor.stop();
  });
});
