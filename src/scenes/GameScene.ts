import { Scene } from 'phaser';
import { ASSET_KEYS, type HeroAssetKey } from '../assets/assetKeys';
import { BOARD_OFFSET, GAME_HEIGHT, GAME_WIDTH, SCENES, TILE_SIZE, TRAPS, TURN_INTERVAL_MS } from '../config/gameConfig';
import { decideHeroAction } from '../core/ai/heroDecisionEngine';
import { getOpeningDialogue } from '../core/narrative/dialogueSelector';
import { resolveEnding } from '../core/narrative/endingResolver';
import { judgeStageStatus } from '../core/rules/victoryJudge';
import type { GamePhase, GameSimulationState } from '../core/simulation/simulationTypes';
import { getStageCount, loadStageByIndex } from '../core/stage/stageLoader';
import type { GridPosition, StageDefinition, TileType } from '../core/stage/stageTypes';
import { HEROES } from '../data/heroes/heroes';
import { createLog } from '../systems/LogSystem';
import { getTileAssetKey, isTileInBounds } from './gameSceneTypes';

type GameSceneData = { stageIndex: number; totalTrapCost: number; clearedStages: number };
const HERO_ASSET_BY_ID: Record<string, HeroAssetKey> = { adel: ASSET_KEYS.heroes.adel, mio: ASSET_KEYS.heroes.mio, serena: ASSET_KEYS.heroes.serena };

export class GameScene extends Scene {
  private state!: GameSimulationState; private stageIndex = 0; private totalTrapCost = 0; private clearedStages = 0;
  private heroSprite!: Phaser.GameObjects.Image; private logsText!: Phaser.GameObjects.Text; private hpText!: Phaser.GameObjects.Text; private modeText!: Phaser.GameObjects.Text;
  constructor() { super(SCENES.game); }

