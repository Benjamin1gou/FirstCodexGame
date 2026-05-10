import { canPlaceTrap } from '../../core/rules/placementRules';
import type { GameSimulationState } from '../../core/simulation/simulationTypes';
import type { GridPosition, StageDefinition, TrapType } from '../../core/stage/stageTypes';
import { TRAPS } from '../../config/gameConfig';

const PLACEABLE_COLOR = 0x77d78b;
const BLOCKED_COLOR = 0x8892a0;
const RANGE_COLOR = 0x7cc4ff;
const REASON_COLORS = {
  wall: 0x6f7784,
  start: 0x5b91ff,
  goal: 0xf4be4a,
  hero: 0xb07de0,
  occupied: 0xd98989
} as const;
const CELL_ALPHA = 0.18;
const RANGE_ALPHA = 0.18;
const REASON_ALPHA = 0.14;
const RANGE_BY_TRAP: Partial<Record<TrapType, number>> = { arrow: 1, decoy: 2 };

const toKey = (x: number, y: number): string => `${x},${y}`;

export const buildTrapRangeCells = (
  stage: StageDefinition,
  center: GridPosition,
  trapType: TrapType
): GridPosition[] => {
  const radius = RANGE_BY_TRAP[trapType] ?? 0;
  if (radius <= 0) return [center];

  const cells: GridPosition[] = [];
  for (let y = center.y - radius; y <= center.y + radius; y += 1) {
    for (let x = center.x - radius; x <= center.x + radius; x += 1) {
      if (x < 0 || y < 0 || x >= stage.width || y >= stage.height) continue;
      cells.push({ x, y });
    }
  }
  return cells;
};

export const renderPlacementOverlay = (
  scene: Phaser.Scene,
  stage: StageDefinition,
  state: GameSimulationState,
  selectedTrap: TrapType,
  tileSize: number,
  boardOffset: GridPosition
): Phaser.GameObjects.GameObject[] => {
  if (state.phase !== 'planning') return [];

  const overlays: Phaser.GameObjects.GameObject[] = [];
  const placedTrapPositions = new Set(state.placedTraps.map((trap) => toKey(trap.x, trap.y)));

  for (let y = 0; y < stage.height; y += 1) {
    for (let x = 0; x < stage.width; x += 1) {
      const result = canPlaceTrap(
        state.phase,
        stage,
        { x, y },
        state.hero.position,
        state.placedTraps,
        state.placedTraps.length,
        state.usedTrapCost,
        TRAPS[selectedTrap].cost
      );

      const reasonColor = getBlockedReasonColor(stage, { x, y }, state.hero.position, placedTrapPositions);
      const color = result.ok ? PLACEABLE_COLOR : (reasonColor ?? BLOCKED_COLOR);
      const alpha = result.ok ? CELL_ALPHA : (reasonColor ? REASON_ALPHA : 0.08);
      const rect = scene.add.rectangle(
        boardOffset.x + x * tileSize + tileSize / 2,
        boardOffset.y + y * tileSize + tileSize / 2,
        tileSize * 0.82,
        tileSize * 0.82,
        color,
        alpha
      ).setDepth(120);
      overlays.push(rect);

      if (!result.ok || placedTrapPositions.has(toKey(x, y))) continue;
      const rangeCells = buildTrapRangeCells(stage, { x, y }, selectedTrap);
      for (const rangeCell of rangeCells) {
        if (rangeCell.x === x && rangeCell.y === y) continue;
        const rangeRect = scene.add.rectangle(
          boardOffset.x + rangeCell.x * tileSize + tileSize / 2,
          boardOffset.y + rangeCell.y * tileSize + tileSize / 2,
          tileSize * 0.42,
          tileSize * 0.42,
          RANGE_COLOR,
          RANGE_ALPHA
        ).setDepth(121);
        overlays.push(rangeRect);
      }
    }
  }
  return overlays;
};

export const destroyPlacementOverlay = (objects: Phaser.GameObjects.GameObject[]): void => {
  objects.forEach((obj) => obj.destroy());
};

const isSamePosition = (a: GridPosition, b: GridPosition): boolean => a.x === b.x && a.y === b.y;

const getBlockedReasonColor = (
  stage: StageDefinition,
  position: GridPosition,
  heroPosition: GridPosition,
  placedTrapPositions: Set<string>
): number | null => {
  const tile = stage.tiles[position.y][position.x];
  if (tile === 'wall') return REASON_COLORS.wall;
  if (isSamePosition(position, stage.startPosition)) return REASON_COLORS.start;
  if (isSamePosition(position, stage.goalPosition)) return REASON_COLORS.goal;
  if (isSamePosition(position, heroPosition)) return REASON_COLORS.hero;
  if (placedTrapPositions.has(toKey(position.x, position.y))) return REASON_COLORS.occupied;
  return null;
};
