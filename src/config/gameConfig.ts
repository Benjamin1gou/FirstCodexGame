export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 640;
export const TILE_SIZE = 56;
export const SCENES = { title:'TitleScene', stageSelect:'StageSelectScene', game:'GameScene', gameOver:'GameOverScene' } as const;
export const TRAP = { id:'spikeTrap', name:'トゲ罠', damage:25, cost:1, description:'踏むとダメージ' };
