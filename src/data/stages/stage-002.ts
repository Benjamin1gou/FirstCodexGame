import type { StageDefinition } from '../../core/stage/stageTypes';

export const STAGE_002: StageDefinition = {
  id: 'stage-002', name: '金貨の脇道', chapterTitle: '第2章', description: '寄り道の設計', width: 10, height: 8,
  tiles: [['wall','wall','wall','wall','wall','wall','wall','wall','wall','wall'],['wall','start','floor','wall','floor','floor','floor','floor','goal','wall'],['wall','floor','floor','wall','floor','wall','wall','floor','floor','wall'],['wall','floor','wall','wall','floor','floor','wall','floor','wall','wall'],['wall','floor','floor','floor','floor','floor','wall','floor','floor','wall'],['wall','wall','wall','wall','wall','floor','wall','wall','floor','wall'],['wall','floor','floor','floor','floor','floor','floor','floor','floor','wall'],['wall','wall','wall','wall','wall','wall','wall','wall','wall','wall']],
  startPosition: { x: 1, y: 1 }, goalPosition: { x: 8, y: 1 }, heroId: 'mio', trapLimit: 6, initialTraps: [], chests: [{ x: 5, y: 4 }, { x: 2, y: 6 }], tutorialHint: '宝箱誘導のための道を想定', narrativeId: 'stage-002'
};
