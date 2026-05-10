import type { Scene } from 'phaser';

export type TextButtonOptions = {
  x: number;
  y: number;
  label: string;
  fontSize?: string;
  padding?: { x: number; y: number };
  onClick: () => void;
};

export const createTextButton = (scene: Scene, options: TextButtonOptions): Phaser.GameObjects.Text => {
  const button = scene.add.text(options.x, options.y, options.label, {
    fontSize: options.fontSize ?? '18px',
    color: '#ffffff',
    backgroundColor: '#3a4050',
    padding: options.padding ?? { x: 12, y: 8 }
  });
  button.setInteractive({ useHandCursor: true });
  button.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
    pointer.event.stopPropagation();
    options.onClick();
  });
  return button;
};
