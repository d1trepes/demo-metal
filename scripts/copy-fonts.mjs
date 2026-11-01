// Копирует woff2 Sofia Sans (latin, cyrillic, latin-ext) из @fontsource-variable в public/fonts.
// Запускается перед dev и build (package.json). Подключение и предзагрузка — lib/fonts.ts + app/layout.tsx.
import { copyFileSync, mkdirSync } from "node:fs";

const families = ["sofia-sans", "sofia-sans-condensed", "sofia-sans-extra-condensed"];
const subsets = ["latin", "cyrillic", "latin-ext"];
const out = new URL("../public/fonts/", import.meta.url);
mkdirSync(out, { recursive: true });
for (const f of families) {
  for (const sub of subsets) {
    const name = `${f}-${sub}-wght-normal.woff2`;
    copyFileSync(new URL(`../node_modules/@fontsource-variable/${f}/files/${name}`, import.meta.url), new URL(name, out));
  }
}
console.log("fonts copied:", families.length * subsets.length);
