import { Scene } from 'phaser';
import { SCENES } from '../config/gameConfig';
export class GameOverScene extends Scene { constructor(){super(SCENES.gameOver);} create(data:{win:boolean,text:string}){
this.add.text(100,120,data.win?'勝利':'敗北',{fontSize:'56px',color:data.win?'#8bc34a':'#ef5350'});
this.add.text(100,220,data.text,{fontSize:'22px',wordWrap:{width:760}});
this.add.text(100,500,'R: タイトルへ戻る',{fontSize:'24px'});
this.input.keyboard?.once('keydown-R',()=>this.scene.start(SCENES.title));
}}
