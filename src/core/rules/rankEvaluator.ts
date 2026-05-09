export type StageRank = 'S' | 'A' | 'B' | 'C';

export type RankInput = {
  usedCost: number;
  trapCount: number;
  turnCount: number;
  remainingHp: number;
  maxHp: number;
};

export const evaluateStageRank = (input: RankInput): StageRank => {
  const hpRatio = input.remainingHp / Math.max(1, input.maxHp);
  let score = 100;
  score -= input.usedCost * 10;
  score -= input.trapCount * 5;
  score -= input.turnCount * 2;
  score -= hpRatio * 20;
  if (score >= 78) return 'S';
  if (score >= 60) return 'A';
  if (score >= 40) return 'B';
  return 'C';
};
