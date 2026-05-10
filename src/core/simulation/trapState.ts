import type { PlacedTrap, TrapType } from '../stage/stageTypes';

export type TrapLifecycleSpec = {
  maxTriggerCount: number;
  cooldownTurns: number;
  manaRecovery: number;
};

export const TRAP_LIFECYCLE: Record<TrapType, TrapLifecycleSpec> = {
  spike: { maxTriggerCount: 1, cooldownTurns: 0, manaRecovery: 0 },
  slime: { maxTriggerCount: 2, cooldownTurns: 2, manaRecovery: 1 },
  decoy: { maxTriggerCount: 3, cooldownTurns: 1, manaRecovery: 1 },
  arrow: { maxTriggerCount: 2, cooldownTurns: 2, manaRecovery: 0 },
  fear: { maxTriggerCount: 1, cooldownTurns: 0, manaRecovery: 1 },
  pitfall: { maxTriggerCount: 1, cooldownTurns: 0, manaRecovery: 1 }
};

export const createPlacedTrap = (position: { x: number; y: number }, type: TrapType): PlacedTrap => {
  const spec = TRAP_LIFECYCLE[type];
  return { ...position, type, triggerCount: 0, maxTriggerCount: spec.maxTriggerCount, remainingCooldown: 0, cooldownTurns: spec.cooldownTurns, destroyed: false };
};

export const normalizePlacedTrap = (trap: PlacedTrap): PlacedTrap => {
  if (typeof trap.maxTriggerCount === 'number' && typeof trap.cooldownTurns === 'number') return { ...trap };
  return createPlacedTrap(trap, trap.type);
};

export const tickTrapCooldowns = (traps: PlacedTrap[]): { traps: PlacedTrap[]; readied: PlacedTrap[] } => {
  const readied: PlacedTrap[] = [];
  const next = traps.map((trap) => {
    const n = normalizePlacedTrap(trap);
    if (n.destroyed || (n.remainingCooldown ?? 0) <= 0) return n;
    const remainingCooldown = Math.max(0, (n.remainingCooldown ?? 0) - 1);
    const updated = { ...n, remainingCooldown };
    if (remainingCooldown === 0) readied.push(updated);
    return updated;
  });
  return { traps: next, readied };
};
