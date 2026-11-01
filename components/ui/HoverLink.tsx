"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";

/**
 * Ссылка для длинных списков (каталог, таблица): не скачивает страницу заранее, когда просто
 * попала в экран (70 карточек = 70 запросов и разборов при прокрутке — чат 10),
 * а подгружает её при наведении или касании — к клику она уже готова.
 */
export function HoverLink({ href, onPointerEnter, onTouchStart, ...rest }: ComponentProps<typeof Link> & { href: string }) {
  const router = useRouter();
  const warm = () => router.prefetch(href);
  return (
    <Link
      href={href}
      prefetch={false}
      onPointerEnter={(e) => {
        warm();
        onPointerEnter?.(e);
      }}
      onTouchStart={(e) => {
        warm();
        onTouchStart?.(e);
      }}
      {...rest}
    />
  );
}
