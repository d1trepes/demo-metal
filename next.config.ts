import type { NextConfig } from "next";

/**
 * Статичный экспорт под GitHub Pages.
 * BASE_PATH выставляет workflow деплоя ("/demo-metal"); локально — пусто.
 * Для ссылок на файлы из public/ используйте asset() из lib/asset.ts.
 */
const basePath = process.env.BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
