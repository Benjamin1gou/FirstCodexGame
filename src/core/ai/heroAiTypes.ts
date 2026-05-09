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
  memory: { seenTraps: GridPosition[] };
  currentTarget: GridPosition | null;
  status: HeroStatus;
};

export type HeroDefinition = {
  id: string;
  name: string;
  title: string;
  maxHp: number;
  traits: HeroTraits;
  lines: string[];
};
