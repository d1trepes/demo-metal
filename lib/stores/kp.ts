/**
 * Список для КП (паспорт §5): позиции, количество, длина, комментарий. Хранится в localStorage.
 * lastAdded — событие для уведомления в шапке (KpToast), в localStorage не пишется.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { KpItem } from "../types";
import { safeJSONStorage } from "./safeStorage";

type KpState = {
  items: KpItem[];
  /** Последнее добавление: текст уведомления и номер события (новое добавление того же — новое уведомление). */
  lastAdded: { label: string; seq: number } | null;
  /** Добавить позицию; если уже есть — увеличить количество. label — текст уведомления «Добавлено: …». */
  add: (item: KpItem, label?: string) => void;
  dismissAdded: () => void;
  update: (productId: string, patch: Partial<Omit<KpItem, "productId">>) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

export const useKpStore = create<KpState>()(
  persist(
    (set) => ({
      items: [],
      lastAdded: null,
      add: (item, label) =>
        set((state) => {
          const lastAdded = label ? { label, seq: (state.lastAdded?.seq ?? 0) + 1 } : state.lastAdded;
          const existing = state.items.find((i) => i.productId === item.productId);
          if (!existing) return { items: [...state.items, item], lastAdded };
          return {
            lastAdded,
            items: state.items.map((i) =>
              i.productId === item.productId ? { ...i, ...item, quantity: i.quantity + item.quantity } : i,
            ),
          };
        }),
      update: (productId, patch) =>
        set((state) => ({ items: state.items.map((i) => (i.productId === productId ? { ...i, ...patch } : i)) })),
      remove: (productId) => set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      clear: () => set({ items: [] }),
      dismissAdded: () => set({ lastAdded: null }),
    }),
    { name: "prolet-kp", storage: safeJSONStorage, version: 1, partialize: (state) => ({ items: state.items }) },
  ),
);
