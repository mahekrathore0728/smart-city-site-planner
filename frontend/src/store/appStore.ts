import { create } from 'zustand';
import type { Project, ToastMessage } from '../types';

interface AppStore {
  // Current project
  currentProject: Project | null;
  setCurrentProject: (p: Project | null) => void;

  // Toast notifications
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], message: string) => void;
  removeToast: (id: string) => void;

  // Sidebar state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Global loading
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
}

let toastCounter = 0;

export const useAppStore = create<AppStore>((set) => ({
  currentProject: null,
  setCurrentProject: (p) => set({ currentProject: p }),

  toasts: [],
  addToast: (type, message) => {
    const id = `toast-${++toastCounter}`;
    set((state) => ({
      toasts: [...state.toasts, { id, type, message }],
    }));
    // Auto-remove after 4 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  globalLoading: false,
  setGlobalLoading: (loading) => set({ globalLoading: loading }),
}));

// Convenience hooks
export const useToast = () => {
  const addToast = useAppStore((s) => s.addToast);
  return {
    success: (msg: string) => addToast('success', msg),
    error: (msg: string) => addToast('error', msg),
    info: (msg: string) => addToast('info', msg),
  };
};
