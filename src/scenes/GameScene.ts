import { Scene } from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, SCENES, TILE_SIZE, TRAP } from '../config/gameConfig';
import { loadStageByIndex, getStageCount } from '../core/stage/stageLoader';
import { HEROES } from '../data/heroes/heroes';
import type { GameSimulationState } from '../core/simulation/simulationTypes';
import { decideHeroNextPosition } from '../core/ai/heroDecisionEngine';
import { judgeStageStatus } from '../core/rules/victoryJudge';
import { createLog } from '../systems/LogSystem';
import { getOpeningDialogue } from '../core/narrative/dialogueSelector';
import { resolveEnding } from '../core/narrative/endingResolver';

export class GameScene extends Scene {
  private state!: GameSimulationState; private stageIndex = 0; private totalTrapCost = 0; private clearedStages = 0;
  private heroSprite!: Phaser.GameObjects.Rectangle; private tileLayer!: Phaser.GameObjects.Rectangle[]; private logsText!: Phaser.GameObjects.Text; private hpText!: Phaser.GameObjects.Text;
  constructor(){super(SCENES.game);} 
  create(data:{stageIndex:number,totalTrapCost:number,clearedStages:number}){
    this.stageIndex=data.stageIndex??0; this.totalTrapCost=data.totalTrapCost??0; this.clearedStages=data.clearedStages??0;
    const stage=loadStageByIndex(this.stageIndex); const heroDef=HEROES.find(h=>h.id===stage.heroId)!;
    this.state={ stageId:stage.id, hero:{ heroId:heroDef.id,name:heroDef.name,hp:heroDef.maxHp,maxHp:heroDef.maxHp,position:{...stage.startPosition},traits:heroDef.traits,memory:{seenTraps:[]},currentTarget:stage.goalPosition,status:'alive'}, placedTraps:[...stage.initialTraps], turn:0,status:'playing',logs:[createLog('goal_selected',0,{heroName:heroDef.name})],score:0,usedTrapCost:0 };
    this.renderBoard(stage);
    const n=getOpeningDialogue(stage.id);
    this.add.text(20,10,`${stage.chapterTitle} ${stage.name}`,{fontSize:'24px'});
    this.add.text(20,40,`${heroDef.name} HP`,{fontSize:'20px'}); this.hpText=this.add.text(140,40,'',{fontSize:'20px'});
    this.add.text(20,70,n?.openingNarration??'',{fontSize:'16px',wordWrap:{width:900}});
    this.add.text(20,100,n?.demonLordLines[0]??'',{fontSize:'16px',color:'#ffb3b3',wordWrap:{width:900}});
    this.logsText=this.add.text(20,470,'',{fontSize:'16px',wordWrap:{width:900}});
    this.input.on('pointerdown',(p:Phaser.Input.Pointer)=>this.tryPlaceTrap(p.x,p.y));
    this.input.keyboard?.on('keydown-R',()=>this.scene.restart(data));
    this.time.addEvent({delay:700,loop:true,callback:()=>this.stepSimulation(stage.goalPosition,stage.tiles)});
    this.updateUi();
  }
  private renderBoard(stage: ReturnType<typeof loadStageByIndex>){
    this.tileLayer=[]; const ox=20, oy=140; const colors:any={floor:0xdddddd,wall:0x444444,start:0x4caf50,goal:0x7b1fa2,trap:0xd32f2f,treasure:0xffc107,monster:0xff5722};
    for(let y=0;y<stage.height;y++) for(let x=0;x<stage.width;x++){ const t=stage.tiles[y][x]; const r=this.add.rectangle(ox+x*TILE_SIZE,oy+y*TILE_SIZE,TILE_SIZE-2,TILE_SIZE-2,colors[t]).setOrigin(0); this.tileLayer.push(r); }
    this.heroSprite=this.add.rectangle(ox+stage.startPosition.x*TILE_SIZE+8,oy+stage.startPosition.y*TILE_SIZE+8,TILE_SIZE-16,TILE_SIZE-16,0x2196f3).setOrigin(0);
  }
  private tryPlaceTrap(px:number,py:number){ const stage=loadStageByIndex(this.stageIndex); const x=Math.floor((px-20)/TILE_SIZE); const y=Math.floor((py-140)/TILE_SIZE); if(!stage.tiles[y]?.[x]||stage.tiles[y][x]!=='floor') return; if(this.state.placedTraps.length>=stage.trapLimit) return; if(this.state.placedTraps.some(t=>t.x===x&&t.y===y)) return; this.state={...this.state,placedTraps:[...this.state.placedTraps,{x,y}],usedTrapCost:this.state.usedTrapCost+TRAP.cost,logs:[...this.state.logs,createLog('trap_placed',this.state.turn)]}; this.add.rectangle(20+x*TILE_SIZE,140+y*TILE_SIZE,TILE_SIZE-2,TILE_SIZE-2,0xb71c1c).setOrigin(0); this.updateUi(); }
  private stepSimulation(goal:any,tiles:any){ if(this.state.status!=='playing') return; const next=decideHeroNextPosition(this.state.hero,tiles,goal); let hp=this.state.hero.hp; const steppedTrap=this.state.placedTraps.some(t=>t.x===next.x&&t.y===next.y); const logs=[...this.state.logs,createLog('goal_selected',this.state.turn+1,{heroName:this.state.hero.name})]; if(steppedTrap){ hp-=TRAP.damage; logs.push(createLog('trap_triggered',this.state.turn+1,{heroName:this.state.hero.name}),createLog('hero_damaged',this.state.turn+1,{heroName:this.state.hero.name,damage:TRAP.damage})); }
    let ns:GameSimulationState={...this.state,turn:this.state.turn+1,hero:{...this.state.hero,position:next,hp},logs};
    const judged=judgeStageStatus(ns,goal); ns={...ns,status:judged};
    if(judged==='cleared') ns={...ns,logs:[...ns.logs,createLog('hero_defeated',ns.turn,{heroName:ns.hero.name}),createLog('stage_cleared',ns.turn)]};
    if(judged==='failed') ns={...ns,logs:[...ns.logs,createLog('goal_reached',ns.turn,{heroName:ns.hero.name}),createLog('stage_failed',ns.turn)]};
    this.state=ns; this.updateUi();
    this.heroSprite.setPosition(20+next.x*TILE_SIZE+8,140+next.y*TILE_SIZE+8);
    if(judged!=='playing') this.finishStage(judged);
  }
  private finishStage(status:'cleared'|'failed'){
    if(status==='failed'){ const ending=resolveEnding(false,this.totalTrapCost+this.state.usedTrapCost); this.scene.start(SCENES.gameOver,{win:false,text:ending.text,stageIndex:this.stageIndex}); return; }
    const nextIndex=this.stageIndex+1; const total=this.totalTrapCost+this.state.usedTrapCost;
    if(nextIndex>=getStageCount()){ const ending=resolveEnding(true,total); this.scene.start(SCENES.gameOver,{win:true,text:ending.text,stageIndex:this.stageIndex}); return; }
    this.scene.start(SCENES.stageSelect,{index:nextIndex,totalTrapCost:total,clearedStages:this.clearedStages+1});
  }
  private updateUi(){ const stage=loadStageByIndex(this.stageIndex); this.hpText.setText(`${this.state.hero.hp}/${this.state.hero.maxHp}  罠:${this.state.placedTraps.length}/${stage.trapLimit}`); this.logsText.setText(this.state.logs.slice(-8).map(l=>`[${l.turn}] ${l.text}`).join('\n')); }
}
