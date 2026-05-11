import * as Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, SCENES, TRAPS, TURN_INTERVAL_MS } from '../config/gameConfig';
import { decideHeroAction } from '../core/ai/heroDecisionEngine';
import { resolveEnding } from '../core/narrative/endingResolver';
import { canPlaceTrap } from '../core/rules/placementRules';
import { evaluateStageRank, type StageRank } from '../core/rules/rankEvaluator';
import { judgeStageStatus } from '../core/rules/victoryJudge';
import { predictRoute } from '../core/simulation/predictRoute';
import { applyTrapEffect } from '../core/simulation/trapEffects';
import { createPlacedTrap, tickTrapCooldowns } from '../core/simulation/trapState';
import type { GamePhase, GameSimulationState } from '../core/simulation/simulationTypes';
import { getStageCount, loadStageByIndex } from '../core/stage/stageLoader';
import type { GridPosition, PlacedTrap, StageDefinition, TrapType } from '../core/stage/stageTypes';
import { AudioManager } from '../systems/AudioManager';
import { mobileControls } from '../input/mobileControls';
import { createMuteButton } from '../systems/AudioUi';
import { createLog } from '../systems/LogSystem';
import { GB_COLORS, GB_UI } from '../ui/gbTheme';
import { renderBoardTiles } from './game/BoardRenderer';
import { computeBoardLayout } from './game/GameSceneLayout';
import { createInitialSimulationState } from './game/GameSceneStateFactory';
import { createHeroSprite, updateHeroSpritePosition } from './game/HeroRenderer';
import { destroyGameObjects, renderPredictionMarkers } from './game/PredictionRenderer';
import { destroyPlacementOverlay, renderPlacementOverlay } from './game/TrapPlacementOverlayRenderer';
import { renderTrapSprites } from './game/TrapRenderer';

type GameSceneData = { stageIndex: number; totalTrapCost: number; clearedStages: number; tutorialMode?: boolean };

export class GameScene extends Phaser.Scene {
  constructor() { super(SCENES.game); }

  private state!: GameSimulationState;
  private stageIndex = 0;
  private totalTrapCost = 0;
  private clearedStages = 0;
  private selectedTrap: TrapType = 'spike';
  private heroSprite!: Phaser.GameObjects.Image;
  private logsText!: Phaser.GameObjects.Text;
  private hpText!: Phaser.GameObjects.Text;
  private turnText!: Phaser.GameObjects.Text;
  private costText!: Phaser.GameObjects.Text;
  private trapSprites: Phaser.GameObjects.Image[] = [];
  private predictionMarkers: Phaser.GameObjects.GameObject[] = [];
  private placementOverlayObjects: Phaser.GameObjects.GameObject[] = [];
  private placementHistory: PlacedTrap[] = [];
  private latestRank: StageRank | null = null;
  private boardTileSize = 32;
  private boardOffset = { x: 0, y: 0 };
  private tutorialMode = false;
  private tutorialStepIndex = 0;
  private tutorialOverlay: Phaser.GameObjects.Rectangle | null = null;
  private tutorialText: Phaser.GameObjects.Text | null = null;
  private cursorPosition: GridPosition = { x: 0, y: 0 };
  private cursorMarker?: Phaser.GameObjects.Rectangle;
  private isPaused = false;
  private static readonly TRAP_ORDER: TrapType[] = ['spike', 'slime', 'decoy', 'arrow', 'fear', 'pitfall'];

  private static readonly TUTORIAL_STEPS = [
    'チュートリアル 1/4\n盤面をタップ、または十字キーでカーソルを動かしてAボタンで罠を配置できます。',
    'チュートリアル 2/4\n上部の予測ルート点を見て、勇者の進行先を確認しましょう。',
    'チュートリアル 3/4\n配置をやり直すときはBボタン、またはBackspaceを使います。',
    'チュートリアル 4/4\n準備ができたらSTARTボタン、Enter、またはSpaceで進行開始です。'
  ] as const;

