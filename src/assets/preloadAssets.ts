import { ASSET_MANIFEST } from './assetManifest';

export const preloadAssets = (scene: Phaser.Scene): void => {
  ASSET_MANIFEST.forEach((asset) => {
    scene.load.image(asset.key, asset.path);
  });
};
