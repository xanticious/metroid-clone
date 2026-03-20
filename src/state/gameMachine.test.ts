import { describe, it, expect } from 'vitest';
import { createActor } from 'xstate';
import { gameMachine } from './gameMachine';
import type { SaveData } from '../types';

function startMachine() {
  const actor = createActor(gameMachine);
  actor.start();
  return actor;
}

const fakeSave: SaveData = {
  slot: 'B',
  playTime: 12345,
  currentArea: 'neonDistrict',
  currentWorld: 'irl',
  items: [],
  abilities: [],
  weapons: ['pulsePistol'],
  health: 99,
  maxHealth: 99,
  ammo: 30,
  maxAmmo: 30,
  positionX: 200,
  positionY: 300,
  visitedRooms: [],
  completionPercent: 0,
};

describe('gameMachine', () => {
  it('starts in splash state', () => {
    const actor = startMachine();
    expect(actor.getSnapshot().value).toBe('splash');
    actor.stop();
  });

  it('transitions from splash to saveSelect on NEW_GAME', () => {
    const actor = startMachine();
    actor.send({ type: 'NEW_GAME' });
    expect(actor.getSnapshot().value).toBe('saveSelect');
    actor.stop();
  });

  it('transitions from splash to credits on CREDITS', () => {
    const actor = startMachine();
    actor.send({ type: 'CREDITS' });
    expect(actor.getSnapshot().value).toBe('credits');
    actor.stop();
  });

  it('transitions from saveSelect to openingCinematic on SLOT_NEW_GAME', () => {
    const actor = startMachine();
    actor.send({ type: 'NEW_GAME' });
    actor.send({ type: 'SELECT_SLOT', slot: 'A' });
    actor.send({ type: 'SLOT_NEW_GAME' });
    expect(actor.getSnapshot().value).toBe('openingCinematic');
    expect(actor.getSnapshot().context.isNewGame).toBe(true);
    actor.stop();
  });

  it('transitions from openingCinematic to gameplay on SKIP_CINEMATIC', () => {
    const actor = startMachine();
    actor.send({ type: 'NEW_GAME' });
    actor.send({ type: 'SLOT_NEW_GAME' });
    actor.send({ type: 'SKIP_CINEMATIC' });
    const snap = actor.getSnapshot();
    expect((snap.value as Record<string, string>).gameplay).toBe('exploring');
    actor.stop();
  });

  it('transitions from openingCinematic to gameplay on CINEMATIC_COMPLETE', () => {
    const actor = startMachine();
    actor.send({ type: 'NEW_GAME' });
    actor.send({ type: 'SLOT_NEW_GAME' });
    actor.send({ type: 'CINEMATIC_COMPLETE' });
    const snap = actor.getSnapshot();
    expect((snap.value as Record<string, string>).gameplay).toBe('exploring');
    actor.stop();
  });

  it('transitions to paused on PAUSE during exploring', () => {
    const actor = startMachine();
    actor.send({ type: 'NEW_GAME' });
    actor.send({ type: 'SLOT_NEW_GAME' });
    actor.send({ type: 'SKIP_CINEMATIC' });
    actor.send({ type: 'PAUSE' });
    expect((actor.getSnapshot().value as Record<string, string>).gameplay).toBe(
      'paused',
    );
    actor.stop();
  });

  it('transitions from paused back to exploring on RESUME', () => {
    const actor = startMachine();
    actor.send({ type: 'NEW_GAME' });
    actor.send({ type: 'SLOT_NEW_GAME' });
    actor.send({ type: 'SKIP_CINEMATIC' });
    actor.send({ type: 'PAUSE' });
    actor.send({ type: 'RESUME' });
    expect((actor.getSnapshot().value as Record<string, string>).gameplay).toBe(
      'exploring',
    );
    actor.stop();
  });

  it('can continue a saved game directly into gameplay', () => {
    const actor = startMachine();
    actor.send({ type: 'CONTINUE' });
    actor.send({ type: 'SLOT_CONTINUE', saveData: fakeSave });
    const snap = actor.getSnapshot();
    expect((snap.value as Record<string, string>).gameplay).toBe('exploring');
    expect(snap.context.saveData).toEqual(fakeSave);
    expect(snap.context.isNewGame).toBe(false);
    actor.stop();
  });

  it('EXIT_GAME from paused returns to splash', () => {
    const actor = startMachine();
    actor.send({ type: 'NEW_GAME' });
    actor.send({ type: 'SLOT_NEW_GAME' });
    actor.send({ type: 'SKIP_CINEMATIC' });
    actor.send({ type: 'PAUSE' });
    actor.send({ type: 'EXIT_GAME' });
    expect(actor.getSnapshot().value).toBe('splash');
    actor.stop();
  });

  it('VIEW_MAP goes to viewingMap and CLOSE_MAP returns to paused', () => {
    const actor = startMachine();
    actor.send({ type: 'NEW_GAME' });
    actor.send({ type: 'SLOT_NEW_GAME' });
    actor.send({ type: 'SKIP_CINEMATIC' });
    actor.send({ type: 'PAUSE' });
    actor.send({ type: 'VIEW_MAP' });
    expect((actor.getSnapshot().value as Record<string, string>).gameplay).toBe(
      'viewingMap',
    );
    actor.send({ type: 'CLOSE_MAP' });
    expect((actor.getSnapshot().value as Record<string, string>).gameplay).toBe(
      'paused',
    );
    actor.stop();
  });

  it('SAVE transitions to saving and SAVE_COMPLETE returns to paused', () => {
    const actor = startMachine();
    actor.send({ type: 'NEW_GAME' });
    actor.send({ type: 'SLOT_NEW_GAME' });
    actor.send({ type: 'SKIP_CINEMATIC' });
    actor.send({ type: 'PAUSE' });
    actor.send({ type: 'SAVE' });
    expect((actor.getSnapshot().value as Record<string, string>).gameplay).toBe(
      'saving',
    );
    actor.send({ type: 'SAVE_COMPLETE' });
    expect((actor.getSnapshot().value as Record<string, string>).gameplay).toBe(
      'paused',
    );
    actor.stop();
  });

  it('GAME_OVER transitions to gameOver state', () => {
    const actor = startMachine();
    actor.send({ type: 'NEW_GAME' });
    actor.send({ type: 'SLOT_NEW_GAME' });
    actor.send({ type: 'SKIP_CINEMATIC' });
    actor.send({ type: 'GAME_OVER' });
    expect(actor.getSnapshot().value).toBe('gameOver');
    actor.stop();
  });

  it('VICTORY transitions to victory then credits', () => {
    const actor = startMachine();
    actor.send({ type: 'NEW_GAME' });
    actor.send({ type: 'SLOT_NEW_GAME' });
    actor.send({ type: 'SKIP_CINEMATIC' });
    actor.send({ type: 'VICTORY' });
    expect(actor.getSnapshot().value).toBe('victory');
    actor.send({ type: 'RETURN_TO_TITLE' });
    expect(actor.getSnapshot().value).toBe('credits');
    actor.stop();
  });

  it('RETURN_TO_TITLE from gameOver goes to splash', () => {
    const actor = startMachine();
    actor.send({ type: 'NEW_GAME' });
    actor.send({ type: 'SLOT_NEW_GAME' });
    actor.send({ type: 'SKIP_CINEMATIC' });
    actor.send({ type: 'GAME_OVER' });
    actor.send({ type: 'RETURN_TO_TITLE' });
    expect(actor.getSnapshot().value).toBe('splash');
    actor.stop();
  });

  it('RETURN_TO_TITLE from credits goes to splash', () => {
    const actor = startMachine();
    actor.send({ type: 'CREDITS' });
    actor.send({ type: 'RETURN_TO_TITLE' });
    expect(actor.getSnapshot().value).toBe('splash');
    actor.stop();
  });

  it('RETURN_TO_TITLE from saveSelect goes to splash', () => {
    const actor = startMachine();
    actor.send({ type: 'NEW_GAME' });
    actor.send({ type: 'RETURN_TO_TITLE' });
    expect(actor.getSnapshot().value).toBe('splash');
    actor.stop();
  });
});
