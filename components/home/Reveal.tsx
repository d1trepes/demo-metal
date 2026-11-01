"use client";

import { useRef, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import { useReveal } from "./useReveal";
import s from "./Reveal.module.css";

/**
 * Появление блока при прокрутке, один раз (DESIGN.md → Движение).
 * from="up" — подъём 16 px, from="right" — въезд справа (фура). Без JS, при reduced-motion
 * и если блок уже на экране — просто виден.
 */
export function Reveal({
  from = "up",
  className,
  children,
}: {
  from?: "up" | "right";
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const state = useReveal(ref);

  return (
    <div ref={ref} className={cx(s.reveal, className)} data-reveal={state} data-from={from}>
      {children}
    </div>
  );
}
