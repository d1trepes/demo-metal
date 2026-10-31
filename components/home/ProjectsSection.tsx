import { Col, Container, Grid } from "@/components/layout/Grid";
import { ProjectsList } from "./ProjectsList";
import tiles from "./CatalogTiles.module.css";

/** Главная: объекты и отзывы одним блоком (план чатов, 01.11.2026). Без картинок — цифры и слова заказчика. */
export function ProjectsSection() {
  return (
    <section className="section band surface" aria-labelledby="projects-title">
      <Container>
        <Grid className={tiles.head}>
          <Col area="head">
            <h2 id="projects-title" className="t-h2">
              Объекты
              <br />и что о нас говорят
            </h2>
          </Col>
          <Col area="aside">
            <p className="t-muted">
              340 объектов с 2008 года: склады, жильё, промышленность, нефтегаз. Ниже — пять последних, где мы
              поставляли и прокат, и конструкции.
            </p>
          </Col>
        </Grid>
        <ProjectsList />
      </Container>
    </section>
  );
}
