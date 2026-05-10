import type { ActionLog, LogType } from '../core/simulation/simulationTypes';

const TEMPLATES: Record<LogType, string> = {
  goal_selected: '{heroName}は王座への最短経路を選んだ。',
  trap_placed: '{trapName}を配置した。',
  trap_triggered: '{heroName}は{trapName}を踏んだ。',
  hero_damaged: '{heroName}のHPが{damage}減少した。',
  hero_defeated: '{heroName}は迷宮の中で力尽きた。',
  goal_reached: '{heroName}が王座へ到達した。',
  stage_cleared: 'ステージを制圧した。',
  stage_failed: '勇者の到達を許した。',
  treasure_selected: '{heroName}は宝箱に気を取られている。',
  danger_avoided: '{heroName}は危険を察知し、別の道を選んだ。',
  hero_reason: '{reason}',
  phase_changed: 'MODE: {phase}',
  trap_selected: '選択中の罠を{trapName}に変更。',
  trap_removed: '最後に置いた「{trapName}」を取り消しました。',
  placement_denied: '{reason}',
  prediction_updated: '予測ルートを更新しました。',
  hero_slowed: '{heroName}は足止めされた。',
  decoy_reacted: '{heroName}はデコイに反応した。',
  rank_shown: 'RANK: {rank}',
  trap_cooldown_started: '{trapName}はまだ再使用待ちです。',
  trap_ready: '{trapName}が再使用可能になった。',
  trap_destroyed: '{trapName}は壊れた。',
  mana_changed: '魔力が{manaDelta}回復した。'
};

export const createLog = (type: LogType, turn: number, vars: Record<string, string | number> = {}): ActionLog => {
  let text = TEMPLATES[type];
  Object.entries(vars).forEach(([k, v]) => { text = text.replaceAll(`{${k}}`, String(v)); });
  return { type, turn, text };
};
