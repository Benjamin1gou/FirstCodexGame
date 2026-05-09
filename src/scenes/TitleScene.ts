import { Scene } from 'phaser';
import { SCENES } from '../config/gameConfig';
export class TitleScene extends Scene { constructor(){super(SCENES.title);} create(){
this.add.text(120,120,'勇者誘導ダンジョン',{fontSize:'52px',color:'#fff'});
this.add.text(140,220,'クリックで開始',{fontSize:'28px',color:'#ffeb3b'});
this.input.once('pointerdown',()=>this.scene.start(SCENES.stageSelect,{ totalTrapCost:0, clearedStages:0 }));
}}
