import { create } from "zustand";
import { api } from "@/config/axios";

export interface ArchivedContract {
  id: string;
  contractTitle: string;
  operator: string;
  contractorName: string;
  contractNumber: string;
  year: string;
  contractValue: number;
  archivedAt: string;
  archivedBy?: {
    _id: string;
    username: string;
    firstname?: string;
    lastname?: string;
  };
}

interface ArchiveState {
  // User archive
  userArchive: ArchivedContract[];
  userTotal: number;
  // Global archive (admin)
  globalArchive: ArchivedContract[];
  globalTotal: number;
  
  isLoading: boolean;
  error: string | null;

  // User archive actions
  fetchUserArchive: () => Promise<void>;
  archiveForUser: (contractId: string) => Promise<boolean>;
  restoreForUser: (contractId: string) => Promise<boolean>;
  clearUserArchive: () => Promise<boolean>;
  isArchivedByUser: (contractId: string) => boolean;

  // Global archive actions (admin)
  fetchGlobalArchive: () => Promise<void>;
  archiveGlobally: (contractId: string) => Promise<boolean>;
  restoreGlobally: (contractId: string) => Promise<boolean>;
  permanentlyDelete: (contractId: string) => Promise<boolean>;
  emptyGlobalArchive: () => Promise<boolean>;

  clearError: () => void;
}

export const useArchiveStore = create<ArchiveState>()((set, get) => ({
  userArchive: [],
  userTotal: 0,
  globalArchive: [],
  globalTotal: 0,
  isLoading: false,
  error: null,

  // User archive actions
  fetchUserArchive: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get("/contracts/archive/user");
      if (data.success) {
        set({
          userArchive: data.data.archived,
          userTotal: data.data.total,
          isLoading: false,
        });
      } else {
        set({ error: data.message, isLoading: false });
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message || "Failed to fetch archive",
        isLoading: false,
      });
    }
  },

  archiveForUser: async (contractId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post(`/contracts/archive/user/${contractId}`);
      if (data.success) {
        await get().fetchUserArchive();
        return true;
      } else {
        set({ error: data.message, isLoading: false });
        return false;
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message || "Failed to archive contract",
        isLoading: false,
      });
      return false;
    }
  },

  restoreForUser: async (contractId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.delete(`/contracts/archive/user/${contractId}`);
      if (data.success) {
        set((state) => ({
          userArchive: state.userArchive.filter((a) => a.id !== contractId),
          userTotal: state.userTotal - 1,
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
        error: error.response?.data?.message || "Failed to restore contract",
        isLoading: false,
      });
      return false;
    }
  },

  clearUserArchive: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.delete("/contracts/archive/user");
      if (data.success) {
        set({ userArchive: [], userTotal: 0, isLoading: false });
        return true;
      } else {
        set({ error: data.message, isLoading: false });
        return false;
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message || "Failed to clear archive",
        isLoading: false,
      });
      return false;
    }
  },

  isArchivedByUser: (contractId: string) => {
    return get().userArchive.some((a) => a.id === contractId);
  },

  // Global archive actions (admin)
  fetchGlobalArchive: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get("/contracts/archive/global");
      if (data.success) {
        set({
          globalArchive: data.data.archived,
          globalTotal: data.data.total,
          isLoading: false,
        });
      } else {
        set({ error: data.message, isLoading: false });
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message || "Failed to fetch global archive",
        isLoading: false,
      });
    }
  },

  archiveGlobally: async (contractId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post(`/contracts/archive/global/${contractId}`);
      if (data.success) {
        await get().fetchGlobalArchive();
        return true;
      } else {
        set({ error: data.message, isLoading: false });
        return false;
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message || "Failed to archive contract globally",
        isLoading: false,
      });
      return false;
    }
  },

  restoreGlobally: async (contractId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.delete(`/contracts/archive/global/${contractId}`);
      if (data.success) {
        set((state) => ({
          globalArchive: state.globalArchive.filter((a) => a.id !== contractId),
          globalTotal: state.globalTotal - 1,
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
        error: error.response?.data?.message || "Failed to restore contract",
        isLoading: false,
      });
      return false;
    }
  },

  permanentlyDelete: async (contractId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.delete(`/contracts/archive/global/${contractId}/permanent`);
      if (data.success) {
        set((state) => ({
          globalArchive: state.globalArchive.filter((a) => a.id !== contractId),
          globalTotal: state.globalTotal - 1,
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
        error: error.response?.data?.message || "Failed to delete contract",
        isLoading: false,
      });
      return false;
    }
  },

  emptyGlobalArchive: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.delete("/contracts/archive/global");
      if (data.success) {
        set({ globalArchive: [], globalTotal: 0, isLoading: false });
        return true;
      } else {
        set({ error: data.message, isLoading: false });
        return false;
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message || "Failed to empty archive",
        isLoading: false,
      });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
