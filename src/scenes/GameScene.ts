import { Scene } from 'phaser';
import { ASSET_KEYS } from '../assets/assetKeys';
import { GAME_HEIGHT, GAME_WIDTH, SCENES, TRAPS, TURN_INTERVAL_MS } from '../config/gameConfig';
import { decideHeroAction } from '../core/ai/heroDecisionEngine';
import { getOpeningDialogue } from '../core/narrative/dialogueSelector';
import { resolveEnding } from '../core/narrative/endingResolver';
import { canPlaceTrap, getEffectiveCostLimit } from '../core/rules/placementRules';
import { evaluateStageRank, type StageRank } from '../core/rules/rankEvaluator';
import { judgeStageStatus } from '../core/rules/victoryJudge';
import { predictRoute } from '../core/simulation/predictRoute';
import { applyTrapEffect } from '../core/simulation/trapEffects';
import type { GamePhase, GameSimulationState } from '../core/simulation/simulationTypes';
import { getStageCount, loadStageByIndex } from '../core/stage/stageLoader';
import type { GridPosition, PlacedTrap, StageDefinition, TrapType } from '../core/stage/stageTypes';
import { AudioManager } from '../systems/AudioManager';
import { createMuteButton } from '../systems/AudioUi';
import { createLog } from '../systems/LogSystem';
import { createTextButton } from '../ui/TextButton';
import { renderBoardTiles, renderTrapTile } from './game/BoardRenderer';
import { computeBoardLayout, GAME_SCENE_LAYOUT } from './game/GameSceneLayout';
import { createInitialSimulationState } from './game/GameSceneStateFactory';
import { createHeroSprite, updateHeroSpritePosition } from './game/HeroRenderer';
import { destroyGameObjects, renderPredictionMarkers } from './game/PredictionRenderer';
import { createTrapToolbar, updateTrapToolbarState } from './game/TrapToolbar';
import { destroyPlacementOverlay, renderPlacementOverlay } from './game/TrapPlacementOverlayRenderer';

type GameSceneData = { stageIndex: number; totalTrapCost: number; clearedStages: number; tutorialMode?: boolean };
export class GameScene extends Scene {
  constructor() { super(SCENES.game); }

  private state!: GameSimulationState;
  private stageIndex = 0;
  private totalTrapCost = 0;
  private clearedStages = 0;
  private selectedTrap: TrapType = 'spike';
  private heroSprite!: Phaser.GameObjects.Image;
  private logsText!: Phaser.GameObjects.Text;
  private hpText!: Phaser.GameObjects.Text;
  private modeText!: Phaser.GameObjects.Text;
  private predictionText!: Phaser.GameObjects.Text;
  private trapButtons = {} as Record<TrapType, Phaser.GameObjects.Text>;
  private trapSprites: Phaser.GameObjects.GameObject[] = [];
  private predictionMarkers: Phaser.GameObjects.GameObject[] = [];
  private placementOverlayObjects: Phaser.GameObjects.GameObject[] = [];
  private placementHistory: PlacedTrap[] = [];
  private latestRank: StageRank | null = null;
  private boardTileSize = 56;
  private boardOffset = { x: 20, y: 140 };
  private tutorialMode = false;
  private tutorialStepIndex = 0;
  private tutorialOverlay: Phaser.GameObjects.Rectangle | null = null;
  private tutorialText: Phaser.GameObjects.Text | null = null;

  private static readonly TUTORIAL_STEPS = [
    'チュートリアル 1/4\n罠カードを選んで、盤面をタップすると罠を配置できます。',
    'チュートリアル 2/4\n上部の予測ルート点を見て、勇者の進行先を確認しましょう。',
    'チュートリアル 3/4\n配置をやり直すときは Backspace または「1手戻し」を使います。',
    'チュートリアル 4/4\n準備ができたら ENTER または「実行」で進行開始です。'
  ] as const;

  create(data: GameSceneData): void {
    this.setupSceneEnvironment();
    const stage = this.setupState(data);

    this.setupBoard(stage);
    this.renderUi(stage);
    this.refreshPredictions(stage);
    this.registerInputs(stage, data);

    this.time.addEvent({ delay: TURN_INTERVAL_MS, loop: true, callback: () => this.stepSimulation(stage) });
    this.updateUi(stage);
    this.refreshPlacementOverlay(stage);
    if (this.tutorialMode) this.openTutorial();
  }

  private setupSceneEnvironment(): void {
    AudioManager.bindGlobalUnlock(this);
    createMuteButton(this);
    void AudioManager.playDungeonBgm().catch(() => undefined);
  }

