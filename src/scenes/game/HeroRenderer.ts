import { ASSET_KEYS, type HeroAssetKey } from '../../assets/assetKeys';
import type { GridPosition } from '../../core/stage/stageTypes';
import { boardToWorld } from './BoardRenderer';

const HERO_ASSET_BY_ID: Record<string, HeroAssetKey> = { adel: ASSET_KEYS.heroes.adel, mio: ASSET_KEYS.heroes.mio, serena: ASSET_KEYS.heroes.serena };

export const createHeroSprite = (scene: Phaser.Scene, heroId: string, start: GridPosition, tileSize: number, boardOffset: { x: number; y: number }): Phaser.GameObjects.Image => {
  const anchor = boardToWorld(start.x, start.y, tileSize, boardOffset);
  return scene.add
    .image(anchor.x + tileSize / 2, anchor.y + tileSize / 2, HERO_ASSET_BY_ID[heroId] ?? ASSET_KEYS.heroes.adel)
    .setOrigin(0.5)
    .setDisplaySize(tileSize * 0.82, tileSize * 0.82);
};

export const updateHeroSpritePosition = (sprite: Phaser.GameObjects.Image, position: GridPosition, tileSize: number, boardOffset: { x: number; y: number }): void => {
  const anchor = boardToWorld(position.x, position.y, tileSize, boardOffset);
  sprite.setPosition(anchor.x + tileSize / 2, anchor.y + tileSize / 2);
};
