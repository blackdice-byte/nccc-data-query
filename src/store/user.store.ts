import { create } from "zustand";
import { api } from "@/config/axios";

export interface User {
  _id: string;
  username: string;
  email: string;
  firstname?: string;
  lastname?: string;
  avatar?: string;
  role: string;
  authProvider: string;
  createdAt: string;
}

export interface UserStats {
  totalUsers: number;
  adminCount: number;
  userCount: number;
  recentUsers: {
    username: string;
    email: string;
    createdAt: string;
  }[];
}

interface UserState {
  users: User[];
  stats: UserStats | null;
  isLoading: boolean;
  error: string | null;

  fetchUsers: () => Promise<void>;
  fetchUserStats: () => Promise<void>;
  updateUserRole: (userId: string, role: "user" | "admin") => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  clearError: () => void;
}

export const useUserStore = create<UserState>()((set) => ({
  users: [],
  stats: null,
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get("/admin");
      if (data.success) {
        set({ users: data.data, isLoading: false });
      } else {
        set({ error: data.message, isLoading: false });
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message || "Failed to fetch users",
        isLoading: false,
      });
    }
  },

  fetchUserStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get("/admin/stats");
      if (data.success) {
        set({ stats: data.data, isLoading: false });
      } else {
        set({ error: data.message, isLoading: false });
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message || "Failed to fetch user stats",
        isLoading: false,
      });
    }
  },

  updateUserRole: async (userId: string, role: "user" | "admin") => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.patch(`/admin/${userId}/role`, { role });
      if (data.success) {
        set((state) => ({
          users: state.users.map((u) =>
            u._id === userId ? { ...u, role } : u
          ),
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
        error: error.response?.data?.message || "Failed to update user role",
        isLoading: false,
      });
      return false;
    }
  },

  deleteUser: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.delete(`/admin/${userId}`);
      if (data.success) {
        set((state) => ({
          users: state.users.filter((u) => u._id !== userId),
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
        error: error.response?.data?.message || "Failed to delete user",
        isLoading: false,
      });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
