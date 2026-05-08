import { Scene } from 'phaser';
import type { GameObjects, Input, Physics } from 'phaser';
import { createEnemy } from '../entities/Enemy';
import { createItem } from '../entities/Item';
import { createPlayer } from '../entities/Player';
import { ENEMY_SPEED, GAME_HEIGHT, GAME_WIDTH, ITEM_SCORE, SCENES, WORLD_PADDING } from '../config/gameConfig';
import { applyPlayerMovement } from '../systems/MovementSystem';
import { randomBetween } from '../utils/random';

export class GameScene extends Scene {
  private player!: Physics.Arcade.Sprite;
  private enemy!: Physics.Arcade.Sprite;
  private item!: Physics.Arcade.Sprite;
  private cursors!: Input.Keyboard.CursorKeys;
  private score = 0;
  private scoreText!: GameObjects.Text;

  constructor() { super(SCENES.game); }

  create(data: { score?: number }) {
    this.score = data.score ?? 0;
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'background');
    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.player = createPlayer(this, GAME_WIDTH * 0.2, GAME_HEIGHT * 0.5);
    this.enemy = createEnemy(this, GAME_WIDTH * 0.75, GAME_HEIGHT * 0.5);
    this.item = createItem(this, GAME_WIDTH * 0.5, GAME_HEIGHT * 0.5);
    this.enemy.setVelocity(-ENEMY_SPEED, ENEMY_SPEED);
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.scoreText = this.add.text(16, 14, `SCORE: ${this.score}`, { fontSize: '28px', color: '#102040' });
    this.physics.add.overlap(this.player, this.item, () => {
      this.score += ITEM_SCORE;
      this.scoreText.setText(`SCORE: ${this.score}`);
      this.item.setPosition(randomBetween(WORLD_PADDING, GAME_WIDTH - WORLD_PADDING), randomBetween(WORLD_PADDING, GAME_HEIGHT - WORLD_PADDING));
    });
    this.physics.add.overlap(this.player, this.enemy, () => {
      this.scene.start(SCENES.gameOver, { score: this.score });
    });
  }

  update() { applyPlayerMovement(this.player, this.cursors); }
}
