/**
 * «Вход» в демо-кабинет: пользователь в localStorage. В бою сессия живёт в cookie,
 * а здесь останется только кэш профиля (см. docs/HANDOFF.md → login).
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { login, loginDemo, logout } from "../api";
import type { User } from "../types";
import { safeJSONStorage } from "./safeStorage";

type AuthState = {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signInDemo: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      signIn: async (email, password) => {
        set({ user: await login(email, password) });
      },
      signInDemo: async () => {
        set({ user: await loginDemo() });
      },
      signOut: async () => {
        await logout();
        set({ user: null });
      },
    }),
    { name: "prolet-auth", storage: safeJSONStorage, version: 1, partialize: (s) => ({ user: s.user }) },
  ),
);
