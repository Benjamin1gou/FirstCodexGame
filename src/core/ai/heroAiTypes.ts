import type { GridPosition } from '../stage/stageTypes';

export type HeroTraits = {
  goalPressure: number;
  curiosity: number;
  riskAversion: number;
  trapMemory: number;
  treasureBias: number;
};

export type HeroStatus = 'alive' | 'defeated' | 'reached_goal';

export type HeroState = {
  heroId: string;
  name: string;
  hp: number;
  maxHp: number;
  position: GridPosition;
  traits: HeroTraits;
  memory: { seenTraps: GridPosition[]; lastPosition: GridPosition | null };
  currentTarget: GridPosition | null;
  status: HeroStatus;
  skipTurns: number;
};

export type HeroDefinition = {
  id: string;
  name: string;
  title: string;
  maxHp: number;
  traits: HeroTraits;
  lines: string[];
};

export type HeroDecision = {
  nextPosition: GridPosition;
  reason: string;
  scores: Array<{
    position: GridPosition;
    score: number;
    reasons: string[];
  }>;
};