  create(data: GameSceneData): void {
    this.setupSceneEnvironment();
    const stage = this.setupState(data);

    this.setupBoard(stage);
    this.trapSprites = renderTrapSprites(this, this.state.placedTraps, this.boardTileSize, this.boardOffset);
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
    this.cursorPosition = { ...stage.startPosition };
    this.cursorMarker = this.add.rectangle(0, 0, this.boardTileSize - 2, this.boardTileSize - 2).setStrokeStyle(2, 0xffffff, 0.95).setFillStyle(0xffffff, 0.08).setDepth(1500);
    this.updateCursorMarker();
  }

  private renderUi(stage: StageDefinition): void {
    const hudHeight = 64;
    const panelColor = Phaser.Display.Color.HexStringToColor(GB_COLORS.lightest).color;
    this.add.rectangle(GAME_WIDTH / 2, hudHeight / 2, GAME_WIDTH, hudHeight, panelColor).setOrigin(0.5);

    this.turnText = this.add.text(14, 18, '', {
      fontSize: '22px',
      fontFamily: GB_UI.fontFamily,
      color: GB_COLORS.darkest,
      fontStyle: 'bold'
    });
    this.hpText = this.add.text(GAME_WIDTH / 2, 18, '', {
      fontSize: '22px',
      fontFamily: GB_UI.fontFamily,
      color: GB_COLORS.darkest,
      fontStyle: 'bold'
    }).setOrigin(0.5, 0);
    this.costText = this.add.text(GAME_WIDTH - 14, 18, '', {
      fontSize: '22px',
      fontFamily: GB_UI.fontFamily,
      color: GB_COLORS.darkest,
      fontStyle: 'bold'
    }).setOrigin(1, 0);
    this.logsText = this.add.text(8, GAME_HEIGHT - 8, '', {
      fontSize: '9px',
      fontFamily: GB_UI.fontFamily,
      color: GB_COLORS.darkest,
      wordWrap: { width: GAME_WIDTH - 16 }
    }).setOrigin(0, 1);
  }

  private registerInputs(stage: StageDefinition, data: GameSceneData): void {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.handleTrapPlacement(pointer, stage));
    this.input.keyboard?.on('keydown-R', () => this.scene.restart(data));
    this.input.keyboard?.on('keydown-ENTER', () => this.handleStartButton(stage));
    this.input.keyboard?.on('keydown-SPACE', () => this.handleStartButton(stage));
    this.input.keyboard?.on('keydown-BACKSPACE', () => this.handleBButton(stage));
    this.input.keyboard?.on('keydown-H', () => this.openTutorial());
    this.input.keyboard?.on('keydown-ONE', () => this.selectTrap('spike'));
    this.input.keyboard?.on('keydown-TWO', () => this.selectTrap('slime'));
    this.input.keyboard?.on('keydown-THREE', () => this.selectTrap('decoy'));
    this.input.keyboard?.on('keydown-FOUR', () => this.selectTrap('arrow'));
    this.input.keyboard?.on('keydown-FIVE', () => this.selectTrap('fear'));
    this.input.keyboard?.on('keydown-SIX', () => this.selectTrap('pitfall'));
    this.input.keyboard?.on('keydown-UP', () => this.moveCursor(0, -1, stage));
    this.input.keyboard?.on('keydown-DOWN', () => this.moveCursor(0, 1, stage));
    this.input.keyboard?.on('keydown-LEFT', () => this.moveCursor(-1, 0, stage));
    this.input.keyboard?.on('keydown-RIGHT', () => this.moveCursor(1, 0, stage));
    this.input.keyboard?.on('keydown-W', () => this.moveCursor(0, -1, stage));
    this.input.keyboard?.on('keydown-S', () => this.moveCursor(0, 1, stage));
    this.input.keyboard?.on('keydown-A', () => this.moveCursor(-1, 0, stage));
    this.input.keyboard?.on('keydown-D', () => this.moveCursor(1, 0, stage));
    this.input.keyboard?.on('keydown-Z', () => this.handleAButton(stage));
    this.input.keyboard?.on('keydown-X', () => this.handleBButton(stage));
    this.input.keyboard?.on('keydown-SHIFT', () => this.handleSelectButton(stage));
    this.input.keyboard?.on('keydown-ESC', () => this.handleStartButton(stage));
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

