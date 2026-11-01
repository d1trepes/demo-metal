"use client";
import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useKpStore } from "@/lib/stores/kp";
import { useHydrated } from "@/lib/stores/useHydrated";
import type { KpItem } from "@/lib/types";

type Props = {
  item: KpItem;
  /** Текст уведомления в шапке: «Уголок 25×25×3 мм, 1 хлыст» (lib/calc.ts → kpItemLabel). */
  notice: string;
  size?: "md" | "sm";
  variant?: "primary" | "secondary";
  block?: boolean;
  /** Подпись до добавления. */
  label?: string;
  className?: string;
  disabled?: boolean;
};

/**
 * «В список КП». Если позиция уже в списке — кнопка становится ссылкой «В списке КП» на /kp/.
 * В карточке товара передаём количество и длину из калькулятора; повторное нажатие там добавляет ещё.
 */
export function AddToKpButton({ item, notice, size = "sm", variant = "secondary", block, label = "В список КП", className, disabled }: Props) {
  const hydrated = useHydrated();
  const inList = useKpStore((s) => s.items.some((i) => i.productId === item.productId));
  const add = useKpStore((s) => s.add);

  if (hydrated && inList && size === "sm") {
    return (
      <Button href="/kp/" variant="ghost" size={size} block={block} className={className} aria-label="Позиция в списке КП — открыть список">
        <Check aria-hidden="true" />
        В списке КП
      </Button>
    );
  }
  return (
    <Button variant={variant} size={size} block={block} className={className} disabled={disabled}
      onClick={() => add(item, notice)}
    >
      <Plus aria-hidden="true" />
      {label}
    </Button>
  );
}
