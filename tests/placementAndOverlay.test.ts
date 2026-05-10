import { describe, expect, it } from 'vitest';
import { canPlaceTrap, getEffectiveCostLimit } from '../src/core/rules/placementRules';
import { buildTrapRangeCells } from '../src/scenes/game/TrapPlacementOverlayRenderer';
import type { StageDefinition, TrapType } from '../src/core/stage/stageTypes';

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

describe('placementRules', () => {
  it('getEffectiveCostLimit は costLimit 指定時にそれを返す', () => {
    expect(getEffectiveCostLimit({ ...stage, costLimit: 7 })).toBe(7);
  });

  it('getEffectiveCostLimit は costLimit 未指定時に trapLimit を返す', () => {
    expect(getEffectiveCostLimit(stage)).toBe(stage.trapLimit);
  });

  it('壁には置けない', () => {
    expect(canPlaceTrap('planning', stage, { x: 2, y: 0 }, { x: 1, y: 1 }, [], 0, 0, 1).ok).toBe(false);
  });

  it('スタートには置けない', () => {
    expect(canPlaceTrap('planning', stage, { x: 0, y: 0 }, { x: 1, y: 1 }, [], 0, 0, 1).ok).toBe(false);
  });

  it('ゴールには置けない', () => {
    expect(canPlaceTrap('planning', stage, { x: 4, y: 4 }, { x: 1, y: 1 }, [], 0, 0, 1).ok).toBe(false);
  });

  it('勇者位置には置けない', () => {
    expect(canPlaceTrap('planning', stage, { x: 1, y: 1 }, { x: 1, y: 1 }, [], 0, 0, 1).ok).toBe(false);
  });

  it('既存罠位置には置けない', () => {
    expect(canPlaceTrap('planning', stage, { x: 1, y: 2 }, { x: 1, y: 1 }, [{ x: 1, y: 2 }], 1, 1, 1).ok).toBe(false);
  });

  it('trapLimit を超えると置けない', () => {
    expect(canPlaceTrap('planning', stage, { x: 2, y: 2 }, { x: 1, y: 1 }, [], 2, 0, 1).ok).toBe(false);
  });

  it('costLimit を超えると置けない', () => {
    const withCostLimit: StageDefinition = { ...stage, costLimit: 3, trapLimit: 5 };
    expect(canPlaceTrap('planning', withCostLimit, { x: 2, y: 2 }, { x: 1, y: 1 }, [], 0, 2, 2).ok).toBe(false);
  });

  it('costLimit 未指定時は trapLimit を使う', () => {
    expect(canPlaceTrap('planning', stage, { x: 2, y: 2 }, { x: 1, y: 1 }, [], 0, 2, 1).ok).toBe(false);
  });
});

describe('buildTrapRangeCells', () => {
  const center = { x: 2, y: 2 };

  it.each<TrapType>(['spike', 'slime', 'pitfall', 'fear'])('%s は中心マスのみ', (trap) => {
    expect(buildTrapRangeCells(stage, center, trap)).toEqual([center]);
  });

  it('arrow は周囲1マス', () => {
    expect(buildTrapRangeCells(stage, center, 'arrow')).toHaveLength(9);
  });

  it('decoy は周囲2マス', () => {
    expect(buildTrapRangeCells(stage, center, 'decoy')).toHaveLength(25);
  });

  it('盤面外のセルは含めない', () => {
    const cells = buildTrapRangeCells(stage, { x: 0, y: 0 }, 'decoy');
    expect(cells.every((cell) => cell.x >= 0 && cell.y >= 0 && cell.x < stage.width && cell.y < stage.height)).toBe(true);
  });
});
