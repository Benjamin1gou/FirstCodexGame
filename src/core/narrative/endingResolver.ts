import { ENDING_STRATEGIC_COST_THRESHOLD } from '../../config/gameConfig';
import { ENDINGS } from '../../data/narrative/endings';

const getEndingById = (id: 'defeat' | 'strategic' | 'forceful') => {
  const ending = ENDINGS.find((item) => item.id === id);
  if (!ending) throw new Error(`Ending not found: ${id}`);
  return ending;
};

export const resolveEnding = (allCleared: boolean, totalTrapCost: number) => {
  if (!allCleared) return getEndingById('defeat');
  if (totalTrapCost <= ENDING_STRATEGIC_COST_THRESHOLD) return getEndingById('strategic');
  return getEndingById('forceful');
};
