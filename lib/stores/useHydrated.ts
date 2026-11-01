/**
 * true после первого рендера в браузере. Сторы читают localStorage сразу, а статичный HTML собран без него —
 * счётчики и состояния из сторов показываем только после гидратации, иначе React ругается на несовпадение.
 */
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
