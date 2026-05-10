import { TRAPS } from '../../config/gameConfig';
import type { TrapType } from '../../core/stage/stageTypes';

const TRAP_DESCRIPTIONS: Record<TrapType, string> = {
  spike: '高ダメージでHPを大きく削る',
  slime: '小ダメージ + 1ターン足止め',
  decoy: '周囲2マスに興味を引き寄せる',
  arrow: '周囲1マスに矢の危険範囲',
  fear: '勇者を1手後退させる',
  pitfall: '小ダメージ + 1ターン足止め'
};

export const formatTrapInfoText = (trap: TrapType): string => {
  const trapConfig = TRAPS[trap];
  return `選択中: ${trapConfig.name} / Cost:${trapConfig.cost} / ${TRAP_DESCRIPTIONS[trap]}`;
};
