import type { Input, Physics } from 'phaser';
import { PLAYER_SPEED } from '../config/gameConfig';

export const applyPlayerMovement = (
  player: Physics.Arcade.Sprite,
  cursors: Input.Keyboard.CursorKeys
) => {
  player.setVelocity(0, 0);
  if (cursors.left?.isDown) player.setVelocityX(-PLAYER_SPEED);
  if (cursors.right?.isDown) player.setVelocityX(PLAYER_SPEED);
  if (cursors.up?.isDown) player.setVelocityY(-PLAYER_SPEED);
  if (cursors.down?.isDown) player.setVelocityY(PLAYER_SPEED);
};
