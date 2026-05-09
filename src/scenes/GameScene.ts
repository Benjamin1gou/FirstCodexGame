import { Scene } from 'phaser';
import {
  BOARD_OFFSET,
  GAME_HEIGHT,
  GAME_WIDTH,
  SCENES,
  TILE_SIZE,
  TRAP,
  TURN_INTERVAL_MS
} from '../config/gameConfig';
import { decideHeroNextPosition } from '../core/ai/heroDecisionEngine';
import { getOpeningDialogue } from '../core/narrative/dialogueSelector';
import { resolveEnding } from '../core/narrative/endingResolver';
import { judgeStageStatus } from '../core/rules/victoryJudge';
import type { GameSimulationState } from '../core/simulation/simulationTypes';
import { getStageCount, loadStageByIndex } from '../core/stage/stageLoader';
import type { GridPosition, StageDefinition, TileType } from '../core/stage/stageTypes';
import { HEROES } from '../data/heroes/heroes';
import { createLog } from '../systems/LogSystem';
import { TILE_COLORS, isTileInBounds } from './gameSceneTypes';

type GameSceneData = { stageIndex: number; totalTrapCost: number; clearedStages: number };

export class GameScene extends Scene {
  private state!: GameSimulationState;
  private stageIndex = 0;
  private totalTrapCost = 0;
  private clearedStages = 0;

  private heroSprite!: Phaser.GameObjects.Rectangle;
  private logsText!: Phaser.GameObjects.Text;
  private hpText!: Phaser.GameObjects.Text;

  constructor() {
    super(SCENES.game);
  }

  create(data: GameSceneData): void {
    this.stageIndex = data.stageIndex ?? 0;
    this.totalTrapCost = data.totalTrapCost ?? 0;
    this.clearedStages = data.clearedStages ?? 0;

    const stage = loadStageByIndex(this.stageIndex);
    const heroDef = HEROES.find((hero) => hero.id === stage.heroId);
    if (!heroDef) throw new Error(`Hero definition not found: ${stage.heroId}`);

    this.state = this.createInitialState(stage, heroDef);
    this.renderBoard(stage);
    this.renderUi(stage, heroDef.name);

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.handleTrapPlacement(pointer, stage));
    this.input.keyboard?.on('keydown-R', () => this.scene.restart(data));

    this.time.addEvent({
      delay: TURN_INTERVAL_MS,
      loop: true,
      callback: () => this.stepSimulation(stage)
    });

