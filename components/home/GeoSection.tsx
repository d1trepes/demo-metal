import { Container, Grid } from "@/components/layout/Grid";
import { cx } from "@/lib/cx";
import { typo, typoAll } from "@/lib/typo";
import { GlobeMap } from "./GlobeMap";
import { deliveryZones, geoStats } from "./globeData";
import s from "./GeoSection.module.css";

/**
 * Главная: география отгрузок (чат 5б). Слева — заголовок, зоны доставки и цифры прямо на фоне
 * (без карточек, разделители линиями), справа — глобус целиком, ничем не перекрыт.
 */
export function GeoSection() {
  const zones = typoAll(deliveryZones);
  const stats = typoAll(geoStats);

  return (
    <section className="section band" aria-labelledby="geo-title">
      <Container>
        <Grid className={s.grid}>
          <div className={s.info}>
            <h2 id="geo-title" className="t-h2">
              Отгружаем по России
              <br />
              и&nbsp;СНГ
            </h2>
            <p className={cx("t-lead", s.lead)}>
              {typo(
                "По УрФО — своими длинномерами. Дальше — транспортной компанией или ж/д. Сертификаты и УПД едут вместе с грузом.",
              )}
            </p>

            <ul className={s.zones} aria-label="Сроки доставки по зонам">
              {zones.map((z) => (
                <li key={z.zone} className={s.zoneRow}>
                  <span className={cx(s.swatch, s[`zone${z.zone}`])} aria-hidden="true" />
                  <b className={s.term}>{z.term}</b>
                  <span>
                    {z.where}
                    <span className={s.method}>{z.method}</span>
                  </span>
                </li>
              ))}
            </ul>

            <dl className={s.stats}>
              {stats.map((stat) => (
                <div key={stat.label} className={s.stat}>
                  <dt className={cx("t-label", s.statLabel)}>{stat.label}</dt>
                  <dd className={s.statValue}>
                    {stat.value}
                    <span className={s.statUnit}>{stat.unit}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className={s.globeCol}>
            <GlobeMap zones={zones} />
            <p className={s.hint}>{typo("Наведите или нажмите на регион — покажем срок и способ доставки.")}</p>
          </div>
        </Grid>
      </Container>
    </section>
  );
}
