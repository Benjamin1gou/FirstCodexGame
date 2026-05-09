import { Scene } from 'phaser';
import { SCENES } from '../config/gameConfig';
import { STAGES } from '../core/stage/stageRepository';
export class StageSelectScene extends Scene { constructor(){super(SCENES.stageSelect);} create(data:{index?:number,totalTrapCost?:number,clearedStages?:number}={}){
 const index=data.index??0; this.add.text(80,80,'ステージ選択',{fontSize:'42px'});
 STAGES.forEach((s,i)=>this.add.text(120,160+i*60,`${i+1}. ${s.name}`,{fontSize:'28px',color:i===index?'#ffeb3b':'#fff'}));
 this.add.text(120,420,'ENTER:開始 / ←→:選択 / T:タイトル',{fontSize:'22px'});
 let cur=index;
 this.input.keyboard?.on('keydown-LEFT',()=>{cur=Math.max(0,cur-1);this.scene.restart({...data,index:cur});});
 this.input.keyboard?.on('keydown-RIGHT',()=>{cur=Math.min(STAGES.length-1,cur+1);this.scene.restart({...data,index:cur});});
 this.input.keyboard?.on('keydown-ENTER',()=>this.scene.start(SCENES.game,{ stageIndex:cur, totalTrapCost:data.totalTrapCost??0, clearedStages:data.clearedStages??0 }));
 this.input.keyboard?.on('keydown-T',()=>this.scene.start(SCENES.title));
 }}
