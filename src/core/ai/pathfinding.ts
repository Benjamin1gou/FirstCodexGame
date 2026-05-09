import type { GridPosition, TileType } from '../stage/stageTypes';
const dirs = [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}];
export const findNextStep = (tiles: TileType[][], from: GridPosition, goal: GridPosition): GridPosition | null => {
  const q: GridPosition[] = [from];
  const prev = new Map<string, GridPosition | null>();
  const key = (p: GridPosition) => `${p.x},${p.y}`;
  prev.set(key(from), null);
  while (q.length) {
    const cur = q.shift()!;
    if (cur.x === goal.x && cur.y === goal.y) break;
    for (const d of dirs) {
      const n = { x: cur.x + d.x, y: cur.y + d.y };
      if (!tiles[n.y]?.[n.x] || tiles[n.y][n.x] === 'wall' || prev.has(key(n))) continue;
      prev.set(key(n), cur); q.push(n);
    }
  }
  if (!prev.has(key(goal))) return null;
  let cur: GridPosition = goal;
  while (true) {
    const p = prev.get(key(cur));
    if (!p) return cur;
    if (p.x === from.x && p.y === from.y) return cur;
    cur = p;
  }
};
