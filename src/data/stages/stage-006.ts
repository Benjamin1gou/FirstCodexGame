import type { StageDefinition } from '../../core/stage/stageTypes';

export const STAGE_006: StageDefinition = {
  id: 'stage-006', name: '恐怖の角', chapterTitle: '第2章', description: 'fear罠チュートリアル', width: 10, height: 8,
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
  startPosition: { x: 1, y: 1 }, goalPosition: { x: 8, y: 1 }, heroId: 'roy', trapLimit: 6, initialTraps: [], chests: [{x:6,y:5}], tutorialHint: '罠の相性を試そう', narrativeId: 'stage-001'
};
