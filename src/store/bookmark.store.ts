import { create } from "zustand";
import { api } from "@/config/axios";

export interface BookmarkedContract {
  id: string;
  contractTitle: string;
  operator: string;
  contractorName: string;
  contractNumber: string;
  year: string;
  contractValue: number;
  bookmarkedAt: string;
}

interface BookmarkState {
  bookmarks: BookmarkedContract[];
  total: number;
  isLoading: boolean;
  error: string | null;

  fetchBookmarks: () => Promise<void>;
  addBookmark: (contractId: string) => Promise<boolean>;
  removeBookmark: (contractId: string) => Promise<boolean>;
  clearAllBookmarks: () => Promise<boolean>;
  isBookmarked: (contractId: string) => boolean;
  clearError: () => void;
}

export const useBookmarkStore = create<BookmarkState>()((set, get) => ({
  bookmarks: [],
  total: 0,
  isLoading: false,
  error: null,

  fetchBookmarks: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get("/contracts/bookmarks");
      if (data.success) {
        set({
          bookmarks: data.data.bookmarks,
          total: data.data.total,
          isLoading: false,
        });
      } else {
        set({ error: data.message, isLoading: false });
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message || "Failed to fetch bookmarks",
        isLoading: false,
      });
    }
  },

  addBookmark: async (contractId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post(`/contracts/bookmarks/${contractId}`);
      if (data.success) {
        // Refresh bookmarks to get full details
        await get().fetchBookmarks();
        return true;
      } else {
        set({ error: data.message, isLoading: false });
        return false;
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message || "Failed to add bookmark",
        isLoading: false,
      });
      return false;
    }
  },

  removeBookmark: async (contractId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.delete(`/contracts/bookmarks/${contractId}`);
      if (data.success) {
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.id !== contractId),
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
        error: error.response?.data?.message || "Failed to remove bookmark",
        isLoading: false,
      });
      return false;
    }
  },

  clearAllBookmarks: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.delete("/contracts/bookmarks");
      if (data.success) {
        set({ bookmarks: [], total: 0, isLoading: false });
        return true;
      } else {
        set({ error: data.message, isLoading: false });
        return false;
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message || "Failed to clear bookmarks",
        isLoading: false,
      });
      return false;
    }
  },

  isBookmarked: (contractId: string) => {
    return get().bookmarks.some((b) => b.id === contractId);
  },

  clearError: () => set({ error: null }),
}));
