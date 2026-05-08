import type { Physics, Scene } from 'phaser';

export const createEnemy = (scene: Scene, x: number, y: number): Physics.Arcade.Sprite => {
  const enemy = scene.physics.add.sprite(x, y, 'enemy');
  enemy.setBounce(1, 1);
  enemy.setCollideWorldBounds(true);
  return enemy;
};
