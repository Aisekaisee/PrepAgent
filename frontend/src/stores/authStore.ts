import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Role } from "@/types/auth";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
  loginAsDemo: (role?: Role) => void;
}

const DEMO_STUDENT: User = {
  id: "demo-student-id-001",
  email: "student@prepagent.ai",
  role: "student",
  createdAt: new Date().toISOString(),
};

const DEMO_ADMIN: User = {
  id: "demo-admin-id-999",
  email: "admin@prepagent.ai",
  role: "admin",
  createdAt: new Date().toISOString(),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: DEMO_STUDENT, // Initialized with demo user for instant smooth interactive exploration
      accessToken: "demo-jwt-access-token",
      refreshToken: "demo-jwt-refresh-token",
      isAuthenticated: true,

      setAuth: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),

      setTokens: (accessToken, refreshToken) =>
        set((state) => ({
          accessToken,
          refreshToken: refreshToken ?? state.refreshToken,
        })),

      updateUser: (partialUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partialUser } : null,
        })),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      loginAsDemo: (role: Role = "student") => {
        const demoUser = role === "admin" ? DEMO_ADMIN : DEMO_STUDENT;
        set({
          user: demoUser,
          accessToken: `demo-${role}-jwt-token`,
          refreshToken: `demo-${role}-refresh-token`,
          isAuthenticated: true,
        });
      },
    }),
    {
      name: "prepagent_auth",
    }
  )
);
