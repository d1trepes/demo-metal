"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth";
import { useHydrated } from "@/lib/stores/useHydrated";

/**
 * Кнопка кабинета в шапке. Иконка без подписи непонятна (ревью чата 9), поэтому подпись видна всегда:
 * «Войти» → /login/, после входа — «Кабинет» → /account/. Классы приходят из шапки.
 */
export function AccountLink({ className, textClassName }: { className?: string; textClassName?: string }) {
  const hydrated = useHydrated();
  const signedIn = useAuthStore((st) => Boolean(st.user));
  const inside = hydrated && signedIn;
  return (
    <Link href={inside ? "/account/" : "/login/"} className={className}>
      <UserRound aria-hidden="true" />
      <span className={textClassName}>{inside ? "Кабинет" : "Войти"}</span>
    </Link>
  );
}
