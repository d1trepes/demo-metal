import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";
import s from "./Grid.module.css";

type BoxProps = HTMLAttributes<HTMLElement> & { as?: ElementType; children?: ReactNode };


/** Контейнер сетки A: max-width 1440, поля --gutter. Края совпадают с шапкой. */
export function Container({ as: Tag = "div", className, ...rest }: BoxProps) {
  return <Tag className={cx(s.container, className)} {...rest} />;
}

/** 12 колонок (планшет 8, телефон 4), промежуток --grid-gap. */
export function Grid({ as: Tag = "div", className, ...rest }: BoxProps) {
  return <Tag className={cx(s.grid, className)} {...rest} />;
}

/** Типовые места в сетке из DESIGN.md. */
export type ColArea = "full" | "head" | "aside" | "text" | "form" | "formAside";

export function Col({ area = "full", as: Tag = "div", className, ...rest }: BoxProps & { area?: ColArea }) {
  return <Tag className={cx(s[area], className)} {...rest} />;
}
