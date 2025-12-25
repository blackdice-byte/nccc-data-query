import { create } from "zustand";
import { api } from "@/config/axios";

export interface SearchHistoryItem {
  _id: string;
  query: string;
  resultsCount: number;
  tab: string;
  createdAt: string;
}

interface HistoryState {
  history: SearchHistoryItem[];
  total: number;
  isLoading: boolean;
  error: string | null;

  fetchHistory: () => Promise<void>;
  deleteHistory: (id: string) => Promise<boolean>;
  clearAllHistory: () => Promise<boolean>;
  clearError: () => void;
}

export const useHistoryStore = create<HistoryState>()((set) => ({
  history: [],
  total: 0,
  isLoading: false,
  error: null,

  fetchHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get("/contracts/search/history");
      if (data.success) {
        set({
          history: data.data.history,
          total: data.data.total,
          isLoading: false,
        });
      } else {
        set({ error: data.message, isLoading: false });
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message || "Failed to fetch history",
        isLoading: false,
      });
    }
  },

  deleteHistory: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.delete(`/contracts/search/history/${id}`);
      if (data.success) {
        set((state) => ({
          history: state.history.filter((item) => item._id !== id),
          total: state.total - 1,
          isLoading: false,
        }));
        return true;
      } else {
        set({ error: data.message, isLoading: false });
        return false;
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message || "Failed to delete history",
        isLoading: false,
      });
      return false;
    }
  },

  clearAllHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.delete("/contracts/search/history");
      if (data.success) {
        set({ history: [], total: 0, isLoading: false });
        return true;
      } else {
        set({ error: data.message, isLoading: false });
        return false;
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message || "Failed to clear history",
        isLoading: false,
      });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
