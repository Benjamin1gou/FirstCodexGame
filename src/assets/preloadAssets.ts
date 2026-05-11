import * as Phaser from 'phaser';
import { ASSET_MANIFEST } from './assetManifest';

const DEFAULT_BASE_URL = '/';

const normalizeBaseUrl = (baseUrl: string | undefined): string => {
  if (!baseUrl || baseUrl.trim().length === 0) {
    return DEFAULT_BASE_URL;
  }

  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
};

const resolveAssetPath = (assetPath: string): string => {
  const normalizedBase = normalizeBaseUrl(import.meta.env.BASE_URL);
  const normalizedAssetPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;

  return `${normalizedBase}${normalizedAssetPath}`;
};

export const preloadAssets = (scene: Phaser.Scene): void => {
  ASSET_MANIFEST.forEach((asset) => {
    scene.load.image(asset.key, resolveAssetPath(asset.path));
  });
};
