import { Scene } from 'phaser';
import { preloadAssets } from '../assets/preloadAssets';
import { GAME_HEIGHT, GAME_WIDTH, SCENES } from '../config/gameConfig';

export class PreloadScene extends Scene {
  constructor() {
    super(SCENES.preload);
  }

  preload(): void {
    this.add.text(GAME_WIDTH / 2 - 100, GAME_HEIGHT / 2 - 20, 'Loading assets...', { fontSize: '24px' });
    preloadAssets(this);
  }

  create(): void {
    this.scene.start(SCENES.title);
  }
}