  private setupState(data: GameSceneData): StageDefinition {
    this.stageIndex = data.stageIndex ?? 0;
    this.totalTrapCost = data.totalTrapCost ?? 0;
    this.clearedStages = data.clearedStages ?? 0;
    this.tutorialMode = data.tutorialMode ?? false;
    const stage = loadStageByIndex(this.stageIndex);
    const initial = createInitialSimulationState(stage);
    this.state = initial.state;
    return stage;
  }

  private setupBoard(stage: StageDefinition): void {
    const layout = computeBoardLayout(stage);
    this.boardTileSize = layout.tileSize;
    this.boardOffset = layout.boardOffset;
    renderBoardTiles(this, stage, this.boardTileSize, this.boardOffset);
    this.heroSprite = createHeroSprite(this, stage.heroId, stage.startPosition, this.boardTileSize, this.boardOffset);
  }

  private renderUi(stage: StageDefinition): void {
    const opening = getOpeningDialogue(stage.id);
    this.add.image(16, 8, ASSET_KEYS.ui.panel).setOrigin(0).setDisplaySize(GAME_WIDTH - 32, GAME_SCENE_LAYOUT.topPanelHeight - 12);
    this.add.image(16, GAME_HEIGHT - GAME_SCENE_LAYOUT.bottomPanelHeight, ASSET_KEYS.ui.panel).setOrigin(0).setDisplaySize(GAME_WIDTH - 32, GAME_SCENE_LAYOUT.bottomPanelHeight - 16);

    this.add.text(30, 16, `${stage.chapterTitle} ${stage.name}`, { fontSize: '24px' });
    this.add.text(30, 48, `${this.state.hero.name} HP`, { fontSize: '20px' });
    this.hpText = this.add.text(160, 48, '', { fontSize: '20px' });
    this.modeText = this.add.text(30, 74, '', { fontSize: '16px' });
    this.add.text(30, 96, '罠: [1]トゲ [2]スライム [3]デコイ [4]矢雨 [5]恐怖 [6]落とし穴 / Backspace:1手戻し', { fontSize: '16px' });
    this.predictionText = this.add.text(30, 118, '', { fontSize: '16px' });
    this.add.text(30, 140, opening.openingNarration, { fontSize: '15px', wordWrap: { width: Math.max(200, GAME_SCENE_LAYOUT.buttonColumnX - 48) } });
    this.logsText = this.add.text(30, GAME_HEIGHT - GAME_SCENE_LAYOUT.bottomPanelHeight + 14, '', { fontSize: '14px', wordWrap: { width: 620 } });

    this.trapButtons = createTrapToolbar(this, GAME_SCENE_LAYOUT.buttonColumnX, (trap) => this.selectTrap(trap));
    createTextButton(this, { x: GAME_SCENE_LAYOUT.actionButtonX, y: 30, label: '実行', onClick: () => this.startRunning() });
    createTextButton(this, { x: GAME_SCENE_LAYOUT.actionButtonX, y: 80, label: '1手戻し', onClick: () => this.undoLastPlacement(stage) });
    createTextButton(this, { x: GAME_SCENE_LAYOUT.actionButtonX, y: 130, label: 'リスタート', onClick: () => this.scene.restart({ stageIndex: this.stageIndex, totalTrapCost: this.totalTrapCost, clearedStages: this.clearedStages }) });
  }

