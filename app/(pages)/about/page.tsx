import type { Metadata } from "next";
import { aboutFacts, aboutStats, certificates, equipment, siteParts, team } from "@/components/about/aboutData";
import { ProjectsSection } from "@/components/home/ProjectsSection";
import { Col, Container, Grid } from "@/components/layout/Grid";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { asset, srcSet } from "@/lib/asset";
import { cx } from "@/lib/cx";
import { company } from "@/lib/nav";
import { typo, typoAll } from "@/lib/typo";
import c from "../catalog/catalog.module.css";
import s from "@/components/about/About.module.css";

export const metadata: Metadata = {
  title: "О производстве",
  description: "Металлобаза и цех металлоконструкций в Екатеринбурге с 2008 года: 12 400 т проката на складе, цех 4 200 м², до 180 т конструкций в месяц, сварщики НАКС.",
};

const SKIP = ["slug", "id", "href", "src", "number", "email", "ext"];

/** О производстве (паспорт §4): площадка, цифры, оборудование, документы, объекты, кому звонить. */
export default function AboutPage() {
  const facts = typoAll(aboutFacts);
  const parts = typoAll(siteParts);
  const machines = typoAll(equipment, SKIP);
  const docs = typoAll(certificates, SKIP);
  const people = typoAll(team, SKIP);

  return (
    <>
      <Container className={s.top}>
        <Grid className={c.head}>
          <Col area="head">
            <Breadcrumbs items={[{ href: "/", label: "Главная" }, { label: "О производстве" }]} />
            <h1 className="t-h1">Металлобаза и&nbsp;цех на&nbsp;одной площадке</h1>
          </Col>
          <Col area="aside" className={c.lead}>
            <dl className={c.facts}>
              {facts.map((f) => (
                <div key={f.label}>
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
            <Button href="/contacts/" variant="secondary">
              Как проехать
            </Button>
          </Col>
        </Grid>
        <div className={s.cover}>
          <img
            src={asset("/pages/base.webp")}
            srcSet={srcSet("/pages/base.webp", 1370, [800])}
            sizes="(max-width: 1440px) 100vw, 1360px"
            alt="Площадка «Пролёта»: цех в три пролёта, открытый склад с козловым краном, штабели балок и труб, длинномер у ворот"
            width={1370}
            height={754}
            fetchPriority="high"
          />
        </div>
        <dl className={s.stats}>
          {aboutStats.map((st) => (
            <div key={st.label} className={s.stat}>
              <dt className="t-label t-muted">{st.label}</dt>
              <dd className={s.statValue}>
                {typo(st.value)}
                <span className={s.statUnit}>{typo(st.unit)}</span>
              </dd>
            </div>
          ))}
        </dl>
      </Container>

      <section className="section" aria-labelledby="site-title">
        <Container>
          <Grid className={s.sectionHead}>
            <Col area="head">
              <h2 id="site-title" className="t-h2">
                Что на&nbsp;площадке
              </h2>
            </Col>
            <Col area="aside">
              <p className="t-muted">{typo(`${company.address}. Склад и цех — за одним забором: конструкции делаем из металла, который лежит в 200 метрах.`)}</p>
            </Col>
          </Grid>
          <Grid className={s.parts}>
            {parts.map((p) => (
              <div key={p.title} className={s.part}>
                <h3 className="t-h3">{p.title}</h3>
                <p>{p.text}</p>
                <dl className={s.specs}>
                  {p.specs.map((sp) => (
                    <div key={sp.label}>
                      <dt>{sp.label}</dt>
                      <dd>{sp.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </Grid>
        </Container>
      </section>

      <section className="section" aria-labelledby="equipment-title">
        <Container>
          <Grid className={s.sectionHead}>
            <Col area="head">
              <h2 id="equipment-title" className="t-h2">
                Оборудование
              </h2>
            </Col>
            <Col area="aside">
              <p className="t-muted">{typo("Весь цикл — от резки до окраски — у нас. На сторону отдаём только горячее цинкование.")}</p>
            </Col>
          </Grid>
          <Grid as="ul" className={s.machines}>
            {machines.map((m) => (
              <li key={m.slug} className={s.machine}>
                <div className={s.machineArt}>
                  <img
                    src={asset(`/equipment/${m.slug}.webp`)}
                    srcSet={srcSet(`/equipment/${m.slug}.webp`, m.image.width)}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    alt=""
                    width={m.image.width}
                    height={m.image.height}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className={s.machineHead}>
                  <h3 className="t-h3">{m.title}</h3>
                  <p className={s.machineCount}>{m.count}</p>
                </div>
                <dl className={s.specs}>
                  {m.specs.map((sp) => (
                    <div key={sp.label}>
                      <dt>{sp.label}</dt>
                      <dd>{sp.value}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </Grid>
        </Container>
      </section>

      <section className="section" aria-labelledby="docs-title">
        <Container>
          <Grid className={s.sectionHead}>
            <Col area="head">
              <h2 id="docs-title" className="t-h2">
                Документы и&nbsp;допуски
              </h2>
            </Col>
            <Col area="aside">
              <p className="t-muted">{typo("Копии пришлём с КП. Паспорт на конструкции и сертификаты на металл едут в машине вместе с грузом.")}</p>
            </Col>
          </Grid>
          <ul className={s.docs}>
            {docs.map((d) => (
              <Grid as="li" key={d.title} className={s.doc}>
                <p className={cx("t-h3", s.docTitle)}>{d.title}</p>
                <p className={s.docScope}>{d.scope}</p>
                <p className={s.docNumber}>{d.number}</p>
                <p className={s.docUntil}>{d.until}</p>
              </Grid>
            ))}
          </ul>
        </Container>
      </section>

      <ProjectsSection />

      <section className="section band" aria-labelledby="team-title">
        <Container>
          <Grid className={s.sectionHead}>
            <Col area="head">
              <h2 id="team-title" className="t-h2">
                Кому звонить
              </h2>
            </Col>
            <Col area="aside">
              <p className="t-muted">
                {typo("Общий номер")}{" "}
                <a className="link" href={company.phoneHref}>
                  {company.phone}
                </a>
                {typo(", дальше — добавочный. Пн–Пт 8:00–18:00.")}
              </p>
            </Col>
          </Grid>
          <ul className={s.team}>
            {people.map((p) => (
              <Grid as="li" key={p.ext} className={s.person}>
                <p className={s.personArea}>{p.area}</p>
                <p className={s.personName}>
                  <span className={s.personStrong}>{p.name}</span>
                  <span className="t-muted">{p.role}</span>
                </p>
                <p className={s.personExt}>доб.&nbsp;{p.ext}</p>
                <a className={cx("link", s.personMail)} href={`mailto:${p.email}`}>
                  {p.email}
                </a>
              </Grid>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
