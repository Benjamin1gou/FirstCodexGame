import { Scene } from 'phaser';
import { ASSET_KEYS, type HeroAssetKey } from '../assets/assetKeys';
import { BOARD_OFFSET, GAME_HEIGHT, GAME_WIDTH, SCENES, TILE_SIZE, TRAPS, TURN_INTERVAL_MS } from '../config/gameConfig';
import { decideHeroAction } from '../core/ai/heroDecisionEngine';
import { getOpeningDialogue } from '../core/narrative/dialogueSelector';
import { resolveEnding } from '../core/narrative/endingResolver';
import { canPlaceTrap } from '../core/rules/placementRules';
import { evaluateStageRank, type StageRank } from '../core/rules/rankEvaluator';
import { judgeStageStatus } from '../core/rules/victoryJudge';
import { predictRoute, type RoutePrediction } from '../core/simulation/predictRoute';
import { applyTrapEffect } from '../core/simulation/trapEffects';
import type { GamePhase, GameSimulationState } from '../core/simulation/simulationTypes';
import { getStageCount, loadStageByIndex } from '../core/stage/stageLoader';
import type { GridPosition, PlacedTrap, StageDefinition, TrapType } from '../core/stage/stageTypes';
import { HEROES } from '../data/heroes/heroes';
import { createLog } from '../systems/LogSystem';
import { getTileAssetKey } from './gameSceneTypes';

type GameSceneData = { stageIndex: number; totalTrapCost: number; clearedStages: number };
const HERO_ASSET_BY_ID: Record<string, HeroAssetKey> = { adel: ASSET_KEYS.heroes.adel, mio: ASSET_KEYS.heroes.mio, serena: ASSET_KEYS.heroes.serena };

export class GameScene extends Scene {
  constructor() {
    super(SCENES.game);
  }

