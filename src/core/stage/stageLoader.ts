import type { StageDefinition } from './stageTypes';
import { STAGES } from './stageRepository';

const assertStage = (stage: StageDefinition): StageDefinition => {
  if (!stage) throw new Error('Stage is undefined');
  if (!stage.id || !stage.name) throw new Error('Stage metadata is missing');
  if (!Number.isInteger(stage.width) || !Number.isInteger(stage.height) || stage.width <= 0 || stage.height <= 0) throw new Error(`Invalid stage dimensions: ${stage.id}`);
  if (stage.tiles.length !== stage.height) throw new Error(`Invalid stage height: ${stage.id}`);
  const invalidRow = stage.tiles.find((row) => row.length !== stage.width);
  if (invalidRow) throw new Error(`Invalid stage width: ${stage.id}`);
  return stage;
};

export const loadStageByIndex = (index: number): StageDefinition => {
  if (!Number.isInteger(index) || index < 0) throw new Error(`Invalid stage index: ${index}`);
  const stage = STAGES[index];
  if (!stage) throw new Error(`Stage index out of range: ${index}`);
  return assertStage(stage);
};

export const getStageCount = (): number => STAGES.length;
