import { Scene } from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, SCENES } from '../config/gameConfig';

export class GameOverScene extends Scene {
  constructor() { super(SCENES.gameOver); }
  create(data: { score?: number }) {
    const finalScore = data.score ?? 0;
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'background');
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'gameOverPanel').setScale(0.95);
    this.add.text(GAME_WIDTH / 2, 220, 'GAME OVER', { fontSize: '56px', color: '#ffffff' }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 290, `SCORE: ${finalScore}`, { fontSize: '34px', color: '#102040' }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 370, 'Press R to Restart / T for Title', { fontSize: '24px', color: '#223355' }).setOrigin(0.5);
    this.input.keyboard?.once('keydown-R', () => this.scene.start(SCENES.game, { score: 0 }));
    this.input.keyboard?.once('keydown-T', () => this.scene.start(SCENES.title));
  }
}
