export type TileType = 'floor' | 'wall' | 'start' | 'goal' | 'trap' | 'treasure' | 'monster' | 'chest';

export type GridPosition = { x: number; y: number };

export type TrapType = 'spike' | 'slime' | 'decoy' | 'arrow' | 'fear' | 'pitfall';

export type TrapDefinition = {
  id: TrapType;
  name: string;
  cost: number;
  damage: number;
  effect: 'damage' | 'slow' | 'attract' | 'ranged' | 'fear';
  description: string;
};

export type PlacedTrap = GridPosition & {
  type: TrapType;
  triggerCount?: number;
  maxTriggerCount?: number;
  remainingCooldown?: number;
  cooldownTurns?: number;
  destroyed?: boolean;
};

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
  costLimit?: number;
  initialMana?: number;
  maxMana?: number;
  initialTraps: PlacedTrap[];
  chests: GridPosition[];
  tutorialHint: string;
  narrativeId: string;
};
