import Link from "next/link";
import s from "./Logo.module.css";

/**
 * Логотип «Пролёт» (чат 2в).
 * Знак — портальная рама: ригель-двутавр на двух колоннах-двутаврах. Перерисован по исходнику
 * docs/assets-src/logo/mark-portal.jpg в пикселях исходника (смещение 329, 141), только прямые.
 * Надпись ПРОЛЁТ — из прямоугольников, толщина штриха под полки знака, шрифт сайта не используется.
 */

/** Ригель: полки с фасками на торцах, внутри просвет и стенка. Рисуется с evenodd. */
const BEAM =
  "M0 0H750V22L707 32V114L750 124V146H0V124L43 114V32L0 22Z" + // контур с фасками
  "M65 22V124H685V22Z" + // просвет между полками
  "M80 43H670V105H80Z"; // стенка

/** Колонна: оголовок с фасками, две стойки, база. Координаты левой колонны. */
const COLUMN = [
  "M42 164H176V486H129V186H64Z", // левая половина оголовка + ствол
  "M93 186H111V463H93Z", // левая стойка
  "M187 164H261L239 186H211V443H187Z", // правая половина оголовка + короткая стойка
  "M58 463H246V486H58Z", // база
].join("");

/**
 * Упрощённый знак для 24–48 px (шапка, подвал): тонкие просветы исходника там сливаются в серое.
 * Тот же силуэт, просветы ригеля шире, колонны — сплошные двутавры без расщепления.
 */
const BEAM_COMPACT =
  "M0 0H750V30L707 40V106L750 116V146H0V116L43 106V40L0 30Z" +
  "M65 30V116H685V30Z" +
  "M80 58H670V88H80Z";
const COLUMN_COMPACT = "M42 164H261L239 194H190V452H232V486H70V452H112V194H64Z";

function Mark({ detailed }: { detailed: boolean }) {
  const beam = detailed ? BEAM : BEAM_COMPACT;
  const column = detailed ? COLUMN : COLUMN_COMPACT;
  return (
    <svg className={s.mark} viewBox="0 0 750 486" aria-hidden="true" fill="currentColor">
      <path fillRule="evenodd" d={beam} />
      <path d={column} />
      {/* Правая колонна — зеркало левой относительно оси знака */}
      <path d={column} transform="matrix(-1 0 0 1 750 0)" />
    </svg>
  );
}

const H = 24; // высота прописной
const W = 4; // толщина штриха (легче, чем раньше, — в тон тонким полкам знака)

type R = [x: number, y: number, w: number, h: number];

/** Буквы как наборы прямоугольников, x от 0. Ширина буквы — width. */
const letters: { width: number; rects: R[] }[] = [
  // П: верхняя полка шире стоек — как ригель на колоннах
  { width: 17, rects: [[0, 0, 17, W], [1.5, 0, W, H], [11.5, 0, W, H]] },
  // Р
  { width: 15, rects: [[0, 0, W, H], [0, 0, 15, W], [11, 0, W, 13], [0, 9, 15, W]] },
  // О
  { width: 15, rects: [[0, 0, 15, W], [0, H - W, 15, W], [0, 0, W, H], [11, 0, W, H]] },
  // Л: верх, правая стойка, левая стойка с «пяткой»
  { width: 15, rects: [[3, 0, 12, W], [11, 0, W, H], [3, 0, W, H], [0, H - W, 7, W]] },
  // Ё: точки — квадратные «заклёпки»
  { width: 13, rects: [[0, 0, W, H], [0, 0, 13, W], [0, 10, 11, W], [0, H - W, 13, W], [1.5, -7, 3.5, 3.5], [8, -7, 3.5, 3.5]] },
  // Т
  { width: 15, rects: [[0, 0, 15, W], [5.5, 0, W, H]] },
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
    <svg className={s.word} viewBox={`0 -7 ${total} ${H + 7}`} aria-hidden="true" fill="currentColor">
      {shapes}
    </svg>
  );
}

/** detailed — точная копия исходного знака, только для крупных размеров (от ~64 px по высоте). */
export function Logo({ className, detailed = false }: { className?: string; detailed?: boolean }) {
  return (
    <Link href="/" className={`${s.logo} ${className ?? ""}`} aria-label="Пролёт — на главную">
      <Mark detailed={detailed} />
      <Wordmark />
    </Link>
  );
}
