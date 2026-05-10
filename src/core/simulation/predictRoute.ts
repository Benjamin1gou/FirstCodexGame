import { decideHeroAction } from '../ai/heroDecisionEngine';
import { applyTrapEffect } from './trapEffects';
import type { HeroState } from '../ai/heroAiTypes';
import type { GridPosition, PlacedTrap, StageDefinition } from '../stage/stageTypes';

export type RoutePrediction = { positions: GridPosition[]; summary: string };

export const predictRoute = (hero: HeroState, stage: StageDefinition, traps: PlacedTrap[], maxTurns = 20): RoutePrediction => {
  const positions: GridPosition[] = [];
  let simHero: HeroState = { ...hero, memory: { seenTraps: [...hero.memory.seenTraps], lastPosition: hero.memory.lastPosition ? { ...hero.memory.lastPosition } : null } };
  let skipTurns = 0;
  for (let turn = 0; turn < maxTurns; turn += 1) {
    if (skipTurns > 0) { positions.push({ ...simHero.position }); skipTurns -= 1; continue; }
    const decision = decideHeroAction(simHero, stage.tiles, stage.goalPosition, traps, stage.chests);
    const steppedTrap = traps.find((t) => t.x === decision.nextPosition.x && t.y === decision.nextPosition.y);
    const effect = applyTrapEffect(steppedTrap, turn + 1, simHero.name);
    const seenTraps = steppedTrap ? [...simHero.memory.seenTraps, { x: steppedTrap.x, y: steppedTrap.y }] : simHero.memory.seenTraps;
    const previousPosition = { ...simHero.position };
    const nextPos = effect.reverseStep ? previousPosition : decision.nextPosition;
    simHero = { ...simHero, position: nextPos, hp: simHero.hp + effect.hpDelta, memory: { ...simHero.memory, seenTraps, lastPosition: previousPosition } };
    skipTurns = effect.skipTurns;
    positions.push({ ...simHero.position });
    if (simHero.hp <= 0 || (simHero.position.x === stage.goalPosition.x && simHero.position.y === stage.goalPosition.y)) break;
  }
  const summary = stage.heroId === 'mio' ? '予測：ミオはデコイや宝箱に引き寄せられそうです' : stage.heroId === 'serena' ? '予測：セレナは危険な罠を避けそうです' : '予測：アデルは最短ルートを進みそうです';
  return { positions, summary };
};
