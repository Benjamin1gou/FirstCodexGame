import { Scene } from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, SCENES } from '../config/gameConfig';

export class TitleScene extends Scene {
  constructor() { super(SCENES.title); }
  preload() {
    this.load.image('background', 'assets/generated/background.svg');
    this.load.image('button', 'assets/generated/button.svg');
    this.load.image('titleLogo', 'assets/generated/title-logo.svg');
    this.load.image('player', 'assets/generated/player.svg');
    this.load.image('enemy', 'assets/generated/enemy.svg');
    this.load.image('item', 'assets/generated/item.svg');
    this.load.image('gameOverPanel', 'assets/generated/game-over-panel.svg');
  }
  create() {
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'background');
    this.add.image(GAME_WIDTH / 2, 150, 'titleLogo').setScale(0.8);
    const button = this.add.image(GAME_WIDTH / 2, 340, 'button').setInteractive({ useHandCursor: true });
    this.add.text(GAME_WIDTH / 2, 340, 'START', { fontSize: '36px', color: '#ffffff' }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 420, 'Move: Arrow Keys / Game Over: Hit enemy', { fontSize: '22px', color: '#1c2b4a' }).setOrigin(0.5);
    button.on('pointerdown', () => this.scene.start(SCENES.game, { score: 0 }));
    this.input.keyboard?.once('keydown-SPACE', () => this.scene.start(SCENES.game, { score: 0 }));
  }
}
