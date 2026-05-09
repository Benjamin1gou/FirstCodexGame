import { ASSET_KEYS } from './assetKeys';

export type ImageAssetDefinition = Readonly<{ key: string; path: string }>;

// 差し替え時は key を維持したまま path のみを変更すると、ゲームロジックを触らずに見た目を更新できる。
export const ASSET_MANIFEST: readonly ImageAssetDefinition[] = [
  { key: ASSET_KEYS.tiles.floor, path: 'assets/tiles/floor.svg' },
  { key: ASSET_KEYS.tiles.wall, path: 'assets/tiles/wall.svg' },
  { key: ASSET_KEYS.tiles.start, path: 'assets/tiles/start.svg' },
  { key: ASSET_KEYS.tiles.goal, path: 'assets/tiles/goal.svg' },
  { key: ASSET_KEYS.tiles.trap, path: 'assets/tiles/trap_spike.svg' },
  { key: ASSET_KEYS.tiles.treasure, path: 'assets/tiles/treasure.svg' },
  { key: ASSET_KEYS.tiles.monster, path: 'assets/tiles/monster.svg' },
  { key: ASSET_KEYS.heroes.adel, path: 'assets/characters/heroes/hero_adel.svg' },
  { key: ASSET_KEYS.heroes.mio, path: 'assets/characters/heroes/hero_mio.svg' },
  { key: ASSET_KEYS.heroes.serena, path: 'assets/characters/heroes/hero_serena.svg' },
  { key: ASSET_KEYS.ui.panel, path: 'assets/ui/panel.svg' },
  { key: ASSET_KEYS.ui.button, path: 'assets/ui/button.svg' },
  { key: ASSET_KEYS.effects.trapHit, path: 'assets/effects/trap_hit.svg' }
];
