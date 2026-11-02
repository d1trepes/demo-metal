"use client";

import { useEffect, useState } from "react";
import s from "./Contacts.module.css";

/** Точка склада (адрес условный): восток Екатеринбурга, у Сибирского тракта. Долгота, широта. */
const POINT = { lon: 60.7095, lat: 56.8166 };
const ZOOM = 14;

/** Виджет Яндекс.Карт без ключа API: метка pm2dbm — тёмная, после grayscale читается чёрной. */
const SRC =
  `https://yandex.ru/map-widget/v1/?ll=${POINT.lon}%2C${POINT.lat}&z=${ZOOM}` +
  `&pt=${POINT.lon}%2C${POINT.lat}%2Cpm2dbm&l=map`;

/**
 * Статичная картинка той же карты (центр, зум, метка) — заглушка, пока грузится виджет (11в).
 * Static API 1.x без ключа; не загрузилась — остаётся серый фон.
 */
const STATIC_SRC =
  `https://static-maps.yandex.ru/1.x/?ll=${POINT.lon},${POINT.lat}&z=${ZOOM}` +
  `&size=650,450&l=map&pt=${POINT.lon},${POINT.lat},pm2dbm&lang=ru_RU`;

/**
 * Карта проезда (чат 8б, 11в). Iframe начинает грузиться сразу после первой отрисовки
 * (не ждёт подхода к блоку: на телефоне /contacts короткая), без loading="lazy".
 * Под ним — статичная ч/б картинка той же карты; iframe проявляется поверх после onLoad.
 * Чат 10: пока не кликнули, поверх лежит прозрачный слой — колесо мыши прокручивает страницу,
 * а не зумит карту (иначе прокрутка «застревает»). Курсор ушёл — слой возвращается.
 * caption — уже после typo() на сервере
 * (типограф не тащим в клиентский бандл).
 */
export function YandexMap({ caption }: { caption: string }) {
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState(false);
  const [staticFailed, setStaticFailed] = useState(false);

  // Сразу после первой отрисовки: кадр, потом простой браузера (не дольше 300 мс)
  useEffect(() => {
    let idle = 0;
    const raf = requestAnimationFrame(() => {
      const start = () => setVisible(true);
      if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(start, { timeout: 300 });
      else idle = globalThis.setTimeout(start, 0) as unknown as number;
    });
    return () => {
      cancelAnimationFrame(raf);
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
      globalThis.clearTimeout(idle);
    };
  }, []);

  return (
    <figure className={s.map}>
      <div className={s.mapFrame} onMouseLeave={() => setActive(false)}>
        {!staticFailed && (
          <img
            className={s.mapStatic}
            src={STATIC_SRC}
            alt=""
            width={650}
            height={450}
            decoding="async"
            onError={() => setStaticFailed(true)}
          />
        )}
        {visible && (
          <iframe
            className={s.mapIframe}
            data-loaded={loaded || undefined}
            src={SRC}
            title="Склад «Пролёт» на Яндекс.Картах"
            allowFullScreen
            onLoad={() => setLoaded(true)}
          />
        )}
        {!active && (
          <button type="button" className={s.mapShield} onClick={() => setActive(true)}>
            <span>Нажмите, чтобы двигать карту</span>
          </button>
        )}
      </div>
      <figcaption className={s.mapCaption}>
        <span>{caption}</span>
        <span className="t-muted">Адрес условный</span>
      </figcaption>
    </figure>
  );
}
