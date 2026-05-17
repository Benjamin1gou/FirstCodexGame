import { GAME_HEIGHT, GAME_WIDTH } from '../../config/gameConfig';
import type { StageDefinition } from '../../core/stage/stageTypes';

export const GAME_SCENE_LAYOUT = {
  screenPadding: 4,
  topPanelHeight: 64,
  boardTopPadding: 0,
  boardBottomPadding: 4,
  trapInfoHeight: 0,
  bottomPanelHeight: 0,
  trapToolbarTop: 0,
  actionButtonTop: 0
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
  const tileSize = Math.max(24, Math.min(maxTileByWidth, maxTileByHeight));
  const boardPixelWidth = tileSize * stage.width;

  return {
    tileSize,
    boardOffset: {
      x: Math.floor((GAME_WIDTH - boardPixelWidth) / 2),
      y: GAME_SCENE_LAYOUT.topPanelHeight + 4
    }
  };
};
