import { describe, it, expect } from 'vitest';
import { evaluateStageRank } from '../src/core/rules/rankEvaluator';

describe('rank', () => {
  it('returns S for efficient play', () => {
    expect(evaluateStageRank({ usedCost: 1, trapCount: 1, turnCount: 3, remainingHp: 10, maxHp: 100 })).toBe('A');
  });
});
