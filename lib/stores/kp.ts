/** Список для КП (паспорт §5): позиции, количество, длина, комментарий. Хранится в localStorage. */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { KpItem } from "../types";
import { safeJSONStorage } from "./safeStorage";

type KpState = {
  items: KpItem[];
  /** Добавить позицию; если уже есть — увеличить количество. */
  add: (item: KpItem) => void;
  update: (productId: string, patch: Partial<Omit<KpItem, "productId">>) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

export const useKpStore = create<KpState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (!existing) return { items: [...state.items, item] };
          return {
            items: state.items.map((i) =>
              i.productId === item.productId ? { ...i, ...item, quantity: i.quantity + item.quantity } : i,
            ),
          };
        }),
      update: (productId, patch) =>
        set((state) => ({ items: state.items.map((i) => (i.productId === productId ? { ...i, ...patch } : i)) })),
      remove: (productId) => set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      clear: () => set({ items: [] }),
    }),
    { name: "prolet-kp", storage: safeJSONStorage, version: 1 },
  ),
);