    this.placeTrapAt({ x: tileX, y: tileY }, stage);
    this.cursorPosition = { x: tileX, y: tileY };
    this.updateCursorMarker();
  }

  private placeTrapAt(position: GridPosition, stage: StageDefinition): void {
    const result = canPlaceTrap(this.state.phase, stage, position, this.state.hero.position, this.state.placedTraps, this.state.placedTraps.length, this.state.usedTrapCost, TRAPS[this.selectedTrap].cost, this.state.mana);
    if (!result.ok) {
      this.state = { ...this.state, logs: [...this.state.logs, createLog('placement_denied', this.state.turn, { reason: result.reason })] };
      this.updateUi(stage);
      this.refreshPlacementOverlay(stage);
      return;
    }

    const placedTrap: PlacedTrap = createPlacedTrap(position, this.selectedTrap);
    this.placementHistory = [...this.placementHistory, placedTrap];
    this.state = {
      ...this.state,
      placedTraps: [...this.state.placedTraps, placedTrap],
      usedTrapCost: this.state.usedTrapCost + TRAPS[this.selectedTrap].cost,
      mana: Math.max(0, this.state.mana - TRAPS[this.selectedTrap].cost),
      logs: [...this.state.logs, createLog('trap_placed', this.state.turn, { trapName: TRAPS[this.selectedTrap].name })]
    };
    this.trapSprites = renderTrapSprites(this, this.state.placedTraps, this.boardTileSize, this.boardOffset);
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
      mana: Math.min(this.state.maxMana, this.state.mana + TRAPS[last.type].cost),
      logs: [...this.state.logs, createLog('trap_removed', this.state.turn, { trapName: TRAPS[last.type].name })]
    };
    this.trapSprites.forEach((sprite) => sprite.destroy());
    this.trapSprites = renderTrapSprites(this, this.state.placedTraps, this.boardTileSize, this.boardOffset);
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
    this.state = { ...this.state, logs: [...this.state.logs, createLog('prediction_updated', this.state.turn)] };
  }

  private stepSimulation(stage: StageDefinition): void {
    if (this.state.status !== 'playing' || this.state.phase !== 'running' || this.isPaused) return;
    if (this.state.hero.skipTurns > 0) {
      this.state = { ...this.state, turn: this.state.turn + 1, hero: { ...this.state.hero, skipTurns: this.state.hero.skipTurns - 1 }, logs: [...this.state.logs, createLog('hero_slowed', this.state.turn + 1, { heroName: this.state.hero.name })] };
      this.updateUi(stage);
      return;
    }

    const nextState = this.buildNextRunningState(stage);
    const judgedStatus = judgeStageStatus(nextState, stage.goalPosition);
    this.state = { ...nextState, status: judgedStatus, phase: judgedStatus === 'playing' ? 'running' : (judgedStatus as GamePhase) };
    updateHeroSpritePosition(this.heroSprite, this.state.hero.position, this.boardTileSize, this.boardOffset);
    this.trapSprites.forEach((sprite) => sprite.destroy());
    this.trapSprites = renderTrapSprites(this, this.state.placedTraps, this.boardTileSize, this.boardOffset);
    this.updateUi(stage);
    if (judgedStatus !== 'playing') this.finishStage(judgedStatus);
  }

  private buildNextRunningState(stage: StageDefinition): GameSimulationState {
    const decision = decideHeroAction(this.state.hero, stage.tiles, stage.goalPosition, this.state.placedTraps, stage.chests);
    const steppedTrap = this.state.placedTraps.find((trap) => trap.x === decision.nextPosition.x && trap.y === decision.nextPosition.y);
    const effect = applyTrapEffect(steppedTrap, this.state.turn + 1, this.state.hero.name);
    const cooldownTick = tickTrapCooldowns(this.state.placedTraps);
    const previousPosition = { ...this.state.hero.position };
    const nextPosition: GridPosition = effect.reverseStep ? previousPosition : decision.nextPosition;
    const seenTraps = steppedTrap && !this.state.hero.memory.seenTraps.some((p) => p.x === steppedTrap.x && p.y === steppedTrap.y)
      ? [...this.state.hero.memory.seenTraps, { x: steppedTrap.x, y: steppedTrap.y }]
      : this.state.hero.memory.seenTraps;

    const trapsAfterEffect = cooldownTick.traps.map((trap) => steppedTrap && trap.x === steppedTrap.x && trap.y === steppedTrap.y && effect.updatedTrap ? effect.updatedTrap : trap);
    const logs = [...this.state.logs, createLog('hero_reason', this.state.turn + 1, { reason: decision.reason }), ...effect.logs, ...cooldownTick.readied.map((trap) => createLog('trap_ready', this.state.turn + 1, { trapName: TRAPS[trap.type].name }))];

    return {
      ...this.state,
      turn: this.state.turn + 1,
      placedTraps: trapsAfterEffect,
      hero: {
        ...this.state.hero,
        position: nextPosition,
        hp: this.state.hero.hp + effect.hpDelta,
        skipTurns: effect.skipTurns,
        memory: { ...this.state.hero.memory, seenTraps, lastPosition: previousPosition }
      },
      mana: Math.min(this.state.maxMana, this.state.mana + effect.manaDelta),
      logs
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
    this.turnText.setText(`TURN ${this.state.turn}`);
    this.hpText.setText(`HP ${Math.max(0, this.state.hero.hp)}`);
    this.costText.setText(`COST ${this.state.usedTrapCost}`);
    this.logsText.setText(this.state.logs.slice(-1).map((log) => `[${log.turn}] ${log.text}`).join('\n'));
  }


  private updateCursorMarker(): void {
    if (!this.cursorMarker) return;
    this.cursorMarker.setPosition(this.boardOffset.x + this.cursorPosition.x * this.boardTileSize + this.boardTileSize / 2, this.boardOffset.y + this.cursorPosition.y * this.boardTileSize + this.boardTileSize / 2);
  }

  private handleAButton(stage: StageDefinition): void { if (this.state.phase === 'planning') this.placeTrapAt(this.cursorPosition, stage); }
  private handleBButton(stage: StageDefinition): void { if (this.state.phase === 'planning') this.undoLastPlacement(stage); }
  private handleSelectButton(stage: StageDefinition): void {
    if (this.state.phase === 'planning') {
      const index = GameScene.TRAP_ORDER.indexOf(this.selectedTrap);
      this.selectTrap(GameScene.TRAP_ORDER[(index + 1) % GameScene.TRAP_ORDER.length]);
      return;
    }
    this.state = {
      ...this.state,
      logs: [...this.state.logs, createLog('phase_changed', this.state.turn, { phase: 'HUD:TOGGLE' })]
    };
    this.updateUi(stage);
  }
  private handleStartButton(stage: StageDefinition): void {
    if (this.state.phase === 'planning') {
      this.startRunning();
      return;
    }
    this.isPaused = !this.isPaused;
    this.state = {
      ...this.state,
      logs: [...this.state.logs, createLog('phase_changed', this.state.turn, { phase: this.isPaused ? 'PAUSED' : 'RUNNING' })]
    };
    this.updateUi(stage);
  }

  private getCurrentStage(): StageDefinition {
    return loadStageByIndex(this.stageIndex);
  }

  private openTutorial(): void {
    if (!this.tutorialMode && this.state.phase !== 'planning') return;
    this.tutorialStepIndex = 0;
    this.showTutorialStep();
  }

  private showTutorialStep(): void {
    this.destroyTutorialOverlay();
    this.tutorialOverlay = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, Phaser.Display.Color.HexStringToColor(GB_COLORS.darkest).color, 0.85).setOrigin(0).setDepth(2000);
    const body = GameScene.TUTORIAL_STEPS[this.tutorialStepIndex] ?? 'チュートリアルは完了しました。';
    this.tutorialText = this.add.text(24, 160, `${body}\n\nタップで次へ`, { fontSize: '19px', fontFamily: GB_UI.fontFamily, color: GB_COLORS.white, wordWrap: { width: GAME_WIDTH - 48 } }).setDepth(2001);
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
