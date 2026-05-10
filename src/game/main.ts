import { AUTO, Game } from 'phaser';
import * as Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/gameConfig';
import { GameOverScene } from '../scenes/GameOverScene';
import { PreloadScene } from '../scenes/PreloadScene';
import { GameScene } from '../scenes/GameScene';
import { StageSelectScene } from '../scenes/StageSelectScene';
import { TitleScene } from '../scenes/TitleScene';

const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#0f380f',
  // スマホ縦画面を基準に、表示領域へフィットさせる。
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: 'game-container',
    width: GAME_WIDTH,
    height: GAME_HEIGHT
  },
  scene: [PreloadScene, TitleScene, StageSelectScene, GameScene, GameOverScene]
};

const StartGame = (parent: string) => new Game({ ...config, parent });

export default StartGame;
