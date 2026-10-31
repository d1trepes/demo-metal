import type { ProfileShape } from "@/lib/types";
import { DEPTH, profileGeometry, type Pt } from "./profileGeometry";
import s from "./ProfileDrawing.module.css";

/**
 * Временная иллюстрация категории: линейный «чертёж» профиля в объёме
 * (сечение со штриховкой + каркас). Заменится рендерами в чате 5.
 */
const add = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]];
const scale = (a: Pt, k: number): Pt => [a[0] * k, a[1] * k];
const toPath = (pts: Pt[], at: Pt) =>
  pts.map((p, i) => `${i ? "L" : "M"}${(p[0] + at[0]).toFixed(1)} ${(p[1] + at[1]).toFixed(1)}`).join("") + "Z";
const circlePath = ([cx, cy]: Pt, r: number) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;

export function ProfileDrawing({ shape }: { shape: ProfileShape }) {
  const g = profileGeometry[shape];
  const hatchId = `hatch-${shape}`;

  return (
    <svg viewBox="-128 -86 256 172" className={s.svg} aria-hidden="true">
      <defs>
        <pattern id={hatchId} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" className={s.hatchLine} />
        </pattern>
      </defs>
      {g.kind === "poly" && <Poly g={g} hatch={hatchId} />}
      {g.kind === "circle" && <Round g={g} hatch={hatchId} />}
      {g.kind === "mesh" && <Mesh />}
      <text className={s.label} x="-120" y="80">
        {g.label}
      </text>
    </svg>
  );
}

type PolyG = Extract<(typeof profileGeometry)[ProfileShape], { kind: "poly" }>;
type RoundG = Extract<(typeof profileGeometry)[ProfileShape], { kind: "circle" }>;

function Poly({ g, hatch }: { g: PolyG; hatch: string }) {
  const depth = g.depth ?? DEPTH;
  const front = scale(depth, -0.5);
  const back = scale(depth, 0.5);
  const contours = [g.outer, ...(g.holes ?? [])];
  const frontPath = contours.map((c) => toPath(c, front)).join("");

  return (
    <g>
      <path d={contours.map((c) => toPath(c, back)).join("")} className={s.back} />
      {g.outer.map((p, i) => {
        const a = add(p, front);
        const b = add(p, back);
        return <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} className={s.edge} />;
      })}
      <path d={frontPath} fillRule="evenodd" className={s.face} />
      <path d={frontPath} fillRule="evenodd" fill={`url(#${hatch})`} className={s.faceLine} />
    </g>
  );
}

function Round({ g, hatch }: { g: RoundG; hatch: string }) {
  const depth = g.depth ?? DEPTH;
  const front = scale(depth, -0.5);
  const back = scale(depth, 0.5);
  const len = Math.hypot(depth[0], depth[1]);
  const n: Pt = [-depth[1] / len, depth[0] / len]; // перпендикуляр к оси
  const side = (k: 1 | -1) => {
    const a = add(front, scale(n, g.r * k));
    const b = add(back, scale(n, g.r * k));
    return <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} className={s.outline} />;
  };
  const frontPath = circlePath(front, g.r) + (g.inner ? circlePath(front, g.inner) : "");

  // Рифление арматуры: косые серпы вдоль стержня.
  const ribs = g.ribs
    ? Array.from({ length: 9 }, (_, i) => {
        const c = add(front, scale(depth, 0.14 + i * 0.1));
        const a = add(c, scale(n, g.r));
        const b = add(c, scale(n, -g.r));
        const ctrl = add(c, scale(depth, 0.06));
        return <path key={i} d={`M${a[0]} ${a[1]}Q${ctrl[0]} ${ctrl[1]} ${b[0]} ${b[1]}`} className={s.edge} />;
      })
    : null;

  return (
    <g>
      <path d={circlePath(back, g.r)} className={s.outline} />
      {g.inner && <path d={circlePath(back, g.inner)} className={s.back} />}
      {side(1)}
      {side(-1)}
      {ribs}
      <path d={frontPath} fillRule="evenodd" className={s.face} />
      <path d={frontPath} fillRule="evenodd" fill={`url(#${hatch})`} className={s.faceLine} />
    </g>
  );
}

/** Сварная сетка: проволока в косоугольной плоскости, узлы-точки. */
function Mesh() {
  const u: Pt = [150, 0];
  const v: Pt = [90, -60];
  const origin: Pt = [-120, 45];
  const steps = 5;
  const lines = [];
  for (let i = 0; i <= steps; i++) {
    const a = add(origin, scale(u, i / steps));
    const b = add(a, v);
    const c = add(origin, scale(v, i / steps));
    const d = add(c, u);
    lines.push(<line key={`u${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} className={s.outline} />);
    lines.push(<line key={`v${i}`} x1={c[0]} y1={c[1]} x2={d[0]} y2={d[1]} className={s.outline} />);
  }
  const nodes = [];
  for (let i = 0; i <= steps; i++)
    for (let j = 0; j <= steps; j++) {
      const p = add(add(origin, scale(u, i / steps)), scale(v, j / steps));
      nodes.push(<circle key={`${i}-${j}`} cx={p[0]} cy={p[1]} r="2.2" className={s.node} />);
    }
  return (
    <g>
      {lines}
      {nodes}
    </g>
  );
}
