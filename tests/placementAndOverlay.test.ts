import { describe, expect, it } from 'vitest';
import { canPlaceTrap } from '../src/core/rules/placementRules';
import { buildTrapRangeCells } from '../src/scenes/game/TrapPlacementOverlayRenderer';
import type { StageDefinition } from '../src/core/stage/stageTypes';

const stage: StageDefinition = {
  id: 'test-stage',
  name: 'Test',
  chapterTitle: 'Ch',
  description: '',
  width: 5,
  height: 5,
  tiles: [
    ['start', 'floor', 'wall', 'floor', 'floor'],
    ['floor', 'floor', 'floor', 'floor', 'floor'],
    ['floor', 'floor', 'floor', 'floor', 'floor'],
    ['floor', 'floor', 'floor', 'floor', 'floor'],
    ['floor', 'floor', 'floor', 'floor', 'goal']
  ],
  startPosition: { x: 0, y: 0 },
  goalPosition: { x: 4, y: 4 },
  heroId: 'adel',
  trapLimit: 2,
  initialTraps: [],
  chests: [],
  tutorialHint: '',
  narrativeId: 'n'
};

describe('placementRules detailed checks', () => {
  it('rejects wall/start/goal/hero/existing trap', () => {
    expect(canPlaceTrap('planning', stage, { x: 2, y: 0 }, { x: 1, y: 1 }, [], 0, 0, 1).ok).toBe(false);
    expect(canPlaceTrap('planning', stage, { x: 0, y: 0 }, { x: 1, y: 1 }, [], 0, 0, 1).ok).toBe(false);
    expect(canPlaceTrap('planning', stage, { x: 4, y: 4 }, { x: 1, y: 1 }, [], 0, 0, 1).ok).toBe(false);
    expect(canPlaceTrap('planning', stage, { x: 1, y: 1 }, { x: 1, y: 1 }, [], 0, 0, 1).ok).toBe(false);
    expect(canPlaceTrap('planning', stage, { x: 1, y: 2 }, { x: 1, y: 1 }, [{ x: 1, y: 2 }], 1, 1, 1).ok).toBe(false);
  });

  it('rejects trapLimit and costLimit overflow', () => {
    expect(canPlaceTrap('planning', stage, { x: 2, y: 2 }, { x: 1, y: 1 }, [], 2, 0, 1).ok).toBe(false);
    const withCostLimit: StageDefinition = { ...stage, costLimit: 3, trapLimit: 5 };
    expect(canPlaceTrap('planning', withCostLimit, { x: 2, y: 2 }, { x: 1, y: 1 }, [], 2, 2, 2).ok).toBe(false);
  });

  it('uses trapLimit as cost limit when costLimit is undefined', () => {
    expect(canPlaceTrap('planning', stage, { x: 2, y: 2 }, { x: 1, y: 1 }, [], 1, 2, 1).ok).toBe(false);
  });
});

describe('placement overlay helper ranges', () => {
  it('arrow has 1-tile radius area', () => {
    expect(buildTrapRangeCells(stage, { x: 2, y: 2 }, 'arrow')).toHaveLength(9);
  });

  it('decoy has 2-tile radius area', () => {
    expect(buildTrapRangeCells(stage, { x: 2, y: 2 }, 'decoy')).toHaveLength(25);
  });
});
