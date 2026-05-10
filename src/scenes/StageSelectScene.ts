import { Scene } from 'phaser';
import { SCENES } from '../config/gameConfig';
import { STAGES } from '../core/stage/stageRepository';
import { AudioManager } from '../systems/AudioManager';
import { createMuteButton } from '../systems/AudioUi';
import { createTextButton } from '../ui/TextButton';

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
    createTextButton(this, { x: 120, y: 480, label: '前へ', fontSize: '24px', padding: { x: 16, y: 10 }, onClick: movePrev });
    createTextButton(this, { x: 260, y: 480, label: '次へ', fontSize: '24px', padding: { x: 16, y: 10 }, onClick: moveNext });
    createTextButton(this, { x: 400, y: 480, label: '開始', fontSize: '24px', padding: { x: 16, y: 10 }, onClick: startStage });
    createTextButton(this, { x: 540, y: 480, label: 'タイトルへ', fontSize: '24px', padding: { x: 16, y: 10 }, onClick: backToTitle });

    // 既存キーボード操作は維持しつつ、同じ処理を呼ぶ。
    this.input.keyboard?.on('keydown-LEFT', movePrev);
    this.input.keyboard?.on('keydown-RIGHT', moveNext);
    this.input.keyboard?.on('keydown-ENTER', startStage);
    this.input.keyboard?.on('keydown-T', backToTitle);
  }

}
