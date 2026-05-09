import { getNarrative } from './narrativeRepository';
export const getOpeningDialogue = (stageId: string) => getNarrative(stageId);
