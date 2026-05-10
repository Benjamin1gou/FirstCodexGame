import { ASSET_KEYS } from '../../assets/assetKeys';
import { getTileAssetKey } from '../gameSceneTypes';
import type { StageDefinition } from '../../core/stage/stageTypes';

export const boardToWorld = (x: number, y: number, tileSize: number, boardOffset: { x: number; y: number }): { x: number; y: number } => ({
  x: boardOffset.x + x * tileSize,
  y: boardOffset.y + y * tileSize
});

export const renderBoardTiles = (scene: Phaser.Scene, stage: StageDefinition, tileSize: number, boardOffset: { x: number; y: number }): void => {
  for (let y = 0; y < stage.height; y += 1) {
    for (let x = 0; x < stage.width; x += 1) {
      const world = boardToWorld(x, y, tileSize, boardOffset);
      scene.add.image(world.x, world.y, getTileAssetKey(stage.tiles[y][x])).setOrigin(0).setDisplaySize(tileSize, tileSize);
    }
  }
};

export const renderTrapTile = (scene: Phaser.Scene, x: number, y: number, tileSize: number, boardOffset: { x: number; y: number }): Phaser.GameObjects.Image => {
  const world = boardToWorld(x, y, tileSize, boardOffset);
  return scene.add.image(world.x, world.y, ASSET_KEYS.tiles.trap).setOrigin(0).setDisplaySize(tileSize, tileSize);
};
