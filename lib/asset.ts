/** Путь к файлу из public/ с учётом basePath (GitHub Pages). */
export function asset(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * srcset для картинки из public/ и её уменьшенных копий `name-<w>.webp` (scripts/make-variants.py).
 * full — ширина исходника. Браузер сам берёт размер по `sizes` и плотности экрана.
 */
export function srcSet(path: string, full: number, widths: number[] = [640]): string {
  const base = path.replace(/\.webp$/, "");
  return [...widths.map((w) => `${asset(`${base}-${w}.webp`)} ${w}w`), `${asset(path)} ${full}w`].join(", ");
}
