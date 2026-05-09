import { Scene } from 'phaser';
import { SCENES } from '../config/gameConfig';

export class GameOverScene extends Scene {
  constructor() {
    super(SCENES.gameOver);
  }

  create(data: { win: boolean; text: string }): void {
    this.add.text(100, 120, data.win ? '勝利' : '敗北', { fontSize: '56px', color: data.win ? '#8bc34a' : '#ef5350' });
    this.add.text(100, 220, data.text, { fontSize: '22px', wordWrap: { width: 760 } });
    this.add.text(100, 500, 'R: タイトルへ戻る', { fontSize: '24px' });

    // スマホ操作でも復帰できるようにタップボタンを追加する。
    const backButton = this.add.text(100, 550, 'タイトルへ戻る', {
      fontSize: '28px',
      color: '#ffffff',
      backgroundColor: '#3a4050',
      padding: { x: 16, y: 10 }
    });
    backButton.setInteractive({ useHandCursor: true });
    backButton.on('pointerdown', () => this.scene.start(SCENES.title));

    this.input.keyboard?.once('keydown-R', () => this.scene.start(SCENES.title));
  }
}
