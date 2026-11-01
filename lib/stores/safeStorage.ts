/**
 * localStorage для persist-сторов Zustand. Каждое обращение в try/catch: в приватном окне,
 * при запрете cookie или переполнении хранилище бросает исключение — тогда просто живём без сохранения.
 */
import { createJSONStorage, type StateStorage } from "zustand/middleware";

const storage: StateStorage = {
  getItem: (name) => {
    try {
      return window.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      window.localStorage.setItem(name, value);
    } catch {
      /* хранилище недоступно — состояние живёт до перезагрузки */
    }
  },
  removeItem: (name) => {
    try {
      window.localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};

export const safeJSONStorage = createJSONStorage(() => storage);
