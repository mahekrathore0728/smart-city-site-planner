import { create } from 'zustand';
import type { AuthUser, Project, ToastMessage } from '../types';

const storedToken = typeof window !== 'undefined' ? localStorage.getItem('urbanplan_token') : null;
const storedUserJson = typeof window !== 'undefined' ? localStorage.getItem('urbanplan_user') : null;
let parsedUser: AuthUser | null = null;
if (storedUserJson) {
  try { parsedUser = JSON.parse(storedUserJson); } catch { parsedUser = null; }
}

interface AppStore {
  // Authentication
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;

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
  user: parsedUser || (storedToken ? { id: 'usr_demo', full_name: 'Urban Planner', email: 'planner@urbanplan.io' } : null),
  token: storedToken,
  isAuthenticated: Boolean(storedToken),
  login: (token, user) => {
    localStorage.setItem('urbanplan_token', token);
    localStorage.setItem('urbanplan_user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('urbanplan_token');
    localStorage.removeItem('urbanplan_user');
    set({ token: null, user: null, isAuthenticated: false, currentProject: null });
  },

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
