"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import s from "./Reveal.module.css";

type RevealState = "rest" | "waiting" | "in";

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
  const [state, setState] = useState<RevealState>("rest");

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    setState("waiting");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setState("in");
        observer.disconnect();
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={cx(s.reveal, className)} data-reveal={state} data-from={from}>
      {children}
    </div>
  );
}
