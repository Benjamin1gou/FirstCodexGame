import type { StageDefinition } from '../../core/stage/stageTypes';
export const STAGE_008: StageDefinition = {
  id: 'stage-008', name: '総合演習', chapterTitle: '第3章', description: '総合テスト', width: 10, height: 8,
  tiles: [
    ['wall','wall','wall','wall','wall','wall','wall','wall','wall','wall'],
    ['wall','start','floor','floor','floor','wall','floor','floor','goal','wall'],
    ['wall','floor','wall','wall','floor','wall','floor','wall','floor','wall'],
    ['wall','floor','floor','floor','floor','floor','floor','wall','floor','wall'],
    ['wall','wall','wall','floor','wall','wall','floor','wall','floor','wall'],
    ['wall','floor','floor','floor','floor','floor','floor','floor','floor','wall'],
    ['wall','floor','wall','wall','wall','wall','wall','wall','floor','wall'],
    ['wall','wall','wall','wall','wall','wall','wall','wall','wall','wall']
  ],
  startPosition: { x: 1, y: 1 }, goalPosition: { x: 8, y: 1 }, heroId: 'nia', trapLimit: 8, initialTraps: [{ x: 3, y: 3, type: 'decoy' }], chests: [{ x: 2, y: 5 }, { x: 7, y: 5 }], tutorialHint: '罠の組み合わせで誘導距離を稼ごう', narrativeId: 'stage-008'
};
