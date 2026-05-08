import type { Physics, Scene } from 'phaser';

export const createItem = (scene: Scene, x: number, y: number): Physics.Arcade.Sprite => {
  const item = scene.physics.add.sprite(x, y, 'item');
  item.setImmovable(true);
  return item;
};
