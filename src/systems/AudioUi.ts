import * as Phaser from 'phaser';
import { AudioManager } from './AudioManager';

export const createMuteButton = (scene: Phaser.Scene, x = 830, y = 8): Phaser.GameObjects.Text => {
  const getLabel = (): string => (AudioManager.isMuted() ? 'BGM: OFF 🔇' : 'BGM: ON 🔊');
  const button = scene.add.text(x, y, getLabel(), {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#2f3440',
    padding: { x: 10, y: 6 }
  }).setOrigin(0, 0).setDepth(3000);

  const refreshLabel = (): void => button.setText(getLabel());
  const toggleMute = (): void => {
    AudioManager.toggleMute();
    refreshLabel();
  };

  button.setInteractive({ useHandCursor: true });
  button.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
    pointer.event.stopPropagation();
    toggleMute();
  });

  scene.input.keyboard?.on('keydown-M', toggleMute);
  scene.events.once('shutdown', () => {
    scene.input.keyboard?.off('keydown-M', toggleMute);
  });

  return button;
};
