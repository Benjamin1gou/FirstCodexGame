import { createLog } from '../../systems/LogSystem';
import type { GameSimulationState } from '../../core/simulation/simulationTypes';
import type { StageDefinition } from '../../core/stage/stageTypes';
import { HEROES } from '../../data/heroes/heroes';

export const createInitialSimulationState = (stage: StageDefinition): { state: GameSimulationState; heroName: string } => {
  const heroDef = HEROES.find((hero) => hero.id === stage.heroId);
  if (!heroDef) throw new Error(`Hero definition not found: ${stage.heroId}`);

  return {
    heroName: heroDef.name,
    state: {
      stageId: stage.id,
      hero: {
        heroId: heroDef.id,
        name: heroDef.name,
        hp: heroDef.maxHp,
        maxHp: heroDef.maxHp,
        position: { ...stage.startPosition },
        traits: heroDef.traits,
        memory: { seenTraps: [], lastPosition: null },
        currentTarget: stage.goalPosition,
        status: 'alive',
        skipTurns: 0
      },
      placedTraps: [...stage.initialTraps],
      turn: 0,
      status: 'playing',
      phase: 'planning',
      logs: [createLog('phase_changed', 0, { phase: 'PLANNING' })],
      score: 0,
      usedTrapCost: 0
    }
  };
};
