import * as Phaser from 'phaser';
import { SCENES } from '../config/gameConfig';
import { AudioManager } from '../systems/AudioManager';
import { createMuteButton } from '../systems/AudioUi';
import { GB_COLORS, GB_UI } from '../ui/gbTheme';
import { createTextButton } from '../ui/TextButton';

export class TitleScene extends Phaser.Scene {
  constructor() { super(SCENES.title); }

  create(): void {
    AudioManager.bindGlobalUnlock(this);
    createMuteButton(this);
    void AudioManager.playTitleBgm().catch(() => undefined);

    this.add.rectangle(180, 320, 340, 600, Phaser.Display.Color.HexStringToColor(GB_COLORS.lightest).color).setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(GB_COLORS.darkest).color);
    this.add.text(180, 150, '勇者誘導\nDUNGEON\nGB STYLE', { fontSize: '34px', align: 'center', fontFamily: GB_UI.fontFamily, color: GB_COLORS.darkest }).setOrigin(0.5);
    this.add.text(180, 280, 'TAP START', { fontSize: '24px', fontFamily: GB_UI.fontFamily, color: GB_COLORS.dark }).setOrigin(0.5);

    let started = false;
    const start = (tutorialMode: boolean) => {
      if (started) return;
      started = true;
      void AudioManager.unlock().catch(() => undefined);
      this.scene.start(SCENES.stageSelect, { totalTrapCost: 0, clearedStages: 0, tutorialMode });
    };

    createTextButton(this, { x: 180, y: 360, width: 220, height: 44, label: '通常プレイ', onClick: () => start(false) });
    createTextButton(this, { x: 180, y: 414, width: 220, height: 44, label: 'チュートリアル', onClick: () => start(true) });

    this.input.keyboard?.on('keydown-H', () => start(true));
    this.input.keyboard?.on('keydown-ENTER', () => start(false));
    this.input.keyboard?.on('keydown-Z', () => start(false));
    this.input.keyboard?.on('keydown-SPACE', () => start(false));
    this.input.keyboard?.on('keydown-ESC', () => start(false));
    this.input.once('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      start(false);
    });
  }
}
