import { create } from 'zustand';
import type { User } from '../types';
import { api } from '../api/client';

interface AuthStore {
  user: User | null;
  token: string | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, pass: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (fullName: string, email: string, pass: string, confirmPass: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const TOKEN_KEY = 'ssp_auth_token';
const USER_KEY = 'ssp_auth_user';

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: (() => {
    try {
      const u = localStorage.getItem(USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })(),
  token: localStorage.getItem(TOKEN_KEY),
  loading: false,
  initialized: false,

  setUser: (user) => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
    set({ user });
  },

  setToken: (token) => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
    set({ token });
  },

  login: async (email, pass) => {
    set({ loading: true });
    const res = await api.auth.login(email, pass);
    set({ loading: false });
    if (res.ok) {
      get().setUser(res.data.user);
      get().setToken(res.data.token);
      return { ok: true };
    }
    return { ok: false, error: res.error };
  },

  signup: async (fullName, email, pass, confirmPass) => {
    set({ loading: true });
    const res = await api.auth.signup(fullName, email, pass, confirmPass);
    set({ loading: false });
    if (res.ok) {
      get().setUser(res.data.user);
      get().setToken(res.data.token);
      return { ok: true };
    }
    return { ok: false, error: res.error };
  },

  logout: async () => {
    try {
      await api.auth.logout();
    } catch {
      // Ignore network errors on logout
    }
    get().setUser(null);
    get().setToken(null);
  },

  checkAuth: async () => {
    const token = get().token;
    if (!token) {
      set({ user: null, initialized: true });
      return;
    }
    set({ loading: true });
    const res = await api.auth.me();
    set({ loading: false, initialized: true });
    if (res.ok) {
      get().setUser(res.data);
    } else {
      get().setUser(null);
      get().setToken(null);
    }
  },
}));
