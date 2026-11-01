import { Col, Container, Grid } from "@/components/layout/Grid";
import { typo, typoAll } from "@/lib/typo";
import { ProjectsList } from "./ProjectsList";
import { projects } from "./projectsData";
import tiles from "./CatalogTiles.module.css";

/** Главная: портфолио объектов с отзывами, вариант Б (чат 5б) — список слева, фото и отзыв справа. */
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
              {typo(
                "340 объектов с 2008 года: склады, жильё, промышленность, нефтегаз. Ниже — пять последних, где мы поставляли и прокат, и конструкции.",
              )}
            </p>
          </Col>
        </Grid>
        <ProjectsList projects={typoAll(projects)} />
      </Container>
    </section>
  );
}
