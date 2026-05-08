import type { Physics, Scene } from 'phaser';

export const createPlayer = (scene: Scene, x: number, y: number): Physics.Arcade.Sprite => {
  const player = scene.physics.add.sprite(x, y, 'player');
  player.setCollideWorldBounds(true);
  player.setScale(0.9);
  return player;
};
