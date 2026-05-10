import { TRAPS } from '../../config/gameConfig';
import { createLog } from '../../systems/LogSystem';
import type { PlacedTrap } from '../stage/stageTypes';
import type { ActionLog } from './simulationTypes';
import { TRAP_LIFECYCLE, normalizePlacedTrap } from './trapState';

export type TrapEffectResult = {
  hpDelta: number;
  skipTurns: number;
  reverseStep: boolean;
  manaDelta: number;
  updatedTrap?: PlacedTrap;
  logs: ActionLog[];
  triggered: boolean;
};

export const applyTrapEffect = (trap: PlacedTrap | undefined, turn: number, heroName: string): TrapEffectResult => {
  if (!trap) return { hpDelta: 0, skipTurns: 0, reverseStep: false, manaDelta: 0, logs: [], triggered: false };
  const current = normalizePlacedTrap(trap);
  if (current.destroyed) return { hpDelta: 0, skipTurns: 0, reverseStep: false, manaDelta: 0, logs: [createLog('trap_destroyed', turn, { trapName: TRAPS[current.type].name })], updatedTrap: current, triggered: false };
  if ((current.remainingCooldown ?? 0) > 0) return { hpDelta: 0, skipTurns: 0, reverseStep: false, manaDelta: 0, logs: [createLog('trap_cooldown_started', turn, { trapName: TRAPS[current.type].name })], updatedTrap: current, triggered: false };

  const hpDelta = current.type === 'spike' ? -TRAPS.spike.damage : current.type === 'arrow' ? -TRAPS.arrow.damage : current.type === 'slime' || current.type === 'pitfall' ? -TRAPS[current.type].damage : 0;
  const skipTurns = current.type === 'slime' || current.type === 'pitfall' ? 1 : 0;
  const reverseStep = current.type === 'fear';
  const lifecycle = TRAP_LIFECYCLE[current.type];
  const triggerCount = (current.triggerCount ?? 0) + 1;
  const destroyed = triggerCount >= lifecycle.maxTriggerCount;
  const remainingCooldown = destroyed ? 0 : lifecycle.cooldownTurns;
  const updatedTrap: PlacedTrap = { ...current, triggerCount, destroyed, remainingCooldown };
  const logs: ActionLog[] = [createLog('trap_triggered', turn, { heroName, trapName: TRAPS[current.type].name })];
  if (skipTurns > 0) logs.push(createLog('hero_slowed', turn, { heroName }));
  if (current.type === 'decoy') logs.push(createLog('decoy_reacted', turn, { heroName }));
  if (destroyed) logs.push(createLog('trap_destroyed', turn, { trapName: TRAPS[current.type].name }));
  else if (remainingCooldown > 0) logs.push(createLog('trap_cooldown_started', turn, { trapName: TRAPS[current.type].name }));
  const manaDelta = lifecycle.manaRecovery;
  if (manaDelta > 0) logs.push(createLog('mana_changed', turn, { manaDelta }));
  return { hpDelta, skipTurns, reverseStep, manaDelta, updatedTrap, logs, triggered: true };
};
