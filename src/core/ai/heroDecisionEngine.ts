import type { HeroState } from './heroAiTypes';
import type { GridPosition, TileType } from '../stage/stageTypes';
import { findNextStep } from './pathfinding';
export const decideHeroNextPosition = (hero: HeroState, tiles: TileType[][], goal: GridPosition): GridPosition => {
  const next = findNextStep(tiles, hero.position, goal);
  return next ?? hero.position;
};
