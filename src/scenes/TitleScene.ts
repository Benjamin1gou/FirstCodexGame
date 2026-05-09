import { Scene } from 'phaser';
import { SCENES } from '../config/gameConfig';

export class TitleScene extends Scene {
  constructor() {
    super(SCENES.title);
  }

  create(): void {
    this.add.text(120, 120, '勇者誘導ダンジョン', { fontSize: '52px', color: '#fff' });
    this.add.text(140, 220, 'クリック / タップで開始', { fontSize: '28px', color: '#ffeb3b' });
    // スマホ利用者向けに横画面推奨を表示する。
    this.add.text(140, 270, 'スマホでは横画面がおすすめです', { fontSize: '22px', color: '#b0d8ff' });

    this.input.once('pointerdown', () => this.scene.start(SCENES.stageSelect, { totalTrapCost: 0, clearedStages: 0 }));
  }
}
