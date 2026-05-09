import type { HeroDecision, HeroState } from './heroAiTypes';
import type { GridPosition, PlacedTrap, TileType } from '../stage/stageTypes';

const DIRECTION_ORDER: GridPosition[] = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
const MANHATTAN_MAX = 20;
const manhattan = (a: GridPosition, b: GridPosition): number => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
const keyOf = (p: GridPosition): string => `${p.x},${p.y}`;

export const decideHeroAction = (hero: HeroState, tiles: TileType[][], goal: GridPosition, placedTraps: PlacedTrap[], chests: GridPosition[]): HeroDecision => {
  const seenSet = new Set(hero.memory.seenTraps.map((trap) => keyOf(trap)));
  const candidates = DIRECTION_ORDER.map((dir) => ({ x: hero.position.x + dir.x, y: hero.position.y + dir.y })).filter((p) => tiles[p.y]?.[p.x] && tiles[p.y][p.x] !== 'wall');
  if (candidates.length === 0) return { nextPosition: hero.position, reason: '進める道がない。', scores: [] };

  const scores = candidates.map((position) => {
    const goalScore = (MANHATTAN_MAX - manhattan(position, goal)) * hero.traits.goalPressure;
    const chestDistance = chests.length ? Math.min(...chests.map((c) => manhattan(position, c))) : MANHATTAN_MAX;
    const treasureScore = (MANHATTAN_MAX - chestDistance) * hero.traits.treasureBias;
    const decoys = placedTraps.filter((t) => t.type === 'decoy');
    const decoyDistance = decoys.length ? Math.min(...decoys.map((d) => manhattan(position, d))) : MANHATTAN_MAX;
    const curiosityScore = (MANHATTAN_MAX - decoyDistance) * hero.traits.curiosity;
    const dangerTraps = placedTraps.filter((t) => t.type !== 'decoy');
    const nearestDanger = dangerTraps.length ? Math.min(...dangerTraps.map((t) => manhattan(position, t))) : MANHATTAN_MAX;
    const riskPenalty = Math.max(0, 4 - nearestDanger) * hero.traits.riskAversion * 3;
    const memoryPenalty = (seenSet.has(keyOf(position)) ? 4 : 0) * hero.traits.trapMemory;
    const total = goalScore + treasureScore + curiosityScore - riskPenalty - memoryPenalty;
    return { position, score: total, goalDistance: manhattan(position, goal), reasons: [`goal:${goalScore.toFixed(1)}`,`treasure:${treasureScore.toFixed(1)}`,`curiosity:${curiosityScore.toFixed(1)}`,`risk:-${riskPenalty.toFixed(1)}`,`memory:-${memoryPenalty.toFixed(1)}`] };
  });

  const best = [...scores].sort((a, b) => b.score - a.score || a.goalDistance - b.goalDistance)[0];
  const reason = hero.traits.riskAversion > 0.8 && best.reasons[3] !== 'risk:-0.0' ? `${hero.name}「この道は危険ね。別ルートを選ぶわ」` : hero.traits.curiosity > 0.8 && best.reasons[2] !== 'curiosity:0.0' ? `${hero.name}「気になるものがある、見に行こう！」` : `${hero.name}「ゴールへ進む！」`;
  return { nextPosition: best.position, reason, scores: scores.map(({ goalDistance: _g, ...v }) => v) };
};
