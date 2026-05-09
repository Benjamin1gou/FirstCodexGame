export const ASSET_KEYS = {
  tiles: {
    floor: 'tile_floor',
    wall: 'tile_wall',
    start: 'tile_start',
    goal: 'tile_goal',
    trap: 'tile_trap_spike',
    treasure: 'tile_treasure',
    monster: 'tile_monster'
  },
  heroes: {
    adel: 'hero_adel',
    mio: 'hero_mio',
    serena: 'hero_serena'
  },
  ui: {
    panel: 'ui_panel',
    button: 'ui_button'
  },
  effects: {
    trapHit: 'effect_trap_hit'
  }
} as const;

export type TileAssetKey = (typeof ASSET_KEYS.tiles)[keyof typeof ASSET_KEYS.tiles];
export type HeroAssetKey = (typeof ASSET_KEYS.heroes)[keyof typeof ASSET_KEYS.heroes];
