import { STORIES } from '../../data/narrative/story';
export const getNarrative = (stageId: string) => STORIES.find((x) => x.stageId === stageId);
