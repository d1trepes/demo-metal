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
 * Карта проезда (чат 8б). Iframe грузится только при подходе к блоку (за 400 px),
 * до этого — серая заглушка того же размера. Ч/б делает CSS-фильтр. caption — уже после typo() на сервере
 * (типограф не тащим в клиентский бандл).
 */
export function YandexMap({ caption }: { caption: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

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
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <figure className={s.map}>
      <div ref={ref} className={s.mapFrame}>
        {visible && (
          <iframe
            className={s.mapIframe}
            src={SRC}
            title="Склад «Пролёт» на Яндекс.Картах"
            loading="lazy"
            allowFullScreen
          />
        )}
      </div>
      <figcaption className={s.mapCaption}>
        <span>{caption}</span>
        <span className="t-muted">Адрес условный</span>
      </figcaption>
    </figure>
  );
}
