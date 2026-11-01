/**
 * «Вход» в демо-кабинет: пользователь в localStorage. В бою сессия живёт в cookie,
 * а здесь останется только кэш профиля (см. docs/HANDOFF.md → login).
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { login, loginDemo, logout, register } from "../api";
import type { RegisterRequest, User } from "../types";
import { safeJSONStorage } from "./safeStorage";

type AuthState = {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signInDemo: () => Promise<void>;
  signUp: (request: RegisterRequest) => Promise<void>;
  signOut: () => Promise<void>;
  /** Обновить профиль после сохранения реквизитов (updateCompany). */
  setUser: (user: User) => void;
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
      signUp: async (request) => {
        set({ user: await register(request) });
      },
      signOut: async () => {
        await logout();
        set({ user: null });
      },
      setUser: (user) => set({ user }),
    }),
    { name: "prolet-auth", storage: safeJSONStorage, version: 1, partialize: (s) => ({ user: s.user }) },
  ),
);
