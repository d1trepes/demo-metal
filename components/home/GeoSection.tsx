import { Col, Container, Grid } from "@/components/layout/Grid";
import { cx } from "@/lib/cx";
import { typo, typoAll } from "@/lib/typo";
import { GlobeMap } from "./GlobeMap";
import { deliveryZones, geoStats } from "./globeData";
import tiles from "./CatalogTiles.module.css";
import s from "./GeoSection.module.css";

/**
 * Главная: география отгрузок (чат 5г). Заголовок по типовой раскладке (1–8 + подзаголовок 9–12),
 * ниже слева зоны доставки, справа крупная карта без рамки; цифры — одной полосой на всю ширину.
 */
export function GeoSection() {
  const zones = typoAll(deliveryZones);
  const stats = typoAll(geoStats);

  return (
    <section className="section band" aria-labelledby="geo-title">
      <Container>
        <Grid className={tiles.head}>
          <Col area="head">
            <h2 id="geo-title" className="t-h2">
              Отгружаем
              <br />
              по&nbsp;России и&nbsp;СНГ
            </h2>
          </Col>
          <Col area="aside">
            <p className="t-muted">
              {typo(
                "По УрФО — своими длинномерами. Дальше — транспортной компанией или ж/д. Сертификаты и УПД едут вместе с грузом.",
              )}
            </p>
          </Col>
        </Grid>

        <Grid className={s.grid}>
          <ul className={s.zones} aria-label="Сроки доставки по зонам">
            {zones.map((z) => (
              <li key={z.zone} className={s.zoneRow}>
                <b className={s.term}>{z.term}</b>
                <span>
                  {z.where}
                  <span className={s.method}>{z.method}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className={s.mapCol}>
            <GlobeMap zones={zones} />
          </div>
        </Grid>

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
      </Container>
    </section>
  );
}
