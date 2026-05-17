import { ASSET_KEYS } from '../../assets/assetKeys';
import type { StageDefinition, TileType } from '../../core/stage/stageTypes';

type RgbTriplet = { primary: number; accent: number; border: number };

const GB_BOARD_COLORS: RgbTriplet = {
  primary: 0x8bac0f,
  accent: 0x9bbc0f,
  border: 0x0f380f
};

const TILE_SHADE: Record<TileType, number> = {
  floor: 0x8bac0f,
  wall: 0x306230,
  start: 0x9bbc0f,
  goal: 0x0f380f,
  trap: 0x306230,
  treasure: 0x306230,
  monster: 0x306230,
  chest: 0x306230
};

export const boardToWorld = (x: number, y: number, tileSize: number, boardOffset: { x: number; y: number }): { x: number; y: number } => ({
  x: boardOffset.x + x * tileSize,
  y: boardOffset.y + y * tileSize
});

const drawBoardFrame = (scene: Phaser.Scene, stage: StageDefinition, tileSize: number, boardOffset: { x: number; y: number }): void => {
  const boardWidth = stage.width * tileSize;
  const boardHeight = stage.height * tileSize;
  const framePadding = Math.max(4, Math.floor(tileSize * 0.16));

  scene.add.rectangle(boardOffset.x + boardWidth / 2, boardOffset.y + boardHeight / 2, boardWidth + framePadding * 2, boardHeight + framePadding * 2, GB_BOARD_COLORS.border).setDepth(-2);
  scene.add.rectangle(boardOffset.x + boardWidth / 2, boardOffset.y + boardHeight / 2, boardWidth, boardHeight, GB_BOARD_COLORS.accent).setDepth(-1);
};

export const renderBoardTiles = (scene: Phaser.Scene, stage: StageDefinition, tileSize: number, boardOffset: { x: number; y: number }): void => {
  drawBoardFrame(scene, stage, tileSize, boardOffset);

  for (let y = 0; y < stage.height; y += 1) {
    for (let x = 0; x < stage.width; x += 1) {
      const world = boardToWorld(x, y, tileSize, boardOffset);
      const tileType = stage.tiles[y][x];
      const fillColor = TILE_SHADE[tileType] ?? GB_BOARD_COLORS.primary;
      const tile = scene.add.rectangle(world.x + tileSize / 2, world.y + tileSize / 2, tileSize - 1, tileSize - 1, fillColor).setDepth(0);
      tile.setStrokeStyle(1, GB_BOARD_COLORS.border, 0.2);
    }
  }
};

export const renderTrapTile = (scene: Phaser.Scene, x: number, y: number, tileSize: number, boardOffset: { x: number; y: number }): Phaser.GameObjects.Image => {
  const world = boardToWorld(x, y, tileSize, boardOffset);
  return scene.add.image(world.x, world.y, ASSET_KEYS.tiles.trap).setOrigin(0).setDisplaySize(tileSize, tileSize);
};
