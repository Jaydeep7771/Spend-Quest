import { create } from 'zustand';

export const useNotificationStore = create((set) => ({
  toasts: [],
  pushToast: (toast) => set((s) => ({ toasts: [...s.toasts, { id: crypto.randomUUID(), ...toast }] })),
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
}));
