import type { StageDefinition } from '../../core/stage/stageTypes';

export const STAGE_004: StageDefinition = {
  id: 'stage-004', name: '分岐の罠道', chapterTitle: '第2章', description: '分岐でデコイ誘導', width: 10, height: 8,
  tiles: [
    ['wall','wall','wall','wall','wall','wall','wall','wall','wall','wall'],
    ['wall','start','floor','floor','floor','floor','floor','floor','goal','wall'],
    ['wall','wall','wall','floor','wall','wall','floor','wall','floor','wall'],
    ['wall','floor','floor','floor','floor','floor','floor','wall','floor','wall'],
    ['wall','floor','wall','wall','wall','floor','wall','wall','floor','wall'],
    ['wall','floor','floor','floor','floor','floor','floor','floor','floor','wall'],
    ['wall','floor','wall','wall','wall','wall','wall','wall','floor','wall'],
    ['wall','wall','wall','wall','wall','wall','wall','wall','wall','wall']
  ],
  startPosition: { x: 1, y: 1 }, goalPosition: { x: 8, y: 1 }, heroId: 'mio', trapLimit: 6, initialTraps: [], chests: [{ x: 2, y: 5 }, { x: 7, y: 5 }], tutorialHint: 'デコイで下ルートへ引き付けよう', narrativeId: 'stage-004'
};
