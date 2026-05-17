import * as Phaser from 'phaser';
import { SCENES } from '../config/gameConfig';
import { mobileControls } from '../input/mobileControls';
import { STAGES } from '../core/stage/stageRepository';
import { AudioManager } from '../systems/AudioManager';
import { createMuteButton } from '../systems/AudioUi';
import { GB_COLORS, GB_UI } from '../ui/gbTheme';

type StageSelectData = { index?: number; totalTrapCost?: number; clearedStages?: number; tutorialMode?: boolean };

export class StageSelectScene extends Phaser.Scene {
  constructor() { super(SCENES.stageSelect); }

  private selectedIndex = 0;
  private stageTexts: Phaser.GameObjects.Text[] = [];
  private data: StageSelectData = {};

  create(data: StageSelectData = {}): void {
    AudioManager.bindGlobalUnlock(this);
    createMuteButton(this);
    void AudioManager.playTitleBgm().catch(() => undefined);

    this.data = { ...data };
    this.selectedIndex = data.index ?? 0;

    this.cameras.main.setBackgroundColor(Phaser.Display.Color.HexStringToColor(GB_COLORS.light));

    this.add.text(180, 40, 'ステージ選択', { fontSize: '24px', color: GB_COLORS.darkest, fontFamily: GB_UI.fontFamily }).setOrigin(0.5, 0);
    this.stageTexts = STAGES.map((stage, index) => this.add.text(32, 90 + index * 34, `${index + 1}. ${stage.name}`, {
      fontSize: '16px',
      color: index === this.selectedIndex ? GB_COLORS.lightest : GB_COLORS.darkest,
      backgroundColor: index === this.selectedIndex ? GB_COLORS.darkest : undefined,
      fontFamily: GB_UI.fontFamily,
      padding: { x: 4, y: 2 }
    }));

    this.updateSelectionStyles();
  }

  update(): void {
    if (mobileControls.consumePress('up') || mobileControls.consumePress('left')) this.movePrev();
    if (mobileControls.consumePress('down') || mobileControls.consumePress('right')) this.moveNext();
    if (mobileControls.consumePress('a') || mobileControls.consumePress('start')) this.startStage();
    if (mobileControls.consumePress('b')) this.backToTitle();
    mobileControls.consumePress('select');
  }

  private movePrev(): void {
    this.selectedIndex = Math.max(0, this.selectedIndex - 1);
    this.updateSelectionStyles();
  }

  private moveNext(): void {
    this.selectedIndex = Math.min(STAGES.length - 1, this.selectedIndex + 1);
    this.updateSelectionStyles();
  }

  private updateSelectionStyles(): void {
    this.stageTexts.forEach((text, index) => {
      text.setBackgroundColor(index === this.selectedIndex ? GB_COLORS.darkest : undefined);
      text.setColor(index === this.selectedIndex ? GB_COLORS.lightest : GB_COLORS.darkest);
    });
  }

  private startStage(): void {
    this.scene.start(SCENES.game, {
      stageIndex: this.selectedIndex,
      totalTrapCost: this.data.totalTrapCost ?? 0,
      clearedStages: this.data.clearedStages ?? 0,
      tutorialMode: this.data.tutorialMode ?? false
    });
  }

  private backToTitle(): void {
    this.scene.start(SCENES.title);
  }
}
