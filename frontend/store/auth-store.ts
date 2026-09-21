import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "Admin" | "RH" | "Manager" | "Staff";

export interface AuthUser {
  id_user: number;
  username: string;
  role: UserRole;
  personnel_id: number | null;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;

  setTokens: (
    accessToken: string,
    refreshToken: string
  ) => void;

  setUser: (user: AuthUser) => void;

  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,

      setTokens: (accessToken, refreshToken) =>
        set({
          accessToken,
          refreshToken,
        }),

      setUser: (user) =>
        set({
          user,
        }),

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
        }),
    }),
    {
      name: "personnel-auth",
    }
  )
);