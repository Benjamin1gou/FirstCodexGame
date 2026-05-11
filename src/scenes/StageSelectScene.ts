import * as Phaser from 'phaser';
import { SCENES } from '../config/gameConfig';
import { STAGES } from '../core/stage/stageRepository';
import { AudioManager } from '../systems/AudioManager';
import { createMuteButton } from '../systems/AudioUi';
import { GB_COLORS, GB_UI } from '../ui/gbTheme';
import { createTextButton } from '../ui/TextButton';

type StageSelectData = { index?: number; totalTrapCost?: number; clearedStages?: number; tutorialMode?: boolean };

export class StageSelectScene extends Phaser.Scene {
  constructor() { super(SCENES.stageSelect); }

  create(data: StageSelectData = {}): void {
    AudioManager.bindGlobalUnlock(this);
    createMuteButton(this);
    void AudioManager.playTitleBgm().catch(() => undefined);
    let cur = data.index ?? 0;

    this.add.rectangle(180, 320, 340, 600, Phaser.Display.Color.HexStringToColor(GB_COLORS.lightest).color).setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(GB_COLORS.darkest).color);
    this.add.text(180, 48, 'ステージ選択', { fontSize: '24px', color: GB_COLORS.darkest, fontFamily: GB_UI.fontFamily }).setOrigin(0.5, 0);
    const stageTexts = STAGES.map((s, i) => this.add.text(36, 92 + i * 34, `${i + 1}. ${s.name}`, { fontSize: '16px', color: i === cur ? GB_COLORS.lightest : GB_COLORS.darkest, backgroundColor: i === cur ? GB_COLORS.darkest : undefined, fontFamily: GB_UI.fontFamily, padding: { x: 4, y: 2 } }));

    const update = () => stageTexts.forEach((t, i) => { t.setBackgroundColor(i === cur ? GB_COLORS.darkest : undefined); t.setColor(i === cur ? GB_COLORS.lightest : GB_COLORS.darkest); });
    const movePrev = () => { cur = Math.max(0, cur - 1); update(); };
    const moveNext = () => { cur = Math.min(STAGES.length - 1, cur + 1); update(); };
    const start = () => this.scene.start(SCENES.game, { stageIndex: cur, totalTrapCost: data.totalTrapCost ?? 0, clearedStages: data.clearedStages ?? 0, tutorialMode: data.tutorialMode ?? false });
    const back = () => this.scene.start(SCENES.title);

    createTextButton(this, { x: 100, y: 470, label: '前へ', width: 120, height: 40, onClick: movePrev });
    createTextButton(this, { x: 260, y: 470, label: '次へ', width: 120, height: 40, onClick: moveNext });
    createTextButton(this, { x: 100, y: 520, label: '開始', width: 120, height: 40, variant: 'primary', onClick: start });
    createTextButton(this, { x: 260, y: 520, label: 'タイトル', width: 120, height: 40, onClick: back });

    this.input.keyboard?.on('keydown-LEFT', movePrev);
    this.input.keyboard?.on('keydown-RIGHT', moveNext);
    this.input.keyboard?.on('keydown-ENTER', start);
    this.input.keyboard?.on('keydown-T', back);
  }
}