    this.updateUi(stage);
  }

  private createInitialState(stage: StageDefinition, heroDef: (typeof HEROES)[number]): GameSimulationState {
    return {
      stageId: stage.id,
      hero: {
        heroId: heroDef.id,
        name: heroDef.name,
        hp: heroDef.maxHp,
        maxHp: heroDef.maxHp,
        position: { ...stage.startPosition },
        traits: heroDef.traits,
        memory: { seenTraps: [] },
        currentTarget: stage.goalPosition,
        status: 'alive'
      },
      placedTraps: [...stage.initialTraps],
      turn: 0,
      status: 'playing',
      logs: [createLog('goal_selected', 0, { heroName: heroDef.name })],
      score: 0,
      usedTrapCost: 0
    };
  }

  private renderBoard(stage: StageDefinition): void {
    for (let y = 0; y < stage.height; y += 1) {
      for (let x = 0; x < stage.width; x += 1) {
        const tileType = stage.tiles[y][x];
        this.add
          .rectangle(
            BOARD_OFFSET.x + x * TILE_SIZE,
            BOARD_OFFSET.y + y * TILE_SIZE,
            TILE_SIZE - 2,
            TILE_SIZE - 2,
            TILE_COLORS[tileType]
          )
          .setOrigin(0);
      }
    }

    this.heroSprite = this.add
      .rectangle(
        BOARD_OFFSET.x + stage.startPosition.x * TILE_SIZE + 8,
        BOARD_OFFSET.y + stage.startPosition.y * TILE_SIZE + 8,
        TILE_SIZE - 16,
        TILE_SIZE - 16,
        0x2196f3
      )
      .setOrigin(0);
  }

  private renderUi(stage: StageDefinition, heroName: string): void {
    const narrative = getOpeningDialogue(stage.id);

    this.add.text(20, 10, `${stage.chapterTitle} ${stage.name}`, { fontSize: '24px' });
    this.add.text(20, 40, `${heroName} HP`, { fontSize: '20px' });
    this.hpText = this.add.text(140, 40, '', { fontSize: '20px' });

    this.add.text(20, 70, narrative.openingNarration, {
      fontSize: '16px',
      wordWrap: { width: GAME_WIDTH - 60 }
    });
    this.add.text(20, 100, narrative.demonLordLines[0] ?? '', {
      fontSize: '16px',
      color: '#ffb3b3',
      wordWrap: { width: GAME_WIDTH - 60 }
    });

    this.logsText = this.add.text(20, GAME_HEIGHT - 170, '', {
      fontSize: '16px',
      wordWrap: { width: GAME_WIDTH - 60 }
    });
  }

  private handleTrapPlacement(pointer: Phaser.Input.Pointer, stage: StageDefinition): void {
    const tileX = Math.floor((pointer.x - BOARD_OFFSET.x) / TILE_SIZE);
    const tileY = Math.floor((pointer.y - BOARD_OFFSET.y) / TILE_SIZE);

    if (!isTileInBounds(stage, tileX, tileY)) return;
    if (stage.tiles[tileY][tileX] !== 'floor') return;
    if (this.state.placedTraps.length >= stage.trapLimit) return;
    if (this.state.placedTraps.some((trap) => trap.x === tileX && trap.y === tileY)) return;

    this.state = {
      ...this.state,
      placedTraps: [...this.state.placedTraps, { x: tileX, y: tileY }],
      usedTrapCost: this.state.usedTrapCost + TRAP.cost,
      logs: [...this.state.logs, createLog('trap_placed', this.state.turn)]
    };

    this.add
      .rectangle(
        BOARD_OFFSET.x + tileX * TILE_SIZE,
        BOARD_OFFSET.y + tileY * TILE_SIZE,
        TILE_SIZE - 2,
        TILE_SIZE - 2,
        0xb71c1c
      )
      .setOrigin(0);

    this.updateUi(stage);
  }

  private stepSimulation(stage: StageDefinition): void {
    if (this.state.status !== 'playing') return;

    const next = decideHeroNextPosition(this.state.hero, stage.tiles as TileType[][], stage.goalPosition);
    const steppedTrap = this.state.placedTraps.some((trap) => trap.x === next.x && trap.y === next.y);
    const hp = steppedTrap ? this.state.hero.hp - TRAP.damage : this.state.hero.hp;

    const newLogs = [
      ...this.state.logs,
      createLog('goal_selected', this.state.turn + 1, { heroName: this.state.hero.name })
    ];

    const trapLogs = steppedTrap
      ? [
          createLog('trap_triggered', this.state.turn + 1, { heroName: this.state.hero.name }),
          createLog('hero_damaged', this.state.turn + 1, { heroName: this.state.hero.name, damage: TRAP.damage })
        ]
      : [];

    let nextState: GameSimulationState = {
      ...this.state,
      turn: this.state.turn + 1,
      hero: { ...this.state.hero, position: next as GridPosition, hp },
      logs: [...newLogs, ...trapLogs]
    };

    const judgedStatus = judgeStageStatus(nextState, stage.goalPosition);
    nextState = { ...nextState, status: judgedStatus };

    if (judgedStatus === 'cleared') {
      nextState = {
        ...nextState,
        logs: [
          ...nextState.logs,
          createLog('hero_defeated', nextState.turn, { heroName: nextState.hero.name }),
          createLog('stage_cleared', nextState.turn)
        ]
      };
    }

    if (judgedStatus === 'failed') {
      nextState = {
        ...nextState,
        logs: [
          ...nextState.logs,
          createLog('goal_reached', nextState.turn, { heroName: nextState.hero.name }),
          createLog('stage_failed', nextState.turn)
        ]
      };
    }

    this.state = nextState;
    this.heroSprite.setPosition(BOARD_OFFSET.x + next.x * TILE_SIZE + 8, BOARD_OFFSET.y + next.y * TILE_SIZE + 8);
    this.updateUi(stage);

    if (judgedStatus !== 'playing') this.finishStage(judgedStatus);
  }

  private finishStage(status: 'cleared' | 'failed'): void {
    if (status === 'failed') {
      const ending = resolveEnding(false, this.totalTrapCost + this.state.usedTrapCost);
      this.scene.start(SCENES.gameOver, { win: false, text: ending.text, stageIndex: this.stageIndex });
      return;
    }

    const nextIndex = this.stageIndex + 1;
    const totalUsedCost = this.totalTrapCost + this.state.usedTrapCost;

    if (nextIndex >= getStageCount()) {
      const ending = resolveEnding(true, totalUsedCost);
      this.scene.start(SCENES.gameOver, { win: true, text: ending.text, stageIndex: this.stageIndex });
      return;
    }

    this.scene.start(SCENES.stageSelect, {
      index: nextIndex,
      totalTrapCost: totalUsedCost,
      clearedStages: this.clearedStages + 1
    });
  }

  private updateUi(stage: StageDefinition): void {
    this.hpText.setText(
      `${this.state.hero.hp}/${this.state.hero.maxHp}  罠:${this.state.placedTraps.length}/${stage.trapLimit}`
    );
    this.logsText.setText(this.state.logs.slice(-8).map((log) => `[${log.turn}] ${log.text}`).join('\n'));
  }
}
