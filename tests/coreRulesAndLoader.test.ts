import { describe, expect, it } from 'vitest';
import { canPlaceTrap } from '../src/core/rules/placementRules';
import { judgeStageStatus } from '../src/core/rules/victoryJudge';
import { decideHeroAction } from '../src/core/ai/heroDecisionEngine';
import { loadStageByIndex } from '../src/core/stage/stageLoader';
import type { HeroState } from '../src/core/ai/heroAiTypes';

const stage = loadStageByIndex(0);

describe('placementRules', () => {
  it('rejects trap placement on start tile', () => {
    const result = canPlaceTrap('planning', stage, stage.startPosition, stage.startPosition, [], 0, 0, 1);
    expect(result.ok).toBe(false);
  });
});

describe('victoryJudge', () => {
  it('returns failed when hero reaches goal', () => {
    const status = judgeStageStatus({
      stageId: stage.id,
      hero: { heroId: 'adel', name: 'Adel', hp: 10, maxHp: 10, position: stage.goalPosition, traits: { goalPressure: 1, curiosity: 0, riskAversion: 0, trapMemory: 0, treasureBias: 0 }, memory: { seenTraps: [], lastPosition: null }, currentTarget: stage.goalPosition, status: 'alive', skipTurns: 0 },
      placedTraps: [], turn: 0, status: 'playing', phase: 'running', logs: [], score: 0, usedTrapCost: 0
    }, stage.goalPosition);
    expect(status).toBe('failed');
  });
});

describe('heroDecisionEngine', () => {
  it('chooses a movable tile', () => {
    const hero: HeroState = { heroId: 'adel', name: 'Adel', hp: 10, maxHp: 10, position: stage.startPosition, traits: { goalPressure: 1, curiosity: 0.3, riskAversion: 0.3, trapMemory: 0.2, treasureBias: 0.2 }, memory: { seenTraps: [], lastPosition: null }, currentTarget: stage.goalPosition, status: 'alive', skipTurns: 0 };
    const action = decideHeroAction(hero, stage.tiles, stage.goalPosition, [], stage.chests);
    expect(stage.tiles[action.nextPosition.y][action.nextPosition.x]).not.toBe('wall');
  });
});

describe('stageLoader', () => {
  it('throws for negative index', () => {
    expect(() => loadStageByIndex(-1)).toThrowError('Invalid stage index: -1');
  });
});
