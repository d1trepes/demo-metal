"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import s from "./StickyHeader.module.css";

/**
 * Липкая шапка главной (чат 5): ставится сразу после Hero. Пока виден первый экран — спрятана
 * (и недоступна с клавиатуры), как только низ hero уходит под верх экрана — выезжает сверху.
 */
export function StickyHeader({ children }: { children: ReactNode }) {
  const sentinel = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      setShown(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinel} className={s.sentinel} aria-hidden="true" />
      <div className={s.wrap} data-shown={shown || undefined} inert={!shown}>
        {children}
      </div>
    </>
  );
}
