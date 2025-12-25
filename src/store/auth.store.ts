import { create } from "zustand";
import { api } from "@/config/axios";
import { API_URL } from "@/constants";
import { type IAuthUser } from "@/interface/user";

// Recent search type
export interface RecentSearch {
  _id: string;
  query: string;
  resultsCount: number;
  tab: string;
  createdAt: string;
}

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USER: "user",
  RECENT_SEARCHES: "recentSearches",
} as const;

// Storage helpers
const storage = {
  setTokens: (accessToken: string, refreshToken: string | null) => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
  },
  setUser: (user: IAuthUser) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },
  setRecentSearches: (searches: RecentSearch[]) => {
    localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(searches));
  },
  getAccessToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },
  getRefreshToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },
  getUser: (): IAuthUser | null => {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as IAuthUser;
    } catch {
      return null;
    }
  },
  getRecentSearches: (): RecentSearch[] => {
    const searchesStr = localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
    if (!searchesStr) return [];
    try {
      return JSON.parse(searchesStr) as RecentSearch[];
    } catch {
      return [];
    }
  },
  clear: () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.RECENT_SEARCHES);
  },
};

interface AuthState {
  user: IAuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  recentSearches: RecentSearch[];
  isLoading: boolean;
  error: string | null;

  signin: (email: string, password: string) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  googleSignin: (code: string) => Promise<boolean>;
  verifyAccount: (userId: string) => Promise<void>;
  fetchMe: () => Promise<boolean>;
  logout: () => void;
  setAuth: (user: IAuthUser, accessToken: string, refreshToken: string) => void;
  setRecentSearches: (searches: RecentSearch[]) => void;
  clearError: () => void;
  initializeFromStorage: () => Promise<void>;
}

interface SignupData {
  email: string;
  username: string;
  password: string;
  firstname?: string;
  lastname?: string;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  recentSearches: [],
  isLoading: false,
  error: null,

  signin: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post("/auth/signin", { email, password });
      if (data.success) {
        const { user, accessToken, refreshToken, recentSearches = [] } = data.data;
        storage.setTokens(accessToken, refreshToken);
        storage.setUser(user);
        storage.setRecentSearches(recentSearches);
        set({
          user,
          accessToken,
          refreshToken,
          recentSearches,
          isLoading: false,
        });
        return true;
      } else {
        set({ error: data.message, isLoading: false });
        return false;
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message || "Sign in failed",
        isLoading: false,
      });
      return false;
    }
  },

  signup: async (signupData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post("/auth/signup", signupData);
      if (data.success) {
        set({ isLoading: false });
        return true;
      } else {
        set({ error: data.message, isLoading: false });
        return false;
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message || "Sign up failed",
        isLoading: false,
      });
      return false;
    }
  },

  googleSignin: async (code) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(
        `${API_URL}/api/v1/auth/google-signin/callback?code=${code}`
      );
      const data = await response.json();

      if (data.success) {
        const { user, accessToken, refreshToken, recentSearches = [] } = data.data;
        storage.setTokens(accessToken, refreshToken);
        storage.setUser(user);
        storage.setRecentSearches(recentSearches);
        set({
          user,
          accessToken,
          refreshToken,
          recentSearches,
          isLoading: false,
        });
        return true;
      } else {
        set({
          error: data.message || "Authentication failed",
          isLoading: false,
        });
        return false;
      }
    } catch (err: unknown) {
      console.error(err);
      set({
        error: "Failed to complete authentication",
        isLoading: false,
      });
      return false;
    }
  },

  verifyAccount: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post("/auth/verify", { userId });
      if (data.success) {
        set({ isLoading: false });
      } else {
        set({ error: data.message, isLoading: false });
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message || "Verification failed",
        isLoading: false,
      });
    }
  },

  logout: () => {
    storage.clear();
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      recentSearches: [],
    });
  },

  setAuth: (user, accessToken, refreshToken) => {
    storage.setTokens(accessToken, refreshToken);
    storage.setUser(user);
    set({ user, accessToken, refreshToken });
  },

  setRecentSearches: (searches) => {
    storage.setRecentSearches(searches);
    set({ recentSearches: searches });
  },

  fetchMe: async () => {
    const accessToken = storage.getAccessToken();
    if (!accessToken) return false;

    try {
      const { data } = await api.get("/auth/me");
      if (data.success) {
        const { user, recentSearches = [] } = data.data;
        storage.setUser(user);
        storage.setRecentSearches(recentSearches);
        set({
          user,
          accessToken,
          refreshToken: storage.getRefreshToken(),
          recentSearches,
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  initializeFromStorage: async () => {
    const accessToken = storage.getAccessToken();
    const refreshToken = storage.getRefreshToken();
    const user = storage.getUser();
    const recentSearches = storage.getRecentSearches();

    if (accessToken && user) {
      set({ user, accessToken, refreshToken, recentSearches });

      // Fetch fresh user data in background
      useAuthStore.getState().fetchMe();
    }
  },

  clearError: () => set({ error: null }),
}));
