import * as Phaser from 'phaser';
import { preloadAssets } from '../assets/preloadAssets';
import { GAME_HEIGHT, GAME_WIDTH, SCENES } from '../config/gameConfig';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SCENES.preload);
  }

  preload(): void {
    const loadingText = this.add.text(GAME_WIDTH / 2 - 100, GAME_HEIGHT / 2 - 20, 'Loading assets...', { fontSize: '24px' });
    const errorText = this.add
      .text(GAME_WIDTH / 2 - 160, GAME_HEIGHT / 2 + 20, '', { fontSize: '14px', color: '#ff6b6b', wordWrap: { width: 320 } })
      .setVisible(false);
    let hasLoadError = false;

    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      hasLoadError = true;
      errorText.setText(`Asset load failed: ${file.key}`);
      errorText.setVisible(true);
    });

    this.load.once('complete', () => {
      if (!hasLoadError) {
        loadingText.setText('Assets loaded');
      }
    });

    preloadAssets(this);
  }

  create(): void {
    try {
      this.scene.start(SCENES.title);
    } catch {
      this.add
        .text(GAME_WIDTH / 2 - 160, GAME_HEIGHT / 2 + 50, 'Scene transition failed: reload page.', {
          fontSize: '14px',
          color: '#ff6b6b',
          wordWrap: { width: 320 }
        })
        .setVisible(true);
    }
  }
}
