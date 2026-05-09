import { ENDINGS } from '../../data/narrative/endings';
export const resolveEnding = (allCleared: boolean, totalTrapCost: number) => {
  if (!allCleared) return ENDINGS.find((x) => x.id === 'defeat')!;
  return totalTrapCost <= 8 ? ENDINGS.find((x) => x.id === 'strategic')! : ENDINGS.find((x) => x.id === 'forceful')!;
};
