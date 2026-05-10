import { renderTrapTile } from './BoardRenderer';
import type { GridPosition, PlacedTrap } from '../../core/stage/stageTypes';

export const renderTrapSprites = (
  scene: Phaser.Scene,
  traps: PlacedTrap[],
  tileSize: number,
  boardOffset: GridPosition
): Phaser.GameObjects.Image[] => traps.map((trap) => styleTrapSprite(renderTrapTile(scene, trap.x, trap.y, tileSize, boardOffset), trap));

export const refreshTrapSprites = (
  sprites: Phaser.GameObjects.Image[],
  traps: PlacedTrap[],
  tileSize: number,
  boardOffset: GridPosition
): Phaser.GameObjects.Image[] => {
  sprites.forEach((s) => s.destroy());
  return renderTrapSprites((sprites[0]?.scene ?? null) as Phaser.Scene, traps, tileSize, boardOffset);
};

const styleTrapSprite = (sprite: Phaser.GameObjects.Image, trap: PlacedTrap): Phaser.GameObjects.Image => {
  if (trap.destroyed) return sprite.setAlpha(0.12);
  if ((trap.remainingCooldown ?? 0) > 0) return sprite.setAlpha(0.45);
  return sprite.setAlpha(1);
};
