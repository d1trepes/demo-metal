"use client";

import { useEffect, useState } from "react";

/** Загрузка данных кабинета из lib/api.ts: null — ещё грузится. Ошибки заглушек не бросают. */
export function useApi<T>(load: () => Promise<T>, deps: unknown[] = []): T | null {
  const [data, setData] = useState<T | null>(null);
  useEffect(() => {
    let alive = true;
    load().then((result) => alive && setData(result));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return data;
}