  create(data: GameSceneData): void {
    this.stageIndex = data.stageIndex ?? 0; this.totalTrapCost = data.totalTrapCost ?? 0; this.clearedStages = data.clearedStages ?? 0;
    const stage = loadStageByIndex(this.stageIndex); const heroDef = HEROES.find((hero) => hero.id === stage.heroId); if (!heroDef) throw new Error(`Hero definition not found: ${stage.heroId}`);
    this.state = { stageId: stage.id, hero: { heroId: heroDef.id, name: heroDef.name, hp: heroDef.maxHp, maxHp: heroDef.maxHp, position: { ...stage.startPosition }, traits: heroDef.traits, memory: { seenTraps: [] }, currentTarget: stage.goalPosition, status: 'alive' }, placedTraps: [...stage.initialTraps], turn: 0, status: 'playing', phase: 'planning', logs: [createLog('phase_changed', 0, { phase: 'PLANNING' })], score: 0, usedTrapCost: 0 };
    this.renderBoard(stage); this.renderUi(stage, heroDef.name);
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.handleTrapPlacement(pointer, stage));
    this.input.keyboard?.on('keydown-R', () => this.scene.restart(data)); this.input.keyboard?.on('keydown-ENTER', () => this.startRunning()); this.input.keyboard?.on('keydown-SPACE', () => this.startRunning());
    this.time.addEvent({ delay: TURN_INTERVAL_MS, loop: true, callback: () => this.stepSimulation(stage) }); this.updateUi(stage);
  }

  private startRunning(): void { if (this.state.phase !== 'planning') return; this.state = { ...this.state, phase: 'running', logs: [...this.state.logs, createLog('phase_changed', this.state.turn, { phase: 'RUNNING' })] }; }

  private renderBoard(stage: StageDefinition): void {
    for (let y = 0; y < stage.height; y += 1) for (let x = 0; x < stage.width; x += 1) this.add.image(BOARD_OFFSET.x + x * TILE_SIZE, BOARD_OFFSET.y + y * TILE_SIZE, getTileAssetKey(stage.tiles[y][x])).setOrigin(0).setDisplaySize(TILE_SIZE, TILE_SIZE);
    stage.chests.forEach((chest) => this.add.text(BOARD_OFFSET.x + chest.x * TILE_SIZE + 18, BOARD_OFFSET.y + chest.y * TILE_SIZE + 16, '宝', { fontSize: '20px', color: '#ffd966' }));
    this.state.placedTraps.forEach((trap) => this.add.image(BOARD_OFFSET.x + trap.x * TILE_SIZE, BOARD_OFFSET.y + trap.y * TILE_SIZE, ASSET_KEYS.tiles.trap).setOrigin(0).setDisplaySize(TILE_SIZE, TILE_SIZE));
    this.heroSprite = this.add.image(0, 0, HERO_ASSET_BY_ID[stage.heroId] ?? ASSET_KEYS.heroes.adel).setOrigin(0.5).setDisplaySize(TILE_SIZE * 0.82, TILE_SIZE * 0.82).setPosition(BOARD_OFFSET.x + stage.startPosition.x * TILE_SIZE + TILE_SIZE / 2, BOARD_OFFSET.y + stage.startPosition.y * TILE_SIZE + TILE_SIZE / 2);
  }

  private renderUi(stage: StageDefinition, heroName: string): void {
    const narrative = getOpeningDialogue(stage.id);
    this.add.image(16, 8, ASSET_KEYS.ui.panel).setOrigin(0).setDisplaySize(GAME_WIDTH - 32, 140); this.add.image(16, GAME_HEIGHT - 196, ASSET_KEYS.ui.panel).setOrigin(0).setDisplaySize(GAME_WIDTH - 32, 180);
    this.add.text(30, 16, `${stage.chapterTitle} ${stage.name}`, { fontSize: '24px' }); this.add.text(30, 48, `${heroName} HP`, { fontSize: '20px' }); this.hpText = this.add.text(160, 48, '', { fontSize: '20px' }); this.modeText = this.add.text(30, 74, '', { fontSize: '16px' });
    this.add.text(30, 98, narrative.openingNarration, { fontSize: '16px', wordWrap: { width: GAME_WIDTH - 60 } }); this.logsText = this.add.text(30, GAME_HEIGHT - 184, '', { fontSize: '16px', wordWrap: { width: GAME_WIDTH - 70 } });
  }

  private handleTrapPlacement(pointer: Phaser.Input.Pointer, stage: StageDefinition): void {
    if (this.state.phase !== 'planning') return;
    const tileX = Math.floor((pointer.x - BOARD_OFFSET.x) / TILE_SIZE); const tileY = Math.floor((pointer.y - BOARD_OFFSET.y) / TILE_SIZE);
    if (!isTileInBounds(stage, tileX, tileY) || stage.tiles[tileY][tileX] !== 'floor' || this.state.placedTraps.length >= stage.trapLimit || this.state.placedTraps.some((trap) => trap.x === tileX && trap.y === tileY)) return;
    this.state = { ...this.state, placedTraps: [...this.state.placedTraps, { x: tileX, y: tileY, type: 'spike' }], usedTrapCost: this.state.usedTrapCost + TRAPS.spike.cost, logs: [...this.state.logs, createLog('trap_placed', this.state.turn)] };
    this.add.image(BOARD_OFFSET.x + tileX * TILE_SIZE, BOARD_OFFSET.y + tileY * TILE_SIZE, ASSET_KEYS.tiles.trap).setOrigin(0).setDisplaySize(TILE_SIZE, TILE_SIZE); this.updateUi(stage);
  }

  private stepSimulation(stage: StageDefinition): void {
    if (this.state.status !== 'playing' || this.state.phase !== 'running') return;
    const decision = decideHeroAction(this.state.hero, stage.tiles as TileType[][], stage.goalPosition, this.state.placedTraps, stage.chests);
    const steppedTrap = this.state.placedTraps.find((trap) => trap.x === decision.nextPosition.x && trap.y === decision.nextPosition.y);
    const hp = steppedTrap && steppedTrap.type === 'spike' ? this.state.hero.hp - TRAPS.spike.damage : this.state.hero.hp;
    const seenTraps = steppedTrap && !this.state.hero.memory.seenTraps.some((p) => p.x === steppedTrap.x && p.y === steppedTrap.y) ? [...this.state.hero.memory.seenTraps, { x: steppedTrap.x, y: steppedTrap.y }] : this.state.hero.memory.seenTraps;
    const logs = [...this.state.logs, createLog('hero_reason', this.state.turn + 1, { reason: decision.reason }), createLog('goal_selected', this.state.turn + 1, { heroName: this.state.hero.name })];
    const trapLogs = steppedTrap ? [createLog('trap_triggered', this.state.turn + 1, { heroName: this.state.hero.name }), createLog('hero_damaged', this.state.turn + 1, { heroName: this.state.hero.name, damage: TRAPS.spike.damage })] : [];
    let nextState: GameSimulationState = { ...this.state, turn: this.state.turn + 1, hero: { ...this.state.hero, position: decision.nextPosition as GridPosition, hp, memory: { ...this.state.hero.memory, seenTraps } }, logs: [...logs, ...trapLogs] };
    const judgedStatus = judgeStageStatus(nextState, stage.goalPosition); nextState = { ...nextState, status: judgedStatus, phase: judgedStatus === 'playing' ? 'running' : (judgedStatus as GamePhase) };
    this.state = nextState; this.heroSprite.setPosition(BOARD_OFFSET.x + decision.nextPosition.x * TILE_SIZE + TILE_SIZE / 2, BOARD_OFFSET.y + decision.nextPosition.y * TILE_SIZE + TILE_SIZE / 2); this.updateUi(stage);
    if (judgedStatus !== 'playing') this.finishStage(judgedStatus);
  }

  private finishStage(status: 'cleared' | 'failed'): void { if (status === 'failed') { const ending = resolveEnding(false, this.totalTrapCost + this.state.usedTrapCost); this.scene.start(SCENES.gameOver, { win: false, text: ending.text, stageIndex: this.stageIndex }); return; }
    const nextIndex = this.stageIndex + 1; const totalUsedCost = this.totalTrapCost + this.state.usedTrapCost;
    if (nextIndex >= getStageCount()) { const ending = resolveEnding(true, totalUsedCost); this.scene.start(SCENES.gameOver, { win: true, text: ending.text, stageIndex: this.stageIndex }); return; }
    this.scene.start(SCENES.stageSelect, { index: nextIndex, totalTrapCost: totalUsedCost, clearedStages: this.clearedStages + 1 }); }

  private updateUi(stage: StageDefinition): void {
    this.hpText.setText(`${this.state.hero.hp}/${this.state.hero.maxHp}  罠:${this.state.placedTraps.length}/${stage.trapLimit}  Cost:${this.state.usedTrapCost}`);
    const mode = this.state.phase === 'planning' ? 'MODE: PLANNING - 罠を配置して Enter/Space で実行' : 'MODE: RUNNING - 勇者行動中 / Rでリトライ';
    this.modeText.setText(mode);
    this.logsText.setText(this.state.logs.slice(-8).map((log) => `[${log.turn}] ${log.text}`).join('\n'));
  }
}
