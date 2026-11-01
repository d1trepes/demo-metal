/** Избранное: id позиций. Хранится в localStorage. */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { safeJSONStorage } from "./safeStorage";

type FavoritesState = {
  ids: string[];
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => set((s) => ({ ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [...s.ids, id] })),
      has: (id) => get().ids.includes(id),
    }),
    { name: "prolet-favorites", storage: safeJSONStorage, version: 1 },
  ),
);
