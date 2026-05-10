import type { GamePhase } from '../simulation/simulationTypes';
import type { GridPosition, StageDefinition } from '../stage/stageTypes';

export type PlacementResult = { ok: true } | { ok: false; reason: string };

export const getEffectiveCostLimit = (stage: StageDefinition): number => stage.costLimit ?? stage.trapLimit;

export const canPlaceTrap = (
  phase: GamePhase,
  stage: StageDefinition,
  position: GridPosition,
  heroPosition: GridPosition,
  placedTraps: GridPosition[],
  usedTrapCount: number,
  usedCost: number,
  nextTrapCost: number
): PlacementResult => {
  if (phase !== 'planning') return { ok: false, reason: '実行中は配置できません。' };
  if (position.x < 0 || position.y < 0 || position.x >= stage.width || position.y >= stage.height) return { ok: false, reason: '盤面外には配置できません。' };
  const tile = stage.tiles[position.y][position.x];
  if (tile === 'wall') return { ok: false, reason: '壁には罠を置けません。' };
  if (position.x === stage.startPosition.x && position.y === stage.startPosition.y) return { ok: false, reason: 'スタート地点には置けません。' };
  if (position.x === stage.goalPosition.x && position.y === stage.goalPosition.y) return { ok: false, reason: 'ゴール地点には置けません。' };
  if (position.x === heroPosition.x && position.y === heroPosition.y) return { ok: false, reason: '勇者のいるマスには置けません。' };
  if (placedTraps.some((trap) => trap.x === position.x && trap.y === position.y)) return { ok: false, reason: 'このマスには配置できません。' };
  if (usedTrapCount >= stage.trapLimit) return { ok: false, reason: '罠の上限に達しています。' };
  if (usedCost + nextTrapCost > getEffectiveCostLimit(stage)) return { ok: false, reason: 'コストが足りません。' };
  return { ok: true };
};
