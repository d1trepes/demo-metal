"use client";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useFavoritesStore } from "@/lib/stores/favorites";
import { useHydrated } from "@/lib/stores/useHydrated";
import s from "./FavoriteButton.module.css";

/** «В избранное» — сохраняется в браузере, список виден в кабинете (/account/favorites). */
export function FavoriteButton({ productId }: { productId: string }) {
  const hydrated = useHydrated();
  const active = useFavoritesStore((st) => st.ids.includes(productId)) && hydrated;
  const toggle = useFavoritesStore((st) => st.toggle);
  return (
    <Button variant="secondary" onClick={() => toggle(productId)} aria-pressed={active} className={active ? s.active : undefined}>
      <Heart aria-hidden="true" />
      {active ? "В избранном" : "В избранное"}
    </Button>
  );
}
