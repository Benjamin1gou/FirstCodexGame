import { Scene } from 'phaser';
import { SCENES } from '../config/gameConfig';
import { STAGES } from '../core/stage/stageRepository';
import { AudioManager } from '../systems/AudioManager';
import { createMuteButton } from '../systems/AudioUi';

type StageSelectData = {
  index?: number;
  totalTrapCost?: number;
  clearedStages?: number;
  tutorialMode?: boolean;
};

export class StageSelectScene extends Scene {
  constructor() {
    super(SCENES.stageSelect);
  }

  create(data: StageSelectData = {}): void {
    AudioManager.bindGlobalUnlock(this);
    createMuteButton(this);
    void AudioManager.playTitleBgm().catch(() => undefined);
    const index = data.index ?? 0;
    let cur = index;

    this.add.text(80, 80, 'ステージ選択', { fontSize: '42px' });
    const stageTexts = STAGES.map((s, i) => this.add.text(120, 160 + i * 60, `${i + 1}. ${s.name}`, { fontSize: '28px', color: i === cur ? '#ffeb3b' : '#fff' }));
    this.add.text(120, 420, 'ENTER:開始 / ←→:選択 / T:タイトル', { fontSize: '22px' });

    const updateStageList = (): void => {
      stageTexts.forEach((text, i) => text.setColor(i === cur ? '#ffeb3b' : '#fff'));
    };

    const movePrev = (): void => {
      cur = Math.max(0, cur - 1);
      updateStageList();
    };

    const moveNext = (): void => {
      cur = Math.min(STAGES.length - 1, cur + 1);
      updateStageList();
    };

    const startStage = (): void => {
      void AudioManager.unlock().catch(() => undefined);
      this.scene.start(SCENES.game, { stageIndex: cur, totalTrapCost: data.totalTrapCost ?? 0, clearedStages: data.clearedStages ?? 0, tutorialMode: data.tutorialMode ?? false });
    };

    const backToTitle = (): void => {
      this.scene.start(SCENES.title);
    };

    // スマホでも押しやすいように画面内ボタンを追加する。
    this.createTextButton(120, 480, '前へ', movePrev);
    this.createTextButton(260, 480, '次へ', moveNext);
    this.createTextButton(400, 480, '開始', startStage);
    this.createTextButton(540, 480, 'タイトルへ', backToTitle);

    // 既存キーボード操作は維持しつつ、同じ処理を呼ぶ。
    this.input.keyboard?.on('keydown-LEFT', movePrev);
    this.input.keyboard?.on('keydown-RIGHT', moveNext);
    this.input.keyboard?.on('keydown-ENTER', startStage);
    this.input.keyboard?.on('keydown-T', backToTitle);
  }

  private createTextButton(x: number, y: number, label: string, onClick: () => void): Phaser.GameObjects.Text {
    const button = this.add.text(x, y, label, {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#3a4050',
      padding: { x: 16, y: 10 }
    });
    button.setInteractive({ useHandCursor: true });
    button.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      onClick();
    });
    return button;
  }
}
