import type { GamePhase } from '../simulation/simulationTypes';
import type { GridPosition, StageDefinition } from '../stage/stageTypes';

export type PlacementResult = { ok: true } | { ok: false; reason: string };
export type PlacementBlockReason = 'out_of_bounds' | 'wall' | 'start' | 'goal' | 'hero' | 'occupied' | 'trap_limit' | 'cost_limit' | 'mana' | 'phase';

const PLACEMENT_REASON_MESSAGE: Record<PlacementBlockReason, string> = {
  phase: '実行中は配置できません。',
  out_of_bounds: '盤面外には配置できません。',
  wall: '壁には罠を置けません。',
  start: 'スタート地点には置けません。',
  goal: 'ゴール地点には置けません。',
  hero: '勇者のいるマスには置けません。',
  occupied: 'このマスには配置できません。',
  trap_limit: '罠の上限に達しています。',
  cost_limit: 'コストが足りません。',
  mana: '魔力が足りません。'
};

export const getEffectiveCostLimit = (stage: StageDefinition): number => stage.costLimit ?? stage.trapLimit;

export const canPlaceTrap = (
  phase: GamePhase,
  stage: StageDefinition,
  position: GridPosition,
  heroPosition: GridPosition,
  placedTraps: GridPosition[],
  usedTrapCount: number,
  usedCost: number,
  nextTrapCost: number,
  mana: number = Number.POSITIVE_INFINITY
): PlacementResult => {
  const reason = getPlacementBlockReason(phase, stage, position, heroPosition, placedTraps, usedTrapCount, usedCost, nextTrapCost, mana);
  if (reason) return { ok: false, reason: PLACEMENT_REASON_MESSAGE[reason] };
  return { ok: true };
};

export const getPlacementBlockReason = (
  phase: GamePhase,
  stage: StageDefinition,
  position: GridPosition,
  heroPosition: GridPosition,
  placedTraps: GridPosition[],
  usedTrapCount: number,
  usedCost: number,
  nextTrapCost: number,
  mana: number = Number.POSITIVE_INFINITY
): PlacementBlockReason | null => {
  if (phase !== 'planning') return 'phase';
  if (position.x < 0 || position.y < 0 || position.x >= stage.width || position.y >= stage.height) return 'out_of_bounds';
  const tile = stage.tiles[position.y][position.x];
  if (tile === 'wall') return 'wall';
  if (position.x === stage.startPosition.x && position.y === stage.startPosition.y) return 'start';
  if (position.x === stage.goalPosition.x && position.y === stage.goalPosition.y) return 'goal';
  if (position.x === heroPosition.x && position.y === heroPosition.y) return 'hero';
  if (placedTraps.some((trap) => trap.x === position.x && trap.y === position.y)) return 'occupied';
  if (usedTrapCount >= stage.trapLimit) return 'trap_limit';
  if (usedCost + nextTrapCost > getEffectiveCostLimit(stage)) return 'cost_limit';
  if (mana < nextTrapCost) return 'mana';
  return null;
};
