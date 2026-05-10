import { describe, it, expect } from 'vitest';
import { applyTrapEffect } from '../src/core/simulation/trapEffects';

describe('trap effects', () => {
  it('fear reverses step', () => {
    const result = applyTrapEffect({ x: 1, y: 1, type: 'fear' }, 1, 'h');
    expect(result.reverseStep).toBe(true);
  });
});
