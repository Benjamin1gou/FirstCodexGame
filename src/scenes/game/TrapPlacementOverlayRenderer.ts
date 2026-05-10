import { canPlaceTrap } from '../../core/rules/placementRules';
import type { GameSimulationState } from '../../core/simulation/simulationTypes';
import type { GridPosition, StageDefinition, TrapType } from '../../core/stage/stageTypes';
import { TRAPS } from '../../config/gameConfig';

const PLACEABLE_COLOR = 0x63d182;
const BLOCKED_COLOR = 0xf07b7b;
const RANGE_COLOR = 0x7cc4ff;
const CELL_ALPHA = 0.2;
const RANGE_ALPHA = 0.18;
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

      const color = result.ok ? PLACEABLE_COLOR : BLOCKED_COLOR;
      const alpha = result.ok ? CELL_ALPHA : 0.1;
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
