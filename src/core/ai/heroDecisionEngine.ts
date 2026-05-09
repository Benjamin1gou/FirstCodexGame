import type { HeroDecision, HeroState } from './heroAiTypes';
import type { GridPosition, PlacedTrap, TileType } from '../stage/stageTypes';

const DIRECTION_ORDER: GridPosition[] = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
const MANHATTAN_MAX = 20;

const manhattan = (a: GridPosition, b: GridPosition): number => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
const keyOf = (p: GridPosition): string => `${p.x},${p.y}`;

const trapPenalty = (position: GridPosition, traps: PlacedTrap[], seenTraps: GridPosition[]): number => {
  const allDanger = [...traps, ...seenTraps];
  if (allDanger.length === 0) return 0;
  const nearest = Math.min(...allDanger.map((danger) => manhattan(position, danger)));
  return Math.max(0, 3 - nearest);
};

const findBestChestDistance = (position: GridPosition, chests: GridPosition[]): number => {
  if (chests.length === 0) return MANHATTAN_MAX;
  return Math.min(...chests.map((chest) => manhattan(position, chest)));
};

export const decideHeroAction = (
  hero: HeroState,
  tiles: TileType[][],
  goal: GridPosition,
  placedTraps: PlacedTrap[],
  chests: GridPosition[]
): HeroDecision => {
  const seenSet = new Set(hero.memory.seenTraps.map((trap) => keyOf(trap)));
  const candidates = DIRECTION_ORDER.map((dir) => ({ x: hero.position.x + dir.x, y: hero.position.y + dir.y }))
    .filter((p) => tiles[p.y]?.[p.x] && tiles[p.y][p.x] !== 'wall');

  if (candidates.length === 0) {
    return { nextPosition: hero.position, reason: '進める道がない。', scores: [] };
  }

  const scores = candidates.map((position) => {
    const goalDistance = manhattan(position, goal);
    const goalScore = (MANHATTAN_MAX - goalDistance) * hero.traits.goalPressure;
    const chestDistance = findBestChestDistance(position, chests);
    const treasureScore = (MANHATTAN_MAX - chestDistance) * hero.traits.treasureBias;
    const curiosityScore = (seenSet.has(keyOf(position)) ? 0.5 : 2) * hero.traits.curiosity;
    const danger = trapPenalty(position, placedTraps, hero.memory.seenTraps);
    const riskPenalty = danger * hero.traits.riskAversion * 2;
    const memoryPenalty = (seenSet.has(keyOf(position)) ? 3 : trapPenalty(position, hero.memory.seenTraps.map((t) => ({ ...t, type: 'spike' as const })), [])) * hero.traits.trapMemory;
    const total = goalScore + treasureScore + curiosityScore - riskPenalty - memoryPenalty;
    return { position, score: total, goalDistance, reasons: [
      `goal:${goalScore.toFixed(1)}`,
      `treasure:${treasureScore.toFixed(1)}`,
      `curiosity:${curiosityScore.toFixed(1)}`,
      `risk:-${riskPenalty.toFixed(1)}`,
      `memory:-${memoryPenalty.toFixed(1)}`
    ] };
  });

  const best = [...scores].sort((a, b) => b.score - a.score || a.goalDistance - b.goalDistance)[0];
  const reason = hero.traits.treasureBias > 0.7 && best.reasons[1] !== 'treasure:0.0'
    ? `${hero.name}「宝箱が気になる……少し寄り道しよう」`
    : hero.traits.riskAversion > 0.8 && (best.reasons[3] !== 'risk:-0.0' || best.reasons[4] !== 'memory:-0.0')
      ? `${hero.name}「この道は危険ね。別ルートを選ぶわ」`
      : `${hero.name}「ゴールは近い。危険でも進む」`;

  return {
    nextPosition: best.position,
    reason,
    scores: scores.map(({ goalDistance: _goalDistance, ...value }) => value)
  };
};
