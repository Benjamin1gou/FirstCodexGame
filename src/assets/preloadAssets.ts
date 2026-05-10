import { ASSET_MANIFEST } from './assetManifest';

const resolveAssetPath = (assetPath: string): string => {
  const normalizedBase = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;

  if (assetPath.startsWith('/')) {
    return `${normalizedBase}${assetPath.slice(1)}`;
  }

  return `${normalizedBase}${assetPath}`;
};

export const preloadAssets = (scene: Phaser.Scene): void => {
  ASSET_MANIFEST.forEach((asset) => {
    scene.load.image(asset.key, resolveAssetPath(asset.path));
  });
};
