import type { StageDefinition } from '../../core/stage/stageTypes';
export const STAGE_007: StageDefinition = {
  id: 'stage-007', name: '矢雨の回廊', chapterTitle: '第3章', description: 'arrow罠活用', width: 10, height: 8,
  tiles: [
    ['wall','wall','wall','wall','wall','wall','wall','wall','wall','wall'],
    ['wall','start','floor','floor','floor','floor','floor','floor','goal','wall'],
    ['wall','wall','floor','wall','wall','wall','wall','floor','wall','wall'],
    ['wall','floor','floor','floor','floor','floor','wall','floor','floor','wall'],
    ['wall','floor','wall','wall','wall','floor','wall','wall','floor','wall'],
    ['wall','floor','floor','floor','floor','floor','floor','floor','floor','wall'],
    ['wall','wall','wall','wall','wall','wall','wall','floor','floor','wall'],
    ['wall','wall','wall','wall','wall','wall','wall','wall','wall','wall']
  ],
  startPosition: { x: 1, y: 1 }, goalPosition: { x: 8, y: 1 }, heroId: 'adel', trapLimit: 8, initialTraps: [], chests: [], tutorialHint: 'arrowを通路の角に置くと効率的', narrativeId: 'stage-007'
};
