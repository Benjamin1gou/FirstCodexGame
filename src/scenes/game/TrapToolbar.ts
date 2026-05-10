import type { TrapType } from '../../core/stage/stageTypes';
import { createTextButton, type TextButtonInstance } from '../../ui/TextButton';

export type TrapToolbarResult = Record<TrapType, TextButtonInstance>;

const TRAP_BUTTONS: ReadonlyArray<{ trap: TrapType; label: string; row: number; col: number }> = [
  { trap: 'spike', label: 'トゲ', row: 0, col: 0 },
  { trap: 'slime', label: 'スライム', row: 0, col: 1 },
  { trap: 'decoy', label: 'デコイ', row: 1, col: 0 },
  { trap: 'arrow', label: '矢雨', row: 1, col: 1 },
  { trap: 'fear', label: '恐怖', row: 2, col: 0 },
  { trap: 'pitfall', label: '落とし穴', row: 2, col: 1 }
];

export const createTrapToolbar = (
  scene: Phaser.Scene,
  options: { x: number; y: number; buttonWidth: number; buttonHeight: number; gapX: number; gapY: number },
  onSelect: (trap: TrapType) => void
): TrapToolbarResult => {
  const entries = TRAP_BUTTONS.map(({ trap, label, row, col }) => {
    const button = createTextButton(scene, {
      x: options.x + col * (options.buttonWidth + options.gapX),
      y: options.y + row * (options.buttonHeight + options.gapY),
      label,
      width: options.buttonWidth,
      height: options.buttonHeight,
      onClick: () => onSelect(trap)
    });
    return [trap, button] as const;
  });
  return Object.fromEntries(entries) as TrapToolbarResult;
};

export const updateTrapToolbarState = (buttons: TrapToolbarResult, selectedTrap: TrapType, isPlanning: boolean): void => {
  (Object.keys(buttons) as TrapType[]).forEach((trap) => {
    buttons[trap].setState({ selected: trap === selectedTrap, disabled: !isPlanning });
  });
};