  private registerInputs(stage: StageDefinition, data: GameSceneData): void {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.handleTrapPlacement(pointer, stage));
    this.input.keyboard?.on('keydown-R', () => this.scene.restart(data));
    this.input.keyboard?.on('keydown-ENTER', () => this.startRunning());
    this.input.keyboard?.on('keydown-SPACE', () => this.startRunning());
    this.input.keyboard?.on('keydown-BACKSPACE', () => this.undoLastPlacement(stage));
    this.input.keyboard?.on('keydown-H', () => this.openTutorial());
    this.input.keyboard?.on('keydown-ONE', () => this.selectTrap('spike'));
    this.input.keyboard?.on('keydown-TWO', () => this.selectTrap('slime'));
    this.input.keyboard?.on('keydown-THREE', () => this.selectTrap('decoy'));
    this.input.keyboard?.on('keydown-FOUR', () => this.selectTrap('arrow'));
    this.input.keyboard?.on('keydown-FIVE', () => this.selectTrap('fear'));
    this.input.keyboard?.on('keydown-SIX', () => this.selectTrap('pitfall'));
  }

  private startRunning(): void {
    void AudioManager.unlock().catch(() => undefined);
    if (this.state.phase !== 'planning') return;
    this.state = { ...this.state, phase: 'running', logs: [...this.state.logs, createLog('phase_changed', this.state.turn, { phase: 'RUNNING' })] };
    this.refreshPlacementOverlay(loadStageByIndex(this.stageIndex));
  }

  private selectTrap(trap: TrapType): void {
    if (this.state.phase !== 'planning') return;
    this.selectedTrap = trap;
    this.state = { ...this.state, logs: [...this.state.logs, createLog('trap_selected', this.state.turn, { trapName: TRAPS[trap].name })] };
    const stage = loadStageByIndex(this.stageIndex);
    this.updateUi(stage);
    this.refreshPlacementOverlay(stage);
  }

  private handleTrapPlacement(pointer: Phaser.Input.Pointer, stage: StageDefinition): void {
    const tileX = Math.floor((pointer.x - this.boardOffset.x) / this.boardTileSize);
    const tileY = Math.floor((pointer.y - this.boardOffset.y) / this.boardTileSize);
    if (tileX < 0 || tileY < 0 || tileX >= stage.width || tileY >= stage.height) return;

    const result = canPlaceTrap(this.state.phase, stage, { x: tileX, y: tileY }, this.state.hero.position, this.state.placedTraps, this.state.placedTraps.length, this.state.usedTrapCost, TRAPS[this.selectedTrap].cost);
    if (!result.ok) {
      this.state = { ...this.state, logs: [...this.state.logs, createLog('placement_denied', this.state.turn, { reason: result.reason })] };
      this.updateUi(stage);
      this.refreshPlacementOverlay(stage);
      return;
    }

    const placedTrap: PlacedTrap = { x: tileX, y: tileY, type: this.selectedTrap };
    this.placementHistory = [...this.placementHistory, placedTrap];
    this.state = {
      ...this.state,
      placedTraps: [...this.state.placedTraps, placedTrap],
      usedTrapCost: this.state.usedTrapCost + TRAPS[this.selectedTrap].cost,
      logs: [...this.state.logs, createLog('trap_placed', this.state.turn, { trapName: TRAPS[this.selectedTrap].name })]
    };
    this.trapSprites.push(renderTrapTile(this, tileX, tileY, this.boardTileSize, this.boardOffset));
    this.refreshPredictions(stage);
    this.updateUi(stage);
    this.refreshPlacementOverlay(stage);
  }

  private undoLastPlacement(stage: StageDefinition): void {
    if (this.state.phase !== 'planning') return;
    const last = this.placementHistory[this.placementHistory.length - 1];
    if (!last) return;

    this.placementHistory = this.placementHistory.slice(0, -1);
    this.state = {
      ...this.state,
      placedTraps: this.state.placedTraps.slice(0, -1),
      usedTrapCost: Math.max(0, this.state.usedTrapCost - TRAPS[last.type].cost),
      logs: [...this.state.logs, createLog('trap_removed', this.state.turn, { trapName: TRAPS[last.type].name })]
    };
    this.trapSprites.pop()?.destroy();
    this.refreshPredictions(stage);
    this.updateUi(stage);
    this.refreshPlacementOverlay(stage);
  }


  private refreshPlacementOverlay(stage: StageDefinition): void {
    destroyPlacementOverlay(this.placementOverlayObjects);
    this.placementOverlayObjects = renderPlacementOverlay(this, stage, this.state, this.selectedTrap, this.boardTileSize, this.boardOffset);
  }

  private refreshPredictions(stage: StageDefinition): void {
    const predicted = predictRoute(this.state.hero, stage, this.state.placedTraps, 20);
    destroyGameObjects(this.predictionMarkers);
    this.predictionMarkers = renderPredictionMarkers(this, predicted.positions, this.boardTileSize, this.boardOffset);
    this.predictionText.setText(predicted.summary);
    this.state = { ...this.state, logs: [...this.state.logs, createLog('prediction_updated', this.state.turn)] };
  }

  private stepSimulation(stage: StageDefinition): void {
    if (this.state.status !== 'playing' || this.state.phase !== 'running') return;
    if (this.state.hero.skipTurns > 0) {
      this.state = { ...this.state, turn: this.state.turn + 1, hero: { ...this.state.hero, skipTurns: this.state.hero.skipTurns - 1 }, logs: [...this.state.logs, createLog('hero_slowed', this.state.turn + 1, { heroName: this.state.hero.name })] };
      this.updateUi(stage);
      return;
    }

    const nextState = this.buildNextRunningState(stage);
    const judgedStatus = judgeStageStatus(nextState, stage.goalPosition);
    this.state = { ...nextState, status: judgedStatus, phase: judgedStatus === 'playing' ? 'running' : (judgedStatus as GamePhase) };
    updateHeroSpritePosition(this.heroSprite, this.state.hero.position, this.boardTileSize, this.boardOffset);
    this.updateUi(stage);
    if (judgedStatus !== 'playing') this.finishStage(judgedStatus);
  }

  private buildNextRunningState(stage: StageDefinition): GameSimulationState {
    const decision = decideHeroAction(this.state.hero, stage.tiles, stage.goalPosition, this.state.placedTraps, stage.chests);
    const steppedTrap = this.state.placedTraps.find((trap) => trap.x === decision.nextPosition.x && trap.y === decision.nextPosition.y);
    const effect = applyTrapEffect(steppedTrap, this.state.turn + 1, this.state.hero.name);
    const previousPosition = { ...this.state.hero.position };
    const nextPosition: GridPosition = effect.reverseStep ? previousPosition : decision.nextPosition;
    const seenTraps = steppedTrap && !this.state.hero.memory.seenTraps.some((p) => p.x === steppedTrap.x && p.y === steppedTrap.y)
      ? [...this.state.hero.memory.seenTraps, { x: steppedTrap.x, y: steppedTrap.y }]
      : this.state.hero.memory.seenTraps;

    return {
      ...this.state,
      turn: this.state.turn + 1,
      hero: {
        ...this.state.hero,
        position: nextPosition,
        hp: this.state.hero.hp + effect.hpDelta,
        skipTurns: effect.skipTurns,
        memory: { ...this.state.hero.memory, seenTraps, lastPosition: previousPosition }
      },
      logs: [...this.state.logs, createLog('hero_reason', this.state.turn + 1, { reason: decision.reason }), ...effect.logs]
    };
  }

  private finishStage(status: 'cleared' | 'failed'): void {
    if (status === 'cleared') {
      this.latestRank = evaluateStageRank({ usedCost: this.state.usedTrapCost, trapCount: this.state.placedTraps.length, turnCount: this.state.turn, remainingHp: Math.max(0, this.state.hero.hp), maxHp: this.state.hero.maxHp });
      this.state = { ...this.state, logs: [...this.state.logs, createLog('rank_shown', this.state.turn, { rank: this.latestRank })] };
    }
    if (status === 'failed') {
      const ending = resolveEnding(false, this.totalTrapCost + this.state.usedTrapCost);
      this.scene.start(SCENES.gameOver, { win: false, text: ending.text, stageIndex: this.stageIndex });
      return;
    }

    const nextIndex = this.stageIndex + 1;
    const totalUsedCost = this.totalTrapCost + this.state.usedTrapCost;
    if (nextIndex >= getStageCount()) {
      const ending = resolveEnding(true, totalUsedCost);
      this.scene.start(SCENES.gameOver, { win: true, text: `${ending.text}\nRANK:${this.latestRank ?? 'B'}`, stageIndex: this.stageIndex });
      return;
    }
    this.scene.start(SCENES.stageSelect, { index: nextIndex, totalTrapCost: totalUsedCost, clearedStages: this.clearedStages + 1 });
  }

  private updateUi(stage: StageDefinition): void {
    const effectiveCostLimit = getEffectiveCostLimit(stage);
    this.hpText.setText(`${this.state.hero.hp}/${this.state.hero.maxHp}  罠:${this.state.placedTraps.length}/${stage.trapLimit}  Cost:${this.state.usedTrapCost}/${effectiveCostLimit}`);
    this.modeText.setText(this.state.phase === 'planning' ? `PHASE: PLANNING / 選択中:${TRAPS[this.selectedTrap].name}` : 'PHASE: RUNNING');
    this.logsText.setText(this.state.logs.slice(-8).map((log) => `[${log.turn}] ${log.text}`).join('\n'));
    updateTrapToolbarState(this.trapButtons, this.selectedTrap, this.state.phase === 'planning');
  }

  private openTutorial(): void {
    if (!this.tutorialMode && this.state.phase !== 'planning') return;
    this.tutorialStepIndex = 0;
    this.showTutorialStep();
  }

  private showTutorialStep(): void {
    this.destroyTutorialOverlay();
    this.tutorialOverlay = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7).setOrigin(0).setDepth(2000);
    const body = GameScene.TUTORIAL_STEPS[this.tutorialStepIndex] ?? 'チュートリアルは完了しました。';
    this.tutorialText = this.add.text(120, 200, `${body}\n\nクリック / タップで次へ`, { fontSize: '28px', color: '#ffffff', wordWrap: { width: GAME_WIDTH - 240 } }).setDepth(2001);
    this.tutorialOverlay.setInteractive({ useHandCursor: true });
    this.tutorialOverlay.on('pointerdown', () => {
      this.tutorialStepIndex += 1;
      if (this.tutorialStepIndex >= GameScene.TUTORIAL_STEPS.length) {
        this.destroyTutorialOverlay();
        return;
      }
      this.showTutorialStep();
    });
  }

  private destroyTutorialOverlay(): void {
    this.tutorialOverlay?.destroy();
    this.tutorialText?.destroy();
    this.tutorialOverlay = null;
    this.tutorialText = null;
  }
}