  private state!: GameSimulationState; private stageIndex = 0; private totalTrapCost = 0; private clearedStages = 0; private selectedTrap: TrapType = 'spike';
  private heroSprite!: Phaser.GameObjects.Image; private logsText!: Phaser.GameObjects.Text; private hpText!: Phaser.GameObjects.Text; private modeText!: Phaser.GameObjects.Text; private infoText!: Phaser.GameObjects.Text; private predictionText!: Phaser.GameObjects.Text;
  private trapButtons: Record<TrapType, Phaser.GameObjects.Text> = { spike: null as unknown as Phaser.GameObjects.Text, slime: null as unknown as Phaser.GameObjects.Text, decoy: null as unknown as Phaser.GameObjects.Text };
  private trapSprites: Phaser.GameObjects.GameObject[] = []; private predictionMarkers: Phaser.GameObjects.GameObject[] = []; private placementHistory: PlacedTrap[] = []; private latestRank: StageRank | null = null;
  create(data: GameSceneData): void {
    this.stageIndex = data.stageIndex ?? 0; this.totalTrapCost = data.totalTrapCost ?? 0; this.clearedStages = data.clearedStages ?? 0;
    const stage = loadStageByIndex(this.stageIndex); const heroDef = HEROES.find((hero) => hero.id === stage.heroId); if (!heroDef) throw new Error(`Hero definition not found: ${stage.heroId}`);
    this.state = { stageId: stage.id, hero: { heroId: heroDef.id, name: heroDef.name, hp: heroDef.maxHp, maxHp: heroDef.maxHp, position: { ...stage.startPosition }, traits: heroDef.traits, memory: { seenTraps: [] }, currentTarget: stage.goalPosition, status: 'alive', skipTurns: 0 }, placedTraps: [...stage.initialTraps], turn: 0, status: 'playing', phase: 'planning', logs: [createLog('phase_changed', 0, { phase: 'PLANNING' })], score: 0, usedTrapCost: 0 };
    this.renderBoard(stage); this.renderUi(stage, heroDef.name); this.refreshPredictions(stage);
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.handleTrapPlacement(pointer, stage));
    this.input.keyboard?.on('keydown-R', () => this.scene.restart(data)); this.input.keyboard?.on('keydown-ENTER', () => this.startRunning()); this.input.keyboard?.on('keydown-SPACE', () => this.startRunning()); this.input.keyboard?.on('keydown-BACKSPACE', () => this.undoLastPlacement(stage));
    this.time.addEvent({ delay: TURN_INTERVAL_MS, loop: true, callback: () => this.stepSimulation(stage) }); this.updateUi(stage);
  }
  private startRunning(): void { if (this.state.phase !== 'planning') return; this.state = { ...this.state, phase: 'running', logs: [...this.state.logs, createLog('phase_changed', this.state.turn, { phase: 'RUNNING' })] }; }
  private renderBoard(stage: StageDefinition): void { for (let y = 0; y < stage.height; y += 1) for (let x = 0; x < stage.width; x += 1) this.add.image(BOARD_OFFSET.x + x * TILE_SIZE, BOARD_OFFSET.y + y * TILE_SIZE, getTileAssetKey(stage.tiles[y][x])).setOrigin(0).setDisplaySize(TILE_SIZE, TILE_SIZE); this.heroSprite = this.add.image(0, 0, HERO_ASSET_BY_ID[stage.heroId] ?? ASSET_KEYS.heroes.adel).setOrigin(0.5).setDisplaySize(TILE_SIZE * 0.82, TILE_SIZE * 0.82).setPosition(BOARD_OFFSET.x + stage.startPosition.x * TILE_SIZE + TILE_SIZE / 2, BOARD_OFFSET.y + stage.startPosition.y * TILE_SIZE + TILE_SIZE / 2); }
  private renderUi(stage: StageDefinition, heroName: string): void {
    const narrative = getOpeningDialogue(stage.id);
    this.add.image(16, 8, ASSET_KEYS.ui.panel).setOrigin(0).setDisplaySize(GAME_WIDTH - 32, 190); this.add.image(16, GAME_HEIGHT - 220, ASSET_KEYS.ui.panel).setOrigin(0).setDisplaySize(GAME_WIDTH - 32, 204);
    this.add.text(30, 16, `${stage.chapterTitle} ${stage.name}`, { fontSize: '24px' }); this.add.text(30, 48, `${heroName} HP`, { fontSize: '20px' }); this.hpText = this.add.text(160, 48, '', { fontSize: '20px' }); this.modeText = this.add.text(30, 74, '', { fontSize: '16px' });
    this.infoText = this.add.text(30, 96, '罠カード: [1]トゲ [2]スライム [3]デコイ / Backspace:1手戻し', { fontSize: '16px' }); this.predictionText = this.add.text(30, 120, '', { fontSize: '16px' });
    this.add.text(30, 144, narrative.openingNarration, { fontSize: '15px', wordWrap: { width: GAME_WIDTH - 60 } }); this.logsText = this.add.text(30, GAME_HEIGHT - 208, '', { fontSize: '14px', wordWrap: { width: 620 } });

    // スマホでもタップだけで進行できるように、操作ボタンを右側に配置する。
    this.trapButtons.spike = this.createTextButton(700, 30, 'トゲ罠', () => this.selectTrap('spike'));
    this.trapButtons.slime = this.createTextButton(700, 80, 'スライム罠', () => this.selectTrap('slime'));
    this.trapButtons.decoy = this.createTextButton(700, 130, 'デコイ罠', () => this.selectTrap('decoy'));
    this.createTextButton(840, 30, '実行', () => this.startRunning());
    this.createTextButton(840, 80, '1手戻し', () => this.undoLastPlacement(stage));
    this.createTextButton(840, 130, 'リスタート', () => this.scene.restart({ stageIndex: this.stageIndex, totalTrapCost: this.totalTrapCost, clearedStages: this.clearedStages }));

    this.input.keyboard?.on('keydown-ONE', () => this.selectTrap('spike')); this.input.keyboard?.on('keydown-TWO', () => this.selectTrap('slime')); this.input.keyboard?.on('keydown-THREE', () => this.selectTrap('decoy'));
  }
  private selectTrap(trap: TrapType): void { if (this.state.phase !== 'planning') return; this.selectedTrap = trap; this.state = { ...this.state, logs: [...this.state.logs, createLog('trap_selected', this.state.turn, { trapName: TRAPS[trap].name })] }; this.updateUi(loadStageByIndex(this.stageIndex)); }
  private handleTrapPlacement(pointer: Phaser.Input.Pointer, stage: StageDefinition): void {
    const tileX = Math.floor((pointer.x - BOARD_OFFSET.x) / TILE_SIZE); const tileY = Math.floor((pointer.y - BOARD_OFFSET.y) / TILE_SIZE);
    // UIタップ時の誤配置を防ぐため、盤面範囲外は即時に無視する。
    if (tileX < 0 || tileY < 0 || tileX >= stage.width || tileY >= stage.height) return;
    const result = canPlaceTrap(this.state.phase, stage, { x: tileX, y: tileY }, this.state.hero.position, this.state.placedTraps, this.state.placedTraps.length, this.state.usedTrapCost, TRAPS[this.selectedTrap].cost);
    if (!result.ok) { this.state = { ...this.state, logs: [...this.state.logs, createLog('placement_denied', this.state.turn, { reason: result.reason })] }; this.updateUi(stage); return; }
    const placedTrap: PlacedTrap = { x: tileX, y: tileY, type: this.selectedTrap }; this.placementHistory = [...this.placementHistory, placedTrap];
    this.state = { ...this.state, placedTraps: [...this.state.placedTraps, placedTrap], usedTrapCost: this.state.usedTrapCost + TRAPS[this.selectedTrap].cost, logs: [...this.state.logs, createLog('trap_placed', this.state.turn, { trapName: TRAPS[this.selectedTrap].name })] };
    const sprite = this.add.image(BOARD_OFFSET.x + tileX * TILE_SIZE, BOARD_OFFSET.y + tileY * TILE_SIZE, ASSET_KEYS.tiles.trap).setOrigin(0).setDisplaySize(TILE_SIZE, TILE_SIZE); this.trapSprites.push(sprite);
    this.refreshPredictions(stage); this.updateUi(stage);
  }
  private undoLastPlacement(stage: StageDefinition): void { if (this.state.phase !== 'planning') return; const last = this.placementHistory[this.placementHistory.length - 1]; if (!last) return; this.placementHistory = this.placementHistory.slice(0, -1); const trapCost = TRAPS[last.type].cost;
    this.state = { ...this.state, placedTraps: this.state.placedTraps.filter((t, i) => i !== this.state.placedTraps.length - 1), usedTrapCost: Math.max(0, this.state.usedTrapCost - trapCost), logs: [...this.state.logs, createLog('trap_removed', this.state.turn, { trapName: TRAPS[last.type].name })] };
    const sprite = this.trapSprites.pop(); sprite?.destroy(); this.refreshPredictions(stage); this.updateUi(stage);
  }
  private refreshPredictions(stage: StageDefinition): void { const predicted: RoutePrediction = predictRoute(this.state.hero, stage, this.state.placedTraps, 20); this.predictionMarkers.forEach((m) => m.destroy()); this.predictionMarkers = predicted.positions.map((p) => this.add.circle(BOARD_OFFSET.x + p.x * TILE_SIZE + TILE_SIZE / 2, BOARD_OFFSET.y + p.y * TILE_SIZE + TILE_SIZE / 2, 4, 0x99ff99, 0.6)); this.predictionText.setText(predicted.summary); this.state = { ...this.state, logs: [...this.state.logs, createLog('prediction_updated', this.state.turn)] }; }
  private stepSimulation(stage: StageDefinition): void {
    if (this.state.status !== 'playing' || this.state.phase !== 'running') return;
    if (this.state.hero.skipTurns > 0) { this.state = { ...this.state, turn: this.state.turn + 1, hero: { ...this.state.hero, skipTurns: this.state.hero.skipTurns - 1 }, logs: [...this.state.logs, createLog('hero_slowed', this.state.turn + 1, { heroName: this.state.hero.name })] }; this.updateUi(stage); return; }
    const decision = decideHeroAction(this.state.hero, stage.tiles, stage.goalPosition, this.state.placedTraps, stage.chests);
    const steppedTrap = this.state.placedTraps.find((trap) => trap.x === decision.nextPosition.x && trap.y === decision.nextPosition.y);
    const effect = applyTrapEffect(steppedTrap, this.state.turn + 1, this.state.hero.name);
    const seenTraps = steppedTrap && !this.state.hero.memory.seenTraps.some((p) => p.x === steppedTrap.x && p.y === steppedTrap.y) ? [...this.state.hero.memory.seenTraps, { x: steppedTrap.x, y: steppedTrap.y }] : this.state.hero.memory.seenTraps;
    let nextState: GameSimulationState = { ...this.state, turn: this.state.turn + 1, hero: { ...this.state.hero, position: decision.nextPosition as GridPosition, hp: this.state.hero.hp + effect.hpDelta, skipTurns: effect.skipTurns, memory: { ...this.state.hero.memory, seenTraps } }, logs: [...this.state.logs, createLog('hero_reason', this.state.turn + 1, { reason: decision.reason }), ...effect.logs] };
    const judgedStatus = judgeStageStatus(nextState, stage.goalPosition); nextState = { ...nextState, status: judgedStatus, phase: judgedStatus === 'playing' ? 'running' : (judgedStatus as GamePhase) };
    this.state = nextState; this.heroSprite.setPosition(BOARD_OFFSET.x + decision.nextPosition.x * TILE_SIZE + TILE_SIZE / 2, BOARD_OFFSET.y + decision.nextPosition.y * TILE_SIZE + TILE_SIZE / 2); this.updateUi(stage);
    if (judgedStatus !== 'playing') this.finishStage(judgedStatus);
  }
  private finishStage(status: 'cleared' | 'failed'): void { if (status === 'cleared') { this.latestRank = evaluateStageRank({ usedCost: this.state.usedTrapCost, trapCount: this.state.placedTraps.length, turnCount: this.state.turn, remainingHp: Math.max(0, this.state.hero.hp), maxHp: this.state.hero.maxHp }); this.state = { ...this.state, logs: [...this.state.logs, createLog('rank_shown', this.state.turn, { rank: this.latestRank })] }; }
    if (status === 'failed') { const ending = resolveEnding(false, this.totalTrapCost + this.state.usedTrapCost); this.scene.start(SCENES.gameOver, { win: false, text: ending.text, stageIndex: this.stageIndex }); return; }
    const nextIndex = this.stageIndex + 1; const totalUsedCost = this.totalTrapCost + this.state.usedTrapCost;
    if (nextIndex >= getStageCount()) { const ending = resolveEnding(true, totalUsedCost); this.scene.start(SCENES.gameOver, { win: true, text: `${ending.text}\nRANK:${this.latestRank ?? 'B'}`, stageIndex: this.stageIndex }); return; }
    this.scene.start(SCENES.stageSelect, { index: nextIndex, totalTrapCost: totalUsedCost, clearedStages: this.clearedStages + 1 }); }

  // 画面内ボタンを共通化し、タップ時に盤面クリックへ伝播しないようにする。
  private createTextButton(x: number, y: number, label: string, onClick: () => void): Phaser.GameObjects.Text {
    const button = this.add.text(x, y, label, { fontSize: '18px', color: '#ffffff', backgroundColor: '#3a4050', padding: { x: 12, y: 8 } });
    button.setInteractive({ useHandCursor: true });
    button.on('pointerdown', (pointer: Phaser.Input.Pointer) => { pointer.event.stopPropagation(); onClick(); });
    return button;
  }

  // 選択中の罠を色で表示し、スマホ操作でも現在状態を分かりやすくする。
  private updateTrapButtonState(): void {
    const trapEntries: TrapType[] = ['spike', 'slime', 'decoy'];
    trapEntries.forEach((trap) => {
      const button = this.trapButtons[trap];
      if (!button) return;
      const selected = trap === this.selectedTrap;
      button.setBackgroundColor(selected ? '#5b7cff' : '#3a4050');
      button.setAlpha(this.state.phase === 'planning' ? 1 : 0.6);
    });
  }

  private updateUi(stage: StageDefinition): void { this.hpText.setText(`${this.state.hero.hp}/${this.state.hero.maxHp}  罠:${this.state.placedTraps.length}/${stage.trapLimit}  Cost:${this.state.usedTrapCost}/${stage.trapLimit}`); this.modeText.setText(this.state.phase === 'planning' ? `PHASE: PLANNING / 選択中:${TRAPS[this.selectedTrap].name}` : 'PHASE: RUNNING'); this.logsText.setText(this.state.logs.slice(-8).map((log) => `[${log.turn}] ${log.text}`).join('\n')); this.updateTrapButtonState(); }
}
