/**
 * Версия картинок. GitHub Pages разрешает кэш на 10 минут, а имена файлов не меняются —
 * после перевырезки браузер показывает старую картинку. Меняйте значение, когда
 * перезаписываете картинки в public/ под тем же именем.
 */
const IMAGE_VERSION = "8";

/** Путь к файлу из public/ с учётом basePath (GitHub Pages); у картинок — ?v=версия. */
export function asset(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  return /\.(webp|jpe?g|png|avif)$/.test(url) ? `${url}?v=${IMAGE_VERSION}` : url;
}

/**
 * srcset для картинки из public/ и её уменьшенных копий `name-<w>.webp` (scripts/make-variants.py).
 * full — ширина исходника. Браузер сам берёт размер по `sizes` и плотности экрана.
 */
export function srcSet(path: string, full: number, widths: number[] = [640]): string {
  const base = path.replace(/\.webp$/, "");
  return [...widths.map((w) => `${asset(`${base}-${w}.webp`)} ${w}w`), `${asset(path)} ${full}w`].join(", ");
}
