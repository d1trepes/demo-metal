import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";
import s from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "onInk" | "onInkOutline";

type CommonProps = {
  variant?: ButtonVariant;
  size?: "md" | "sm";
  block?: boolean;
  className?: string;
  children: ReactNode;
};

type AsButton = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type AsLink = CommonProps & { href: string; "aria-label"?: string };

/** Кнопка. С href — ссылка next/link, без — <button>. */
export function Button(props: AsButton | AsLink) {
  const { variant = "primary", size = "md", block, className, children } = props;
  const classes = cx(s.btn, s[variant], size === "sm" && s.sm, block && s.block, className);
  // Строковый текст — в span, чтобы заглавные стояли ровно по центру (.caps-center).
  const content = wrapText(children);

  if (props.href !== undefined) {
    return (
      <Link href={props.href} className={classes} aria-label={props["aria-label"]}>
        {content}
      </Link>
    );
  }

  const { variant: _v, size: _s, block: _b, className: _c, children: _ch, type = "button", ...rest } = props;
  return (
    <button type={type} className={classes} {...rest}>
      {content}
    </button>
  );
}

function wrapText(children: ReactNode): ReactNode {
  const items = Array.isArray(children) ? children : [children];
  return items.map((child, i) =>
    typeof child === "string" || typeof child === "number" ? (
      <span key={i} className="caps-center">
        {child}
      </span>
    ) : (
      child
    ),
  );
}
