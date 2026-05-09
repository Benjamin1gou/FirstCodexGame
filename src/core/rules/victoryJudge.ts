import type { GameSimulationState } from '../simulation/simulationTypes';
import type { GridPosition } from '../stage/stageTypes';
export const judgeStageStatus = (state: GameSimulationState, goal: GridPosition) => {
  if (state.hero.hp <= 0) return 'cleared' as const;
  if (state.hero.position.x === goal.x && state.hero.position.y === goal.y) return 'failed' as const;
  return 'playing' as const;
};
