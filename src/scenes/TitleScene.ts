import { Scene } from 'phaser';
import { SCENES } from '../config/gameConfig';

export class TitleScene extends Scene {
  constructor() {
    super(SCENES.title);
  }

  create(): void {
    this.add.text(120, 120, '勇者誘導ダンジョン', { fontSize: '52px', color: '#fff' });
    this.add.text(140, 220, '通常: クリック / タップで開始', { fontSize: '28px', color: '#ffeb3b' });
    this.add.text(140, 258, 'チュートリアル: Hキー / 下のボタン', { fontSize: '24px', color: '#b8ffb0' });
    // スマホ利用者向けに横画面推奨を表示する。
    this.add.text(140, 300, 'スマホでは横画面がおすすめです', { fontSize: '22px', color: '#b0d8ff' });

    this.createTextButton(140, 360, '通常プレイ', () => this.scene.start(SCENES.stageSelect, { totalTrapCost: 0, clearedStages: 0, tutorialMode: false }));
    this.createTextButton(340, 360, 'チュートリアル', () => this.scene.start(SCENES.stageSelect, { totalTrapCost: 0, clearedStages: 0, tutorialMode: true }));

    this.input.keyboard?.on('keydown-H', () => this.scene.start(SCENES.stageSelect, { totalTrapCost: 0, clearedStages: 0, tutorialMode: true }));
    this.input.once('pointerdown', () => this.scene.start(SCENES.stageSelect, { totalTrapCost: 0, clearedStages: 0, tutorialMode: false }));
  }

  private createTextButton(x: number, y: number, label: string, onClick: () => void): Phaser.GameObjects.Text {
    const button = this.add.text(x, y, label, { fontSize: '24px', color: '#ffffff', backgroundColor: '#3a4050', padding: { x: 14, y: 8 } });
    button.setInteractive({ useHandCursor: true });
    button.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      onClick();
    });
    return button;
  }
}
