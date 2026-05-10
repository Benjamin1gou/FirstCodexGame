import { describe, it, expect } from 'vitest';
import { STAGES } from '../src/core/stage/stageRepository';
import { validateStage } from '../src/core/stage/stageValidator';
import { HEROES } from '../src/data/heroes/heroes';

describe('stages', () => {
  it('has at least 8 stages', () => {
    expect(STAGES.length).toBeGreaterThanOrEqual(8);
  });

  it('all stages pass structural validation', () => {
    const errors = STAGES.flatMap((stage) => validateStage(stage, HEROES));
    expect(errors).toEqual([]);
  });
});
