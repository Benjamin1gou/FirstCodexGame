import { ASSET_KEYS, type TileAssetKey } from '../assets/assetKeys';
import type { StageDefinition, TileType } from '../core/stage/stageTypes';

const TILE_ASSET_BY_TYPE: Record<TileType, TileAssetKey> = {
  floor: ASSET_KEYS.tiles.floor,
  wall: ASSET_KEYS.tiles.wall,
  start: ASSET_KEYS.tiles.start,
  goal: ASSET_KEYS.tiles.goal,
  trap: ASSET_KEYS.tiles.trap,
  treasure: ASSET_KEYS.tiles.treasure,
  monster: ASSET_KEYS.tiles.monster
};

export const getTileAssetKey = (tileType: TileType): TileAssetKey => TILE_ASSET_BY_TYPE[tileType];

export const isTileInBounds = (stage: StageDefinition, x: number, y: number): boolean => {
  return y >= 0 && y < stage.height && x >= 0 && x < stage.width;
};
