import { create } from 'zustand';

export const useXPStore = create((set) => ({
  pendingXPToast: null,
  setPendingXPToast: (value) => set({ pendingXPToast: value })
}));
