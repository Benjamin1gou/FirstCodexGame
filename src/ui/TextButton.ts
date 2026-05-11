import * as Phaser from 'phaser';
import { GB_COLORS, GB_UI } from './gbTheme';

export type TextButtonOptions = {
  x: number;
  y: number;
  label: string;
  fontSize?: string;
  padding?: { x: number; y: number };
  width?: number;
  height?: number;
  selected?: boolean;
  disabled?: boolean;
  variant?: 'normal' | 'primary' | 'danger';
  onClick: () => void;
};

export type TextButtonInstance = {
  root: Phaser.GameObjects.Container;
  setState: (next: { selected?: boolean; disabled?: boolean }) => void;
};

const getPalette = (variant: NonNullable<TextButtonOptions['variant']>) => {
  if (variant === 'primary') return { bg: GB_COLORS.darkest, fg: GB_COLORS.lightest };
  if (variant === 'danger') return { bg: GB_COLORS.dark, fg: GB_COLORS.white };
  return { bg: GB_COLORS.lightest, fg: GB_COLORS.darkest };
};

export const createTextButton = (scene: Phaser.Scene, options: TextButtonOptions): TextButtonInstance => {
  const variant = options.variant ?? 'normal';
  const basePadding = options.padding ?? { x: GB_UI.buttonPaddingX, y: GB_UI.buttonPaddingY };
  const label = scene.add.text(0, 0, options.label, {
    fontFamily: GB_UI.fontFamily,
    fontSize: options.fontSize ?? '16px',
    color: GB_COLORS.darkest
  }).setOrigin(0.5);

  const width = options.width ?? Math.max(80, label.width + basePadding.x * 2);
  const height = options.height ?? Math.max(34, label.height + basePadding.y * 2);
  const background = scene.add.rectangle(0, 0, width, height, 0x9bbc0f).setOrigin(0.5);
  background.setStrokeStyle(GB_UI.panelBorder, 0x0f380f);

  const root = scene.add.container(options.x, options.y, [background, label]);
  let currentDisabled = options.disabled ?? false;
  const setState = (next: { selected?: boolean; disabled?: boolean }): void => {
    const isSelected = next.selected ?? false;
    const isDisabled = next.disabled ?? false;
    currentDisabled = isDisabled;
    const palette = getPalette(variant);
    const bgColor = isSelected ? GB_COLORS.darkest : palette.bg;
    const fgColor = isSelected ? GB_COLORS.lightest : palette.fg;
    background.setFillStyle(Phaser.Display.Color.HexStringToColor(bgColor).color);
    label.setColor(fgColor);
    root.setAlpha(isDisabled ? 0.45 : 1);
    if (isDisabled) {
      root.disableInteractive();
    } else {
      root.setSize(width, height);
      root.setInteractive(new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height), Phaser.Geom.Rectangle.Contains);
    }
  };

  setState({ selected: options.selected, disabled: options.disabled });
  root.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
    pointer.event.stopPropagation();
    if (currentDisabled) return;
    if (root.alpha < 1) return;
    options.onClick();
  });

  return { root, setState };
};
