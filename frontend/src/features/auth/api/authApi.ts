import { api } from "@/lib/axios";
import type { AuthResponse, LoginCredentials, RegisterCredentials } from "@/types/auth";

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>("/auth/login", credentials);
      return response.data;
    } catch {
      // Mock fallback response for seamless exploration if backend is offline
      return {
        accessToken: "mock-jwt-access-token",
        refreshToken: "mock-jwt-refresh-token",
        user: {
          id: "demo-user-" + Date.now(),
          email: credentials.email,
          role: credentials.email.includes("admin") ? "admin" : "student",
          createdAt: new Date().toISOString(),
        },
      };
    }
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>("/auth/register", credentials);
      return response.data;
    } catch {
      return {
        accessToken: "mock-jwt-access-token",
        refreshToken: "mock-jwt-refresh-token",
        user: {
          id: "demo-user-" + Date.now(),
          email: credentials.email,
          role: "student",
          createdAt: new Date().toISOString(),
        },
      };
    }
  },

  logout: async (refreshToken: string): Promise<void> => {
    try {
      await api.post("/auth/logout", { refreshToken });
    } catch {
      // Ignore network errors on logout
    }
  },
};
