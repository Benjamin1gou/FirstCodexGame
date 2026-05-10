import type { StageDefinition } from '../../core/stage/stageTypes';
export const STAGE_005: StageDefinition = {
  id: 'stage-005', name: '鈍足作戦', chapterTitle: '第2章', description: '足止め重視', width: 10, height: 8,
  tiles: [
    ['wall','wall','wall','wall','wall','wall','wall','wall','wall','wall'],
    ['wall','start','floor','floor','floor','floor','floor','floor','goal','wall'],
    ['wall','floor','wall','wall','floor','wall','wall','floor','wall','wall'],
    ['wall','floor','floor','floor','floor','floor','floor','floor','floor','wall'],
    ['wall','wall','wall','floor','wall','wall','floor','wall','floor','wall'],
    ['wall','floor','floor','floor','floor','floor','floor','wall','floor','wall'],
    ['wall','floor','wall','wall','wall','wall','floor','floor','floor','wall'],
    ['wall','wall','wall','wall','wall','wall','wall','wall','wall','wall']
  ],
  startPosition: { x: 1, y: 1 }, goalPosition: { x: 8, y: 1 }, heroId: 'serena', trapLimit: 7, initialTraps: [], chests: [{ x: 7, y: 6 }], tutorialHint: 'slime/pitfallでテンポを崩そう', narrativeId: 'stage-005'
};
