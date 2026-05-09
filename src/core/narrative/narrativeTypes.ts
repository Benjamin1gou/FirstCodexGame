export type NarrativeDefinition = {
  stageId: string;
  openingNarration: string;
  demonLordLines: string[];
  heroLines: string[];
  clearText: string;
  defeatText: string;
};

export type EndingDefinition = {
  id: string;
  name: string;
  conditionType: 'strategic' | 'forceful' | 'defeat';
  text: string;
};
