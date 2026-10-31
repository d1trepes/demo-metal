import { Col, Container, Grid } from "@/components/layout/Grid";
import { cx } from "@/lib/cx";
import { GlobeStage } from "./GlobeStage";
import { geoRegions, geoRegionsMore, geoStats, warehouse } from "./globeData";
import tiles from "./CatalogTiles.module.css";
import s from "./GeoSection.module.css";

/** Главная: география отгрузок — 4 цифры + глобус + список регионов (реф. 03). */
export function GeoSection() {
  return (
    <section className={cx("section band", s.section)} aria-labelledby="geo-title">
      <Container>
        <Grid className={tiles.head}>
          <Col area="head">
            <h2 id="geo-title" className="t-h2">
              Отгружаем по России
              <br />и СНГ
            </h2>
          </Col>
          <Col area="aside">
            <p className="t-muted">
              По УрФО — своими длинномерами 13,6 м за 1–2 дня. Дальше — транспортной компанией или ж/д, сертификаты
              и УПД едут вместе с грузом.
            </p>
          </Col>
        </Grid>

        <dl className={s.stats}>
          {geoStats.map((stat) => (
            <div key={stat.label} className={s.stat}>
              <dt className={cx("t-label", s.statLabel)}>{stat.label}</dt>
              <dd className={cx("t-nums", s.statValue)}>
                {stat.value}
                {stat.unit && <span className={s.statUnit}>{stat.unit}</span>}
              </dd>
            </div>
          ))}
        </dl>

        <div className={s.stage}>
          <div className={s.clip}>
            <GlobeStage />
          </div>
          <div className={s.regions}>
            <h3 className="t-h3">Куда везём</h3>
            <ul className={s.regionList}>
              {geoRegions.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <p className={cx("t-muted", s.more)}>{geoRegionsMore}</p>
            <p className={s.legend}>
              <span className={s.legendHome} aria-hidden="true" />
              Склад, {warehouse.name}
              <span className={s.legendShip} aria-hidden="true" />
              Страны отгрузки
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
