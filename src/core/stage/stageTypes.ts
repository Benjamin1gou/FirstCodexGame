export type TileType = 'floor' | 'wall' | 'start' | 'goal' | 'trap' | 'treasure' | 'monster';

export type GridPosition = { x: number; y: number };

export type StageDefinition = {
  id: string;
  name: string;
  chapterTitle: string;
  description: string;
  width: number;
  height: number;
  tiles: TileType[][];
  startPosition: GridPosition;
  goalPosition: GridPosition;
  heroId: string;
  trapLimit: number;
  initialTraps: GridPosition[];
  tutorialHint: string;
  narrativeId: string;
};

export type TrapDefinition = {
  id: string;
  name: string;
  damage: number;
  cost: number;
  description: string;
};
