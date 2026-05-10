import type { StageDefinition, GridPosition, TileType } from './stageTypes';
import type { HeroDefinition } from '../ai/heroAiTypes';

export type StageValidationError = { stageId: string; message: string };

const isInside = (p: GridPosition, width: number, height: number): boolean => p.x >= 0 && p.y >= 0 && p.x < width && p.y < height;

const isWalkable = (tile: TileType): boolean => tile !== 'wall';

const hasRoute = (stage: StageDefinition): boolean => {
  const queue: GridPosition[] = [stage.startPosition];
  const visited = new Set<string>([`${stage.startPosition.x},${stage.startPosition.y}`]);
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) return false;
    if (current.x === stage.goalPosition.x && current.y === stage.goalPosition.y) return true;
    const next = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 }
    ];
    next.forEach((p) => {
      if (!isInside(p, stage.width, stage.height)) return;
      if (!isWalkable(stage.tiles[p.y][p.x])) return;
      const key = `${p.x},${p.y}`;
      if (visited.has(key)) return;
      visited.add(key);
      queue.push(p);
    });
  }
  return false;
};

export const validateStage = (stage: StageDefinition, heroes: HeroDefinition[]): StageValidationError[] => {
  const errors: StageValidationError[] = [];
  if (stage.tiles.length !== stage.height) errors.push({ stageId: stage.id, message: 'heightとtiles行数が不一致' });
  if (stage.tiles.some((row) => row.length !== stage.width)) errors.push({ stageId: stage.id, message: 'widthとtiles列数が不一致' });
  if (!isInside(stage.startPosition, stage.width, stage.height)) errors.push({ stageId: stage.id, message: 'startPositionが盤面外' });
  if (!isInside(stage.goalPosition, stage.width, stage.height)) errors.push({ stageId: stage.id, message: 'goalPositionが盤面外' });
  if (stage.trapLimit < 0) errors.push({ stageId: stage.id, message: 'trapLimitが不正' });
  if (!heroes.some((hero) => hero.id === stage.heroId)) errors.push({ stageId: stage.id, message: 'heroIdが未定義' });
  stage.initialTraps.forEach((trap) => {
    if (!isInside(trap, stage.width, stage.height)) errors.push({ stageId: stage.id, message: `initialTrapsが盤面外: ${trap.x},${trap.y}` });
  });
  stage.chests.forEach((chest) => {
    if (!isInside(chest, stage.width, stage.height)) errors.push({ stageId: stage.id, message: `chestsが盤面外: ${chest.x},${chest.y}` });
  });
  if (errors.length === 0 && !hasRoute(stage)) errors.push({ stageId: stage.id, message: 'startからgoalへ到達不能' });
  return errors;
};
