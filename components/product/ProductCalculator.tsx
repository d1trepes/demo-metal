"use client";
import { Check, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { AddToKpButton } from "@/components/catalog/AddToKpButton";
import { calcItem, piecesForTons, stockLengths } from "@/lib/calc";
import { cx } from "@/lib/cx";
import { formatNumber, formatPrice, formatWeight, plural } from "@/lib/format";
import { useKpStore } from "@/lib/stores/kp";
import type { Product } from "@/lib/types";
import s from "./ProductCalculator.module.css";

type Mode = "pieces" | "tons";

/** Как называем штуку: хлыст, лист, карта; для бухты считаем метрами. */
function pieceForms(product: Product, coil: boolean): [string, string, string] {
  if (coil) return ["метр", "метра", "метров"];
  if (product.category === "list") return ["лист", "листа", "листов"];
  if (product.category === "setka") return ["карта", "карты", "карт"];
  return ["хлыст", "хлыста", "хлыстов"];
}

const toNumber = (value: string) => Number(value.replace(",", ".").replace(/[^\d.]/g, "")) || 0;

/**
 * Калькулятор массы и стоимости (паспорт §5, формулы — lib/calc.ts).
 * Длинномер: длина хлыста (складская или «в размер») × количество; можно задать сразу тонны.
 * Лист и сетка: количество листов/карт или тонны. Бухта (арматура ⌀6): метры или тонны.
 */
export function ProductCalculator({ product }: { product: Product }) {
  const id = useId();
  const lengths = stockLengths(product);
  const coil = product.unit === "м" && lengths.length === 0;
  const forms = pieceForms(product, coil);

  const [mode, setMode] = useState<Mode>("pieces");
  const [length, setLength] = useState<number | "custom">(lengths[0] ?? 1);
  const [customLength, setCustomLength] = useState("3");
  const [qtyInput, setQtyInput] = useState(coil ? "100" : "10");
  const [tonsInput, setTonsInput] = useState("1");
  const [added, setAdded] = useState<number | null>(null);
  const kpCount = useKpStore((st) => st.items.length);

  const pieceLength = coil ? 1 : length === "custom" ? Math.min(12, Math.max(0.1, toNumber(customLength))) : length;
  const pieces = mode === "tons" ? piecesForTons(product, toNumber(tonsInput), pieceLength) : Math.max(0, Math.round(toNumber(qtyInput)));
  const result = calcItem(product, { quantity: pieces, length: pieceLength });

  const step = (delta: number) => {
    setAdded(null);
    setQtyInput(String(Math.max(0, Math.round(toNumber(qtyInput)) + delta)));
  };

  return (
    <div className={s.calc}>
      <div className={s.head}>
        <h2 className={s.title}>Расчёт массы и стоимости</h2>
        <div className={s.modes} role="group" aria-label="Что знаете">
          <button type="button" aria-pressed={mode === "pieces"} onClick={() => setMode("pieces")}>
            {coil ? "Метры" : "Штуки"}
          </button>
          <button type="button" aria-pressed={mode === "tons"} onClick={() => setMode("tons")}>
            Тонны
          </button>
        </div>
      </div>

      {product.unit === "м" && !coil && (
        <fieldset className={s.lengths}>
          <legend className={s.label}>Длина хлыста</legend>
          <div className={s.chips}>
            {lengths.map((l) => (
              <button key={l} type="button" className={s.chip} aria-pressed={length === l} onClick={() => setLength(l)}>
                {formatNumber(l, 1)} м
              </button>
            ))}
            <button type="button" className={s.chip} aria-pressed={length === "custom"} onClick={() => setLength("custom")}>
              В размер
            </button>
            {length === "custom" && (
              <label className={s.inline}>
                <input
                  inputMode="decimal"
                  value={customLength}
                  onChange={(e) => setCustomLength(e.target.value)}
                  aria-label="Длина реза, м"
                  className={s.input}
                />
                <span>м</span>
              </label>
            )}
          </div>
        </fieldset>
      )}

      {mode === "pieces" ? (
        <div className={s.row}>
          <label htmlFor={`${id}-qty`} className={s.label}>
            Количество, {coil ? "м" : forms[2]}
          </label>
          <div className={s.stepper}>
            <button type="button" onClick={() => step(coil ? -10 : -1)} aria-label="Меньше">
              <Minus aria-hidden="true" />
            </button>
            <input
              id={`${id}-qty`}
              inputMode="numeric"
              value={qtyInput}
              onChange={(e) => {
                setAdded(null);
                setQtyInput(e.target.value);
              }}
              className={s.input}
            />
            <button type="button" onClick={() => step(coil ? 10 : 1)} aria-label="Больше">
              <Plus aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : (
        <div className={s.row}>
          <label htmlFor={`${id}-tons`} className={s.label}>
            Нужно, т
          </label>
          <input
            id={`${id}-tons`}
            inputMode="decimal"
            value={tonsInput}
            onChange={(e) => {
              setAdded(null);
              setTonsInput(e.target.value);
            }}
            className={cx(s.input, s.wide)}
          />
        </div>
      )}

      <dl className={s.result} aria-live="polite">
        <div>
          <dt>{mode === "tons" ? "Это" : "Количество"}</dt>
          <dd>
            {formatNumber(pieces, 0)} {plural(pieces, forms)}
            {result.meters !== undefined && !coil && <span> · {formatNumber(result.meters, 1)} м</span>}
            {result.squareMeters !== undefined && <span> · {formatNumber(result.squareMeters, 1)} м²</span>}
          </dd>
        </div>
        <div>
          <dt>Масса</dt>
          <dd>{formatWeight(result.weightKg)}</dd>
        </div>
        <div className={s.total}>
          <dt>Стоимость с НДС</dt>
          <dd>≈ {formatPrice(Math.round(result.priceRub / 10) * 10)}</dd>
        </div>
      </dl>
      <p className={s.note}>
        По теоретической массе и цене {formatPrice(product.pricePerTon, "т")}, без резки и доставки. Точная сумма — в КП.
      </p>

      <div className={s.actions}>
        <AddToKpButton
          item={{ productId: product.id, quantity: pieces, length: pieceLength }}
          size="md"
          variant="primary"
          block
          label={kpCount ? "Добавить в список КП" : "В список для КП"}
          disabled={pieces === 0}
          onAdded={() => setAdded(pieces)}
        />
      </div>
      {added !== null && (
        <p className={s.added} role="status">
          <Check aria-hidden="true" />
          Добавлено {formatNumber(added, 0)} {plural(added, forms)}.{" "}
          <Link href="/kp/" className="link">
            Открыть список КП
          </Link>
        </p>
      )}
    </div>
  );
}
