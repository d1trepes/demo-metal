"use client";

import { Children, cloneElement, isValidElement, useRef, type CSSProperties, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import { useReveal } from "./useReveal";
import s from "./RevealList.module.css";

/**
 * Список с каскадным появлением детей при прокрутке (один раз).
 * Без JS и при reduced-motion элементы просто видны: прячем только то, что ниже экрана.
 */
export function RevealList({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);
  const state = useReveal(ref);

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
