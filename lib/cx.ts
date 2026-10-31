/** Склейка классов: cx("a", cond && "b") → "a b". */
export function cx(...names: (string | false | null | undefined)[]): string {
  return names.filter(Boolean).join(" ");
}
