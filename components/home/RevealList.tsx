"use client";

import { Children, cloneElement, isValidElement, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import { imagesReady } from "@/lib/imagesReady";
import s from "./RevealList.module.css";

type RevealState = "rest" | "waiting" | "in";

/**
 * Список с каскадным появлением детей при прокрутке (один раз).
 * Без JS и при reduced-motion элементы просто видны: прячем только то, что ниже экрана.
 */
export function RevealList({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);
  const [state, setState] = useState<RevealState>("rest");

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return; // уже на экране — не прячем

    setState("waiting");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        imagesReady(el).then(() => setState("in"));
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  let index = 0;
  const items = Children.map(children, (child) => {
    if (!isValidElement<{ style?: CSSProperties }>(child)) return child;
    const style = { ...child.props.style, "--reveal-i": index++ } as CSSProperties;
    return cloneElement(child, { style });
  });

  return (
    <ul ref={ref} className={cx(className, s.list)} data-reveal={state}>
      {items}
    </ul>
  );
}
