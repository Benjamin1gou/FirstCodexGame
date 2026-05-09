import type { ActionLog, LogType } from '../core/simulation/simulationTypes';

const TEMPLATES: Record<LogType, string> = {
  goal_selected: '{heroName}は王座への最短経路を選んだ。',
  trap_placed: '罠を配置した。',
  trap_triggered: '{heroName}は罠を踏んだ。',
  hero_damaged: '{heroName}のHPが{damage}減少した。',
  hero_defeated: '{heroName}は迷宮の中で力尽きた。',
  goal_reached: '{heroName}が王座へ到達した。',
  stage_cleared: 'ステージを制圧した。',
  stage_failed: '勇者の到達を許した。',
  treasure_selected: '{heroName}は宝箱に気を取られている。',
  danger_avoided: '{heroName}は危険を察知し、別の道を選んだ。',
  hero_reason: '{reason}',
  phase_changed: 'MODE: {phase}'
};

export const createLog = (type: LogType, turn: number, vars: Record<string, string | number> = {}): ActionLog => {
  let text = TEMPLATES[type];
  Object.entries(vars).forEach(([k, v]) => { text = text.replaceAll(`{${k}}`, String(v)); });
  return { type, turn, text };
};
