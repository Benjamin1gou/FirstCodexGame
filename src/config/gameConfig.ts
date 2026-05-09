export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 640;

export const TILE_SIZE = 56;
export const BOARD_OFFSET = { x: 20, y: 140 } as const;

export const SCENES = {
  preload: 'PreloadScene',
  title: 'TitleScene',
  stageSelect: 'StageSelectScene',
  game: 'GameScene',
  gameOver: 'GameOverScene'
} as const;

export const TRAP = {
  id: 'spikeTrap',
  name: 'トゲ罠',
  damage: 25,
  cost: 1,
  description: '踏むとダメージ'
} as const;

export const ENDING_STRATEGIC_COST_THRESHOLD = 8;
export const TURN_INTERVAL_MS = 700;
