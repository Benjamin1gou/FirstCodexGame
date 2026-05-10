import { TRAPS } from '../../config/gameConfig';
import type { ActionLog } from './simulationTypes';
import { createLog } from '../../systems/LogSystem';
import type { PlacedTrap } from '../stage/stageTypes';

export type TrapEffectResult = {
  hpDelta: number;
  skipTurns: number;
  reverseStep: boolean;
  logs: ActionLog[];
};

export const applyTrapEffect = (trap: PlacedTrap | undefined, turn: number, heroName: string): TrapEffectResult => {
  if (!trap) return { hpDelta: 0, skipTurns: 0, reverseStep: false, logs: [] };
  if (trap.type === 'spike') return { hpDelta: -TRAPS.spike.damage, skipTurns: 0, reverseStep: false, logs: [createLog('trap_triggered', turn, { heroName, trapName: TRAPS.spike.name })] };
  if (trap.type === 'slime' || trap.type === 'pitfall') return { hpDelta: -TRAPS[trap.type].damage, skipTurns: 1, reverseStep: false, logs: [createLog('trap_triggered', turn, { heroName, trapName: TRAPS[trap.type].name }), createLog('hero_slowed', turn, { heroName })] };
  if (trap.type === 'arrow') return { hpDelta: -TRAPS.arrow.damage, skipTurns: 0, reverseStep: false, logs: [createLog('trap_triggered', turn, { heroName, trapName: TRAPS.arrow.name })] };
  if (trap.type === 'fear') return { hpDelta: 0, skipTurns: 0, reverseStep: true, logs: [createLog('trap_triggered', turn, { heroName, trapName: TRAPS.fear.name })] };
  return { hpDelta: 0, skipTurns: 0, reverseStep: false, logs: [createLog('decoy_reacted', turn, { heroName })] };
};
