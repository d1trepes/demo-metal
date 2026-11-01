import s from "./Contacts.module.css";

/**
 * Схема проезда (чат 8). По паспорту карта — статичная картинка; рисуем схему кодом (без тайлов и чужих карт):
 * ЕКАД, Сибирский тракт, ул. Монтажников, наша площадка, въезды для легковых и фур. Цвета — классы на токенах.
 * Всё условно: компания и адрес вымышлены.
 */
export function RouteScheme() {
  return (
    <figure className={s.scheme}>
      <svg viewBox="0 0 800 560" role="img" aria-labelledby="scheme-title scheme-desc" className={s.schemeSvg}>
        <title id="scheme-title">Схема проезда на базу «Пролёт»</title>
        <desc id="scheme-desc">
          С ЕКАД — съезд на Сибирский тракт в сторону центра, через 1,2 км направо на улицу Монтажников. Въезд для фур — ворота 2, для легковых — ворота 1 у офиса.
        </desc>

        {/* кварталы */}
        <g className={s.schemeBlock}>
          <rect x="40" y="40" width="210" height="150" />
          <rect x="40" y="250" width="210" height="130" />
          <rect x="560" y="40" width="200" height="110" />
          <rect x="600" y="420" width="160" height="100" />
          <rect x="40" y="440" width="210" height="80" />
        </g>

        {/* ЕКАД — дуга слева */}
        <path d="M 0 400 C 150 400 230 320 270 200 S 300 40 300 0" className={s.schemeRoadMajor} />
        {/* Сибирский тракт — горизонталь */}
        <path d="M 0 220 L 800 220" className={s.schemeRoadMajor} />
        {/* ул. Монтажников */}
        <path d="M 440 220 L 440 560" className={s.schemeRoad} />
        <path d="M 440 410 L 800 410" className={s.schemeRoadMinor} />

        {/* наша площадка */}
        <rect x="470" y="250" width="290" height="140" className={s.schemeSite} />
        <rect x="490" y="268" width="150" height="64" className={s.schemeHall} />
        {/* ж/д ветка — тупик заходит на площадку */}
        <path d="M 300 560 L 500 352 L 760 352" className={s.schemeRail} />
        <path d="M 300 560 L 500 352 L 760 352" className={s.schemeRailTies} />

        <text x="700" y="312" textAnchor="middle" className={s.schemeSiteText}>
          ПРОЛЁТ
        </text>

        {/* маршрут фуры: с ЕКАД по тракту, направо на Монтажников, ворота 2 */}
        <path d="M 252 220 L 440 220 L 440 372 L 470 372" className={s.schemeRoute} />

        {/* ворота */}
        <g className={s.schemeGate}>
          <circle cx="470" cy="372" r="9" />
          <circle cx="470" cy="276" r="9" />
        </g>
        <text x="424" y="378" textAnchor="end" className={s.schemeLabelStrong}>
          Ворота 2 · фуры
        </text>
        <text x="424" y="282" textAnchor="end" className={s.schemeLabel}>
          Ворота 1 · офис
        </text>

        {/* подписи улиц */}
        <text x="60" y="200" className={s.schemeLabel}>
          Сибирский тракт
        </text>
        <text x="20" y="378" className={s.schemeLabel}>
          ЕКАД
        </text>
        <text x="452" y="530" className={s.schemeLabel}>
          ул. Монтажников
        </text>
        <text x="565" y="306" className={s.schemeLabelInverse} textAnchor="middle">
          Цех
        </text>
        <text x="750" y="344" textAnchor="end" className={s.schemeLabel}>
          ж/д тупик
        </text>

        {/* север */}
        <g className={s.schemeNorth} transform="translate(740 470)">
          <path d="M 0 -26 L 9 6 L 0 0 L -9 6 Z" />
          <text y="26" textAnchor="middle">
            С
          </text>
        </g>
      </svg>
      <figcaption className="t-muted">Схема условная: компания и&nbsp;адрес вымышлены</figcaption>
    </figure>
  );
}
