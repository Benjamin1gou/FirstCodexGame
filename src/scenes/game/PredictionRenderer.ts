import type { RoutePrediction } from '../../core/simulation/predictRoute';

export const renderPredictionMarkers = (
  scene: Phaser.Scene,
  positions: RoutePrediction['positions'],
  tileSize: number,
  boardOffset: { x: number; y: number }
): Phaser.GameObjects.GameObject[] =>
  positions.map((p) =>
    scene.add.circle(
      boardOffset.x + p.x * tileSize + tileSize / 2,
      boardOffset.y + p.y * tileSize + tileSize / 2,
      4,
      0x99ff99,
      0.6
    )
  );

export const destroyGameObjects = (objects: Phaser.GameObjects.GameObject[]): void => {
  objects.forEach((obj) => obj.destroy());
};
