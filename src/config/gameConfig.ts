import type { TrapDefinition } from '../core/stage/stageTypes';

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

export const TRAPS: Record<string, TrapDefinition> = {
  spike: { id: 'spike', name: 'トゲ罠', damage: 25, cost: 1, effect: 'damage', description: '踏むとダメージ' },
  slime: { id: 'slime', name: 'スライム罠', damage: 8, cost: 1, effect: 'slow', description: '1ターン足止め' },
  decoy: { id: 'decoy', name: 'デコイ罠', damage: 0, cost: 1, effect: 'attract', description: '好奇心を誘う' }
};

export const ENDING_STRATEGIC_COST_THRESHOLD = 8;
export const TURN_INTERVAL_MS = 700;
