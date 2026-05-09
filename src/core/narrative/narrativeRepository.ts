import { STORIES } from '../../data/narrative/story';

export const getNarrative = (stageId: string) => {
  const narrative = STORIES.find((item) => item.stageId === stageId);
  if (!narrative) throw new Error(`Narrative not found for stageId: ${stageId}`);
  return narrative;
};
