import { GAME_HEIGHT, GAME_WIDTH, TILE_SIZE } from '../../config/gameConfig';
import type { StageDefinition } from '../../core/stage/stageTypes';

export const GAME_SCENE_LAYOUT = {
  screenPadding: 10,
  topPanelHeight: 84,
  boardTopPadding: 8,
  boardBottomPadding: 8,
  trapInfoHeight: 48,
  bottomPanelHeight: 230,
  trapToolbarTop: 430,
  actionButtonTop: 560
} as const;

export type BoardLayout = {
  tileSize: number;
  boardOffset: { x: number; y: number };
};

export const computeBoardLayout = (stage: StageDefinition): BoardLayout => {
  const availableWidth = GAME_WIDTH - GAME_SCENE_LAYOUT.screenPadding * 2;
  const availableHeight =
    GAME_HEIGHT -
    GAME_SCENE_LAYOUT.topPanelHeight -
    GAME_SCENE_LAYOUT.trapInfoHeight -
    GAME_SCENE_LAYOUT.bottomPanelHeight -
    GAME_SCENE_LAYOUT.boardTopPadding -
    GAME_SCENE_LAYOUT.boardBottomPadding;
  const maxTileByWidth = Math.floor(availableWidth / stage.width);
  const maxTileByHeight = Math.floor(availableHeight / stage.height);
  const tileSize = Math.max(24, Math.min(TILE_SIZE, maxTileByWidth, maxTileByHeight));
  const boardPixelWidth = tileSize * stage.width;
  const boardPixelHeight = tileSize * stage.height;

  return {
    tileSize,
    boardOffset: {
      x: Math.floor((GAME_WIDTH - boardPixelWidth) / 2),
      y: GAME_SCENE_LAYOUT.topPanelHeight + GAME_SCENE_LAYOUT.boardTopPadding + Math.floor((availableHeight - boardPixelHeight) / 2)
    }
  };
};
