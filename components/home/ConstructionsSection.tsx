import Link from "next/link";
import { Col, Container, Grid } from "@/components/layout/Grid";
import { cx } from "@/lib/cx";
import { ConstructionPanels } from "./ConstructionPanels";
import { afterTruck } from "./TruckDivider";
import tiles from "./CatalogTiles.module.css";
import s from "./ConstructionsSection.module.css";

/** Главная: цех металлоконструкций — заголовок по сетке + панели 01–05 (реф. 05). */
export function ConstructionsSection() {
  return (
    <section className={cx("section", s.section, afterTruck)} aria-labelledby="constructions-title">
      <Container>
        <Grid className={tiles.head}>
          <Col area="head">
            <h2 id="constructions-title" className="t-h2">
              Металлоконструкции
              <br />
              по вашим чертежам
            </h2>
          </Col>
          <Col area="aside" className={tiles.aside}>
            <p className="t-muted">
              Свой цех 4 200 м², до 180 т в месяц. Считаем по чертежу за 2 рабочих дня, отгружаем вместе с прокатом
              одной машиной.
            </p>
            <Link href="/constructions/" className={tiles.allLink}>
              Все конструкции
            </Link>
          </Col>
        </Grid>
        <ConstructionPanels />
      </Container>
    </section>
  );
}
