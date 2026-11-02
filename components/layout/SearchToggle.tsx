"use client";

import { usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { create } from "zustand";
import { cx } from "@/lib/cx";

/**
 * Поиск в шапке на телефоне (решение 1б, чат 11б): второй строкой — только на главной и в каталоге,
 * на остальных страницах — лупа в шапке, по нажатию открывается та же строка поиска с подсказками.
 */
export const useMobileSearch = create<{ open: boolean; setOpen: (open: boolean) => void }>()((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));

/** Страницы, где поиск на телефоне всегда виден второй строкой. */
export function isSearchPinned(pathname: string) {
  return pathname === "/" || pathname.startsWith("/catalog");
}

/** Лупа в шапке (только ≤ 640 px и только там, где поиск свёрнут). */
export function SearchToggle({ className }: { className?: string }) {
  const pathname = usePathname();
  const { open, setOpen } = useMobileSearch();
  if (isSearchPinned(pathname)) return null;

  return (
    <button
      type="button"
      className={cx(className)}
      aria-expanded={open}
      aria-controls="header-search"
      data-search-toggle
      onClick={() => setOpen(!open)}
    >
      {open ? <X aria-hidden="true" /> : <Search aria-hidden="true" />}
      <span className="visually-hidden">{open ? "Закрыть поиск" : "Поиск по каталогу"}</span>
    </button>
  );
}
