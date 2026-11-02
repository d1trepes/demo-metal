type NavigatorHints = Navigator & { connection?: { saveData?: boolean; effectiveType?: string }; deviceMemory?: number };

/**
 * Можно ли запускать фоновое видео: не при reduced-motion, не в режиме экономии трафика
 * и не на слабом устройстве (≤ 2 ГБ памяти или ≤ 2 ядра) — там остаётся постер.
 */
export function canPlayVideo(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const nav = navigator as NavigatorHints;
  if (nav.connection?.saveData) return false;
  if (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) return false;
  return !(nav.hardwareConcurrency && nav.hardwareConcurrency <= 2);
}

/**
 * Медленная сеть (2g/3g по Network Information API). Safari API не поддерживает —
 * там считаем сеть нормальной и решаем по canPlayVideo (чат 11б).
 */
export function isSlowConnection(): boolean {
  const type = (navigator as NavigatorHints).connection?.effectiveType;
  return type === "slow-2g" || type === "2g" || type === "3g";
}
