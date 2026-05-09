import type { HeroState } from '../ai/heroAiTypes';
import type { GridPosition } from '../stage/stageTypes';

export type LogType =
  | 'goal_selected'
  | 'trap_placed'
  | 'trap_triggered'
  | 'hero_damaged'
  | 'hero_defeated'
  | 'goal_reached'
  | 'stage_cleared'
  | 'stage_failed'
  | 'treasure_selected'
  | 'danger_avoided';

export type ActionLog = { type: LogType; text: string; turn: number };

export type GameSimulationState = {
  stageId: string;
  hero: HeroState;
  placedTraps: GridPosition[];
  turn: number;
  status: 'playing' | 'cleared' | 'failed';
  logs: ActionLog[];
  score: number;
  usedTrapCost: number;
};
