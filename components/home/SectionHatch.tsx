import { useId } from "react";
import s from "./SectionHatch.module.css";

/**
 * Декоративное сечение двутавра «как на чертеже»: контур, штриховка 45°, осевые линии.
 * Только линии, без текста. Используется в тёмной плитке «Нет нужной позиции?».
 */
export function SectionHatch({ className }: { className?: string }) {
  const hatchId = `hatch-${useId().replace(/:/g, "")}`;
  // Двутавр: полка 200×26, стенка 18, высота 240. Центр в (210, 150).
  const beam = "M110 30 H310 V56 H219 V244 H310 V270 H110 V244 H201 V56 H110 Z";

  return (
    <svg
      className={`${s.root} ${className ?? ""}`}
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern id={hatchId} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="10" className={s.hatch} />
        </pattern>
      </defs>
      <line x1="210" y1="6" x2="210" y2="294" className={s.axis} />
      <line x1="86" y1="150" x2="334" y2="150" className={s.axis} />
      <path d={beam} fill={`url(#${hatchId})`} className={s.outline} />
    </svg>
  );
}
