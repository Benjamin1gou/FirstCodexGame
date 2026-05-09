import type { HeroDefinition } from '../../core/ai/heroAiTypes';

export const HEROES: HeroDefinition[] = [
  {
    id: 'adel', name: 'アデル', title: '猛進の剣士', maxHp: 100,
    traits: { goalPressure: 0.9, curiosity: 0.3, riskAversion: 0.2, trapMemory: 0.2, treasureBias: 0.2 },
    lines: ['魔王め、真正面から打ち破ってやる！']
  },
  {
    id: 'mio', name: 'ミオ', title: '迷宮探索者', maxHp: 90,
    traits: { goalPressure: 0.6, curiosity: 0.9, riskAversion: 0.5, trapMemory: 0.4, treasureBias: 0.9 },
    lines: ['あの宝箱……中身を確認するだけなら']
  },
  {
    id: 'serena', name: 'セレナ', title: '聖騎士', maxHp: 120,
    traits: { goalPressure: 0.8, curiosity: 0.2, riskAversion: 0.9, trapMemory: 0.9, treasureBias: 0.1 },
    lines: ['遠回りでも、安全ならば価値がある']
  }
];
