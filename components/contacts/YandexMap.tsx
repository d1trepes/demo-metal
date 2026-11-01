"use client";

import { useEffect, useRef, useState } from "react";
import s from "./Contacts.module.css";

/** Точка склада (адрес условный): восток Екатеринбурга, у Сибирского тракта. Долгота, широта. */
const POINT = { lon: 60.7095, lat: 56.8166 };
const ZOOM = 14;

/** Виджет Яндекс.Карт без ключа API: метка pm2dbm — тёмная, после grayscale читается чёрной. */
const SRC =
  `https://yandex.ru/map-widget/v1/?ll=${POINT.lon}%2C${POINT.lat}&z=${ZOOM}` +
  `&pt=${POINT.lon}%2C${POINT.lat}%2Cpm2dbm&l=map`;

/**
 * Карта проезда (чат 8б). Iframe грузится только при подходе к блоку (за 800 px),
 * до этого — серая заглушка того же размера; проявляется после загрузки.
 * Чат 10: пока не кликнули, поверх лежит прозрачный слой — колесо мыши прокручивает страницу,
 * а не зумит карту (иначе прокрутка «застревает»). Курсор ушёл — слой возвращается.
 * caption — уже после typo() на сервере
 * (типограф не тащим в клиентский бандл).
 */
export function YandexMap({ caption }: { caption: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "800px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <figure className={s.map}>
      <div ref={ref} className={s.mapFrame} onMouseLeave={() => setActive(false)}>
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
