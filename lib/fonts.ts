import { asset } from "./asset";

/**
 * Шрифты Sofia Sans (variable) со своего домена: файлы копирует scripts/copy-fonts.mjs из @fontsource-variable.
 * @font-face вписаны прямо в <head> (app/layout.tsx). Condensed и Extra Condensed (latin + cyrillic, ~130 КБ)
 * предзагружаются — браузер получает их до первой отрисовки, заголовки не мигают запасным шрифтом.
 * Основной шрифт не предзагружаем: он не нужен для LCP и не должен отнимать канал у заголовка.
 *
 * display: Extra Condensed и Condensed — `block` (запасной Arial Narrow шире в 1,5 раза, подмена давала прыжок
 * hero); основной текст — `swap` (читать можно сразу, разница в ширине мала).
 */
const FAMILIES = [
  { family: "Sofia Sans Variable", file: "sofia-sans", display: "swap", preload: false },
  { family: "Sofia Sans Condensed Variable", file: "sofia-sans-condensed", display: "block", preload: true },
  { family: "Sofia Sans Extra Condensed Variable", file: "sofia-sans-extra-condensed", display: "block", preload: true },
] as const;

const SUBSETS = [
  { name: "cyrillic", preload: true, range: "U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116" },
  {
    name: "latin",
    preload: true,
    range:
      "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD",
  },
  // ₽ (U+20BD) живёт здесь — грузится, только когда знак есть на странице
  {
    name: "latin-ext",
    preload: false,
    range:
      "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF",
  },
] as const;

const url = (file: string, subset: string) => asset(`/fonts/${file}-${subset}-wght-normal.woff2`);

/** Файлы для <link rel="preload">. */
export const fontPreloads = FAMILIES.filter((f) => f.preload).flatMap((f) => SUBSETS.filter((s) => s.preload).map((s) => url(f.file, s.name)));

/** CSS всех @font-face. */
export const fontFaceCss = FAMILIES.flatMap((f) =>
  SUBSETS.map(
    (s) =>
      `@font-face{font-family:'${f.family}';font-style:normal;font-weight:1 1000;font-display:${f.display};` +
      `src:url(${url(f.file, s.name)}) format('woff2-variations');unicode-range:${s.range}}`,
  ),
).join("");
