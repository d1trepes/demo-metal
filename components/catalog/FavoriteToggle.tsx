"use client";
import { Heart } from "lucide-react";
import { cx } from "@/lib/cx";
import { useFavoritesStore } from "@/lib/stores/favorites";
import { useHydrated } from "@/lib/stores/useHydrated";
import s from "./FavoriteToggle.module.css";

type Props = {
  productId: string;
  /** Для подписи кнопки: «Добавить в избранное: Уголок 25×25×3 мм». */
  productName: string;
  /** sm — иконка 36 px без рамки (плитка, таблица); md — квадрат 48 px с рамкой (калькулятор карточки). */
  size?: "sm" | "md";
  className?: string;
};

/**
 * Сердце «В избранное» — одно на плитку, строку таблицы и карточку (чат 6б).
 * Хранится в браузере (lib/stores/favorites.ts), список виден в кабинете (/account/favorites).
 */
export function FavoriteToggle({ productId, productName, size = "sm", className }: Props) {
  const hydrated = useHydrated();
  const active = useFavoritesStore((st) => st.ids.includes(productId)) && hydrated;
  const toggle = useFavoritesStore((st) => st.toggle);
  return (
    <button
      type="button"
      className={cx(s.toggle, s[size], active && s.active, className)}
      aria-pressed={active}
      aria-label={`${active ? "Убрать из избранного" : "В избранное"}: ${productName}`}
      title={active ? "В избранном" : "В избранное"}
      onClick={() => toggle(productId)}
    >
      <Heart aria-hidden="true" />
    </button>
  );
}
