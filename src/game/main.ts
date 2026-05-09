import { AUTO, Game } from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/gameConfig';
import { GameOverScene } from '../scenes/GameOverScene';
import { GameScene } from '../scenes/GameScene';
import { StageSelectScene } from '../scenes/StageSelectScene';
import { TitleScene } from '../scenes/TitleScene';
const config: Phaser.Types.Core.GameConfig = { type: AUTO, width: GAME_WIDTH, height: GAME_HEIGHT, parent:'game-container', backgroundColor:'#202530', scene:[TitleScene,StageSelectScene,GameScene,GameOverScene] };
const StartGame = (parent: string) => new Game({ ...config, parent });
export default StartGame;
