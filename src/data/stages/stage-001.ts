import type { StageDefinition } from '../../core/stage/stageTypes';

export const STAGE_001: StageDefinition = {
  id: 'stage-001', name: '誘惑の回廊', chapterTitle: '第1章', description: '基本ルール',
  width: 10, height: 8,
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
  startPosition:{x:1,y:1}, goalPosition:{x:8,y:1}, heroId:'adel', trapLimit:5, initialTraps:[], tutorialHint:'クリックで罠を配置', narrativeId:'stage-001'
};
