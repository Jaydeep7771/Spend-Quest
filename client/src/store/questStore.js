import { create } from 'zustand';

export const useQuestStore = create((set) => ({
  difficultyFilter: 'all',
  setDifficultyFilter: (difficultyFilter) => set({ difficultyFilter })
}));
