/**
 * Ортографическая проекция шара без библиотек (для GlobeCanvas).
 * Координаты результата: x вправо, y вверх, z на зрителя; радиус шара = 1.
 */

const RAD = Math.PI / 180;

export type Vec3 = [number, number, number];

/** Широта/долгота → единичный вектор (x к 0° долготы, z к северному полюсу). */
export function toVec(lat: number, lon: number): Vec3 {
  const phi = lat * RAD;
  const lam = lon * RAD;
  return [Math.cos(phi) * Math.cos(lam), Math.cos(phi) * Math.sin(lam), Math.sin(phi)];
}

/** Поворот так, чтобы точка (viewLat, viewLon) смотрела на зрителя. */
export function makeRotation(viewLat: number, viewLon: number) {
  const cl = Math.cos(-viewLon * RAD);
  const sl = Math.sin(-viewLon * RAD);
  const cp = Math.cos(viewLat * RAD);
  const sp = Math.sin(viewLat * RAD);
  return (v: Vec3): Vec3 => {
    // вокруг полюса: центральный меридиан → ось x
    const x1 = v[0] * cl - v[1] * sl;
    const y1 = v[0] * sl + v[1] * cl;
    const z1 = v[2];
    // наклон: центральная параллель → на зрителя
    const depth = x1 * cp + z1 * sp;
    const up = -x1 * sp + z1 * cp;
    return [y1, up, depth];
  };
}

/** Точки дуги по большому кругу, приподнятой над поверхностью (выше в середине). */
export function arcPoints(a: Vec3, b: Vec3, steps = 40): Vec3[] {
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const omega = Math.acos(dot);
  const lift = 0.04 + omega * 0.25;
  const pts: Vec3[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const k1 = omega ? Math.sin((1 - t) * omega) / Math.sin(omega) : 1 - t;
    const k2 = omega ? Math.sin(t * omega) / Math.sin(omega) : t;
    const h = 1 + lift * Math.sin(Math.PI * t);
    pts.push([(a[0] * k1 + b[0] * k2) * h, (a[1] * k1 + b[1] * k2) * h, (a[2] * k1 + b[2] * k2) * h]);
  }
  return pts;
}

/** Точка видна, если она перед шаром или выступает за его край. */
export function isVisible(p: Vec3): boolean {
  return p[2] > 0 || p[0] * p[0] + p[1] * p[1] > 1;
}
