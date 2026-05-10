import type { TrapType } from '../../core/stage/stageTypes';
import { createTextButton } from '../../ui/TextButton';

export type TrapToolbarResult = Record<TrapType, Phaser.GameObjects.Text>;

const TRAP_BUTTONS: ReadonlyArray<{ trap: TrapType; label: string; y: number }> = [
  { trap: 'spike', label: 'トゲ罠', y: 30 },
  { trap: 'slime', label: 'スライム罠', y: 80 },
  { trap: 'decoy', label: 'デコイ罠', y: 130 },
  { trap: 'arrow', label: '矢雨罠', y: 180 },
  { trap: 'fear', label: '恐怖罠', y: 230 },
  { trap: 'pitfall', label: '落とし穴', y: 280 }
];

export const createTrapToolbar = (
  scene: Phaser.Scene,
  x: number,
  onSelect: (trap: TrapType) => void
): TrapToolbarResult => {
  const entries = TRAP_BUTTONS.map(({ trap, label, y }) => [trap, createTextButton(scene, { x, y, label, onClick: () => onSelect(trap) })] as const);
  return Object.fromEntries(entries) as TrapToolbarResult;
};

export const updateTrapToolbarState = (
  buttons: TrapToolbarResult,
  selectedTrap: TrapType,
  isPlanning: boolean
): void => {
  (Object.keys(buttons) as TrapType[]).forEach((trap) => {
    const button = buttons[trap];
    button.setBackgroundColor(trap === selectedTrap ? '#5b7cff' : '#3a4050');
    button.setAlpha(isPlanning ? 1 : 0.6);
  });
};
