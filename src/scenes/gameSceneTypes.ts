import type { StageDefinition, TileType } from '../core/stage/stageTypes';

export const TILE_COLORS: Record<TileType, number> = {
  floor: 0xdddddd,
  wall: 0x444444,
  start: 0x4caf50,
  goal: 0x7b1fa2,
  trap: 0xd32f2f,
  treasure: 0xffc107,
  monster: 0xff5722
};

export const isTileInBounds = (stage: StageDefinition, x: number, y: number): boolean => {
  return y >= 0 && y < stage.height && x >= 0 && x < stage.width;
};
