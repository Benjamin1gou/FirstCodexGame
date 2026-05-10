import { describe, it, expect } from 'vitest';
import { STAGES } from '../src/core/stage/stageRepository';

describe('stages', () => {
  it('has at least 8 stages', () => {
    expect(STAGES.length).toBeGreaterThanOrEqual(8);
  });
});
