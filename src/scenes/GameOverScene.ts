import { Scene } from 'phaser';
import { SCENES } from '../config/gameConfig';
import { AudioManager } from '../systems/AudioManager';
import { createMuteButton } from '../systems/AudioUi';
import { GB_COLORS, GB_UI } from '../ui/gbTheme';
import { createTextButton } from '../ui/TextButton';

export class GameOverScene extends Scene {
  constructor() { super(SCENES.gameOver); }

  create(data: { win: boolean; text: string }): void {
    AudioManager.bindGlobalUnlock(this);
    createMuteButton(this);
    void AudioManager.playResultBgm(data.win).catch(() => undefined);
    this.add.rectangle(180, 320, 340, 600, Phaser.Display.Color.HexStringToColor(GB_COLORS.lightest).color).setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(GB_COLORS.darkest).color);
    this.add.text(180, 90, data.win ? '勝利' : '敗北', { fontSize: '44px', color: GB_COLORS.darkest, fontFamily: GB_UI.fontFamily }).setOrigin(0.5);
    this.add.text(24, 170, data.text, { fontSize: '18px', color: GB_COLORS.darkest, fontFamily: GB_UI.fontFamily, wordWrap: { width: 312 } });
    this.add.text(180, 520, 'R: タイトルへ', { fontSize: '16px', color: GB_COLORS.dark, fontFamily: GB_UI.fontFamily }).setOrigin(0.5);
    createTextButton(this, { x: 180, y: 560, label: 'タイトルへ戻る', width: 220, height: 44, onClick: () => this.scene.start(SCENES.title) });
    this.input.keyboard?.once('keydown-R', () => this.scene.start(SCENES.title));
  }
}
