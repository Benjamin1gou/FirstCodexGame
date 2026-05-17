import * as Phaser from 'phaser';
import { SCENES } from '../config/gameConfig';
import { mobileControls } from '../input/mobileControls';
import { AudioManager } from '../systems/AudioManager';
import { createMuteButton } from '../systems/AudioUi';
import { GB_COLORS, GB_UI } from '../ui/gbTheme';

export class TitleScene extends Phaser.Scene {
  constructor() { super(SCENES.title); }
  private tutorialMode = false;
  private started = false;
  private modeText?: Phaser.GameObjects.Text;

  create(): void {
    AudioManager.bindGlobalUnlock(this);
    createMuteButton(this);
    void AudioManager.playTitleBgm().catch(() => undefined);

    this.add.rectangle(180, 250, 340, 460, Phaser.Display.Color.HexStringToColor(GB_COLORS.lightest).color).setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(GB_COLORS.darkest).color);
    this.add.text(180, 120, '勇者誘導\nDUNGEON\nGB STYLE', { fontSize: '34px', align: 'center', fontFamily: GB_UI.fontFamily, color: GB_COLORS.darkest }).setOrigin(0.5);
    this.add.text(180, 250, 'A / START : START\nSELECT : MODE TOGGLE', { fontSize: '19px', align: 'center', fontFamily: GB_UI.fontFamily, color: GB_COLORS.dark }).setOrigin(0.5);
    this.modeText = this.add.text(180, 332, '', { fontSize: '20px', align: 'center', fontFamily: GB_UI.fontFamily, color: GB_COLORS.darkest }).setOrigin(0.5);
    this.renderModeText();
  }

  update(): void {
    if (mobileControls.consumePress('select')) {
      this.tutorialMode = !this.tutorialMode;
      this.renderModeText();
    }
    if (mobileControls.consumePress('a') || mobileControls.consumePress('start')) {
      this.startGame();
    }
    mobileControls.consumePress('b');
    mobileControls.consumePress('up');
    mobileControls.consumePress('down');
    mobileControls.consumePress('left');
    mobileControls.consumePress('right');
  }

  private renderModeText(): void {
    this.modeText?.setText(this.tutorialMode ? 'MODE: チュートリアル' : 'MODE: 通常プレイ');
  }

  private startGame(): void {
    if (this.started) return;
    this.started = true;
    void AudioManager.unlock().catch(() => undefined);
    this.scene.start(SCENES.stageSelect, { totalTrapCost: 0, clearedStages: 0, tutorialMode: this.tutorialMode });
  }
}
