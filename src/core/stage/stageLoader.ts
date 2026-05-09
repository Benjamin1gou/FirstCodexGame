import { STAGES } from './stageRepository';
export const loadStageByIndex = (index: number) => STAGES[index];
export const getStageCount = () => STAGES.length;
