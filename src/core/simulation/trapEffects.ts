import { TRAPS } from '../../config/gameConfig';
import type { ActionLog } from './simulationTypes';
import { createLog } from '../../systems/LogSystem';
import type { PlacedTrap } from '../stage/stageTypes';

export type TrapEffectResult = {
  hpDelta: number;
  skipTurns: number;
  logs: ActionLog[];
};

export const applyTrapEffect = (trap: PlacedTrap | undefined, turn: number, heroName: string): TrapEffectResult => {
  if (!trap) return { hpDelta: 0, skipTurns: 0, logs: [] };
  if (trap.type === 'spike') {
    return { hpDelta: -TRAPS.spike.damage, skipTurns: 0, logs: [createLog('trap_triggered', turn, { heroName, trapName: 'トゲ罠' }), createLog('hero_damaged', turn, { heroName, damage: TRAPS.spike.damage })] };
  }
  if (trap.type === 'slime') {
    return { hpDelta: -TRAPS.slime.damage, skipTurns: 1, logs: [createLog('trap_triggered', turn, { heroName, trapName: 'スライム罠' }), createLog('hero_damaged', turn, { heroName, damage: TRAPS.slime.damage }), createLog('hero_slowed', turn, { heroName })] };
  }
  return { hpDelta: 0, skipTurns: 0, logs: [createLog('decoy_reacted', turn, { heroName })] };
};
