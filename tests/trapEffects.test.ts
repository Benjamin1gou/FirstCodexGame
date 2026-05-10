import { describe, it, expect } from 'vitest';
import { applyTrapEffect } from '../src/core/simulation/trapEffects';
import { createPlacedTrap, tickTrapCooldowns } from '../src/core/simulation/trapState';

describe('trap effects', () => {
  it('spike は1回発動で destroyed', () => {
    const result = applyTrapEffect(createPlacedTrap({ x: 1, y: 1 }, 'spike'), 1, 'h');
    expect(result.updatedTrap?.destroyed).toBe(true);
  });

  it('slime は発動後 cooldown に入る', () => {
    const result = applyTrapEffect(createPlacedTrap({ x: 1, y: 1 }, 'slime'), 1, 'h');
    expect(result.updatedTrap?.remainingCooldown).toBe(2);
  });

  it('cooldown 中は発動しない', () => {
    const trap = { ...createPlacedTrap({ x: 0, y: 0 }, 'slime'), remainingCooldown: 1 };
    const result = applyTrapEffect(trap, 1, 'h');
    expect(result.triggered).toBe(false);
    expect(result.manaDelta).toBe(0);
  });

  it('cooldown はターン経過で減る', () => {
    const trap = { ...createPlacedTrap({ x: 0, y: 0 }, 'slime'), remainingCooldown: 2 };
    const ticked = tickTrapCooldowns([trap]);
    expect(ticked.traps[0].remainingCooldown).toBe(1);
  });

  it('decoy は最大3回発動できる', () => {
    let trap = createPlacedTrap({ x: 0, y: 0 }, 'decoy');
    trap = applyTrapEffect(trap, 1, 'h').updatedTrap!;
    trap = { ...trap, remainingCooldown: 0 };
    trap = applyTrapEffect(trap, 2, 'h').updatedTrap!;
    trap = { ...trap, remainingCooldown: 0 };
    trap = applyTrapEffect(trap, 3, 'h').updatedTrap!;
    expect(trap.destroyed).toBe(true);
  });

  it('fear は1回発動で destroyed', () => {
    const result = applyTrapEffect(createPlacedTrap({ x: 1, y: 1 }, 'fear'), 1, 'h');
    expect(result.updatedTrap?.destroyed).toBe(true);
  });

  it('destroyed の罠は発動しない', () => {
    const result = applyTrapEffect({ ...createPlacedTrap({ x: 1, y: 1 }, 'fear'), destroyed: true }, 1, 'h');
    expect(result.triggered).toBe(false);
  });

  it('mana 回復は上限管理用の delta を返す', () => {
    expect(applyTrapEffect(createPlacedTrap({ x: 0, y: 0 }, 'slime'), 1, 'h').manaDelta).toBe(1);
    expect(applyTrapEffect(createPlacedTrap({ x: 0, y: 0 }, 'arrow'), 1, 'h').manaDelta).toBe(0);
  });
});
