import type { HeroState } from '../ai/heroAiTypes';
import type { PlacedTrap } from '../stage/stageTypes';

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
  | 'danger_avoided'
  | 'hero_reason'
  | 'phase_changed';

export type ActionLog = { type: LogType; text: string; turn: number };

export type GamePhase = 'planning' | 'running' | 'cleared' | 'failed';

export type GameSimulationState = {
  stageId: string;
  hero: HeroState;
  placedTraps: PlacedTrap[];
  turn: number;
  status: 'playing' | 'cleared' | 'failed';
  phase: GamePhase;
  logs: ActionLog[];
  score: number;
  usedTrapCost: number;
};
