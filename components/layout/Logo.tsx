import Link from "next/link";
import s from "./Logo.module.css";

/**
 * ВРЕМЕННЫЙ логотип (чат 2б) — до логотипа, который сгенерирует дизайнер.
 * Знак: квадрат, в нём на просвет портальная рама «пролёт» — ригель с выносом и две колонны.
 * Надпись ПРОЛЁТ собрана из прямоугольников на сетке 24 ед. (толщина штриха 5),
 * точки над Ё — квадратные «заклёпки». Шрифт сайта не используется.
 */
const H = 24; // высота прописной
const W = 5; // толщина штриха

type R = [x: number, y: number, w: number, h: number];

/** Буквы как наборы прямоугольников, x от 0. Ширина буквы — width. */
const letters: { width: number; rects: R[] }[] = [
  // П
  { width: 16, rects: [[0, 0, 16, W], [0, 0, W, H], [11, 0, W, H]] },
  // Р
  { width: 16, rects: [[0, 0, W, H], [0, 0, 16, W], [11, 0, W, 14], [0, 9, 16, W]] },
  // О
  { width: 16, rects: [[0, 0, 16, W], [0, H - W, 16, W], [0, 0, W, H], [11, 0, W, H]] },
  // Л: верх, правая стойка, левая стойка с «пяткой»
  { width: 16, rects: [[3, 0, 13, W], [11, 0, W, H], [3, 0, W, H], [0, H - W, 8, W]] },
  // Ё
  { width: 14, rects: [[0, 0, W, H], [0, 0, 14, W], [0, 9.5, 12, W], [0, H - W, 14, W], [1.5, -8, 4, 4], [8.5, -8, 4, 4]] },
  // Т
  { width: 16, rects: [[0, 0, 16, W], [5.5, 0, W, H]] },
];
const GAP = 4;

function Wordmark() {
  let x = 0;
  const shapes = letters.flatMap((letter, i) => {
    const at = x;
    x += letter.width + GAP;
    return letter.rects.map(([rx, ry, rw, rh], j) => (
      <rect key={`${i}-${j}`} x={at + rx} y={ry} width={rw} height={rh} />
    ));
  });
  const total = x - GAP;
  return (
    <svg className={s.word} viewBox={`0 -8 ${total} ${H + 8}`} aria-hidden="true" fill="currentColor">
      {shapes}
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={`${s.logo} ${className ?? ""}`} aria-label="Пролёт — на главную">
      {/* Плашка с портальной рамкой на просвет: ригель с выносом и две колонны */}
      <svg className={s.mark} viewBox="0 0 32 32" aria-hidden="true" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M0 0h32v32H0z M5 7h22v5h-4v15h-5V12h-4v15H9V12H5z"
        />
      </svg>
      <Wordmark />
    </Link>
  );
}
