import type { ProfileShape } from "@/lib/types";

/**
 * Геометрия временных «чертежей» профилей для плитки каталога (пока нет рендеров).
 * Сечение — в условных мм, центр в (0, 0). Объём строится косоугольной проекцией
 * со сдвигом DEPTH: сечение спереди слева внизу, дальний торец справа вверху.
 */
export type Pt = [number, number];

export type ProfileGeometry =
  /** Многоугольник; holes — внутренние контуры (труба). */
  | { kind: "poly"; outer: Pt[]; holes?: Pt[][]; depth?: Pt; label: string }
  /** Круг; inner — внутренний радиус трубы; ribs — рифление арматуры. */
  | { kind: "circle"; r: number; inner?: number; ribs?: boolean; depth?: Pt; label: string }
  | { kind: "mesh"; label: string };

export const DEPTH: Pt = [84, -52];

const rect = (w: number, h: number): Pt[] => [
  [-w / 2, -h / 2],
  [w / 2, -h / 2],
  [w / 2, h / 2],
  [-w / 2, h / 2],
];

/** Двутавр/швеллер/уголок — по реальным пропорциям ГОСТ, масштаб условный. */
function iBeam(h: number, b: number, tw: number, tf: number): Pt[] {
  const H = h / 2, B = b / 2, T = tw / 2;
  return [
    [-B, -H], [B, -H], [B, -H + tf], [T, -H + tf], [T, H - tf], [B, H - tf],
    [B, H], [-B, H], [-B, H - tf], [-T, H - tf], [-T, -H + tf], [-B, -H + tf],
  ];
}

function channel(h: number, b: number, tw: number, tf: number): Pt[] {
  const H = h / 2, x0 = -b / 2;
  return [
    [x0, -H], [x0 + b, -H], [x0 + b, -H + tf], [x0 + tw, -H + tf],
    [x0 + tw, H - tf], [x0 + b, H - tf], [x0 + b, H], [x0, H],
  ];
}

function angle(a: number, t: number): Pt[] {
  const o = -a / 2;
  return [
    [o, o], [o + t, o], [o + t, o + a - t], [o + a, o + a - t], [o + a, o + a], [o, o + a],
  ];
}

export const profileGeometry: Record<ProfileShape, ProfileGeometry> = {
  ibeam: { kind: "poly", outer: iBeam(100, 64, 6, 9), label: "20Б1" },
  channel: { kind: "poly", outer: channel(100, 52, 6, 9), label: "20П" },
  angle: { kind: "poly", outer: angle(76, 9), label: "75×6" },
  "rect-tube": { kind: "poly", outer: rect(92, 64), holes: [rect(80, 52)], label: "80×60×4" },
  sheet: { kind: "poly", outer: rect(132, 7), depth: [96, -74], label: "S 10" },
  flat: { kind: "poly", outer: rect(96, 16), label: "100×12" },
  "round-tube": { kind: "circle", r: 40, inner: 34, label: "⌀ 108" },
  bar: { kind: "circle", r: 32, label: "⌀ 60" },
  rebar: { kind: "circle", r: 17, ribs: true, depth: [118, -72], label: "⌀ 16" },
  mesh: { kind: "mesh", label: "100×100" },
};
