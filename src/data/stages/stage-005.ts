import type { StageDefinition } from '../../core/stage/stageTypes';

export const STAGE_005: StageDefinition = {
  id: 'stage-005', name: '鈍足作戦', chapterTitle: '第2章', description: 'スライムと落とし穴', width: 10, height: 8,
  tiles: [
    ['wall','wall','wall','wall','wall','wall','wall','wall','wall','wall'],
    ['wall','start','floor','floor','floor','wall','floor','floor','goal','wall'],
    ['wall','wall','wall','floor','floor','wall','floor','wall','floor','wall'],
    ['wall','floor','floor','floor','wall','floor','floor','wall','floor','wall'],
    ['wall','floor','wall','floor','wall','floor','wall','wall','floor','wall'],
    ['wall','floor','wall','floor','floor','floor','floor','floor','floor','wall'],
    ['wall','floor','floor','floor','wall','wall','wall','wall','floor','wall'],
    ['wall','wall','wall','wall','wall','wall','wall','wall','wall','wall']
  ],
  startPosition: { x: 1, y: 1 }, goalPosition: { x: 8, y: 1 }, heroId: 'serena', trapLimit: 6, initialTraps: [], chests: [{x:6,y:5}], tutorialHint: '罠の相性を試そう', narrativeId: 'stage-001'
};
