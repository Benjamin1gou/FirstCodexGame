import type { HeroDefinition } from '../../core/ai/heroAiTypes';

export const HEROES: HeroDefinition[] = [
  { id: 'adel', name: 'アデル', title: '猛進の剣士', maxHp: 100, traits: { goalPressure: 0.95, curiosity: 0.25, riskAversion: 0.2, trapMemory: 0.2, treasureBias: 0.2 }, lines: ['魔王め、真正面から打ち破ってやる！'] },
  { id: 'mio', name: 'ミオ', title: '迷宮探索者', maxHp: 90, traits: { goalPressure: 0.6, curiosity: 0.95, riskAversion: 0.5, trapMemory: 0.4, treasureBias: 1.0 }, lines: ['あの宝箱……中身を確認するだけなら'] },
  { id: 'serena', name: 'セレナ', title: '聖騎士', maxHp: 120, traits: { goalPressure: 0.8, curiosity: 0.2, riskAversion: 0.95, trapMemory: 0.95, treasureBias: 0.1 }, lines: ['遠回りでも、安全ならば価値がある'] },
  { id: 'roy', name: 'ロイ', title: '王国戦術士', maxHp: 105, traits: { goalPressure: 0.75, curiosity: 0.6, riskAversion: 0.55, trapMemory: 0.5, treasureBias: 0.45 }, lines: ['状況に合わせて最適解を選ぶ。'] },
  { id: 'nia', name: 'ニア', title: '宝箱ハンター', maxHp: 80, traits: { goalPressure: 0.5, curiosity: 1.0, riskAversion: 0.25, trapMemory: 0.3, treasureBias: 1.2 }, lines: ['宝箱の匂いがする！'] }
];
