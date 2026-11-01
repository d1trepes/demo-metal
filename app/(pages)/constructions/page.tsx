import type { Metadata } from "next";
import { DrawingForm } from "@/components/constructions/DrawingForm";
import { stages } from "@/components/constructions/stages";
import { constructionTypes } from "@/components/home/constructionTypes";
import { Col, Container, Grid } from "@/components/layout/Grid";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { asset, srcSet } from "@/lib/asset";
import { cx } from "@/lib/cx";
import { company } from "@/lib/nav";
import { typo, typoAll } from "@/lib/typo";
import c from "../catalog/catalog.module.css";
import s from "@/components/constructions/Constructions.module.css";

export const metadata: Metadata = {
  title: "Металлоконструкции по чертежам",
  description: "Фермы, каркасы зданий, лестницы, ограждения и закладные. Цех 4 200 м², до 180 т в месяц, расчёт по чертежу за 2 рабочих дня.",
};

const facts = [
  { label: "Цех", value: "4 200 м², Екатеринбург" },
  { label: "Мощность", value: "до 180 т в месяц" },
  { label: "Расчёт по чертежу", value: "2 рабочих дня" },
  { label: "Сварщики", value: "аттестация НАКС" },
];

/** Металлоконструкции (паспорт §4): что делаем, этапы работы, форма «Расчёт по чертежу». */
export default function ConstructionsPage() {
  const types = typoAll(constructionTypes);
  const steps = typoAll(stages);
  return (
    <>
      <Container className={s.top}>
        <Grid className={c.head}>
          <Col area="head">
            <Breadcrumbs items={[{ href: "/", label: "Главная" }, { label: "Металлоконструкции" }]} />
            <h1 className="t-h1">Металлоконструкции по&nbsp;вашим чертежам</h1>
          </Col>
          <Col area="aside" className={c.lead}>
            <dl className={c.facts}>
              {facts.map((f) => (
                <div key={f.label}>
                  <dt>{f.label}</dt>
                  <dd>{typo(f.value)}</dd>
                </div>
              ))}
            </dl>
            <Button href="#drawing">Отправить чертёж</Button>
          </Col>
        </Grid>
        <div className={s.cover}>
          <img
            src={asset("/pages/frame.webp")}
            srcSet={srcSet("/pages/frame.webp", 1325, [800])}
            sizes="(max-width: 1440px) 100vw, 1360px"
            alt="Каркас производственного здания в три пролёта: колонны, фермы и связи"
            width={1325}
            height={780}
            fetchPriority="high"
          />
        </div>
      </Container>

      <section className="section" aria-labelledby="types-title">
        <Container>
          <Grid className={s.sectionHead}>
            <Col area="head">
              <h2 id="types-title" className="t-h2">
                Что делаем
              </h2>
            </Col>
            <Col area="aside">
              <p className="t-muted">
                {typo("Сталь С245–С345 со своего склада: металл не ждём от поставщика, поэтому сроки считаем от дня аванса.")}
              </p>
            </Col>
          </Grid>
          <Grid as="ul" className={s.types}>
            {types.map((t) => (
              <li key={t.slug} className={s.type}>
                <div className={s.typeArt}>
                  <img
                    src={asset(`/constructions/${t.slug}.webp`)}
                    srcSet={srcSet(`/constructions/${t.slug}.webp`, t.image.width)}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    alt=""
                    width={t.image.width}
                    height={t.image.height}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className={s.typeBody}>
                  <p className={s.typeNum}>{t.number}</p>
                  <h3 className="t-h3">{t.title}</h3>
                  <p className="t-muted">{t.text}</p>
                  <dl className={s.specs}>
                    {t.specs.map((sp) => (
                      <div key={sp.label}>
                        <dt>{sp.label}</dt>
                        <dd>{sp.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </li>
            ))}
          </Grid>
        </Container>
      </section>

      <section className="section" aria-labelledby="stages-title">
        <Container>
          <Grid className={s.sectionHead}>
            <Col area="head">
              <h2 id="stages-title" className="t-h2">
                Как работаем
              </h2>
            </Col>
            <Col area="aside">
              <p className="t-muted">{typo("От чертежа до машины на объекте — в одном цеху. Ответственный инженер ведёт заказ от расчёта до отгрузки.")}</p>
            </Col>
          </Grid>
          <ol className={s.stages}>
            {steps.map((st) => (
              <Grid as="li" key={st.number} className={s.stage}>
                <p className={s.stageNum}>{st.number}</p>
                <h3 className={cx("t-h3", s.stageTitle)}>{st.title}</h3>
                <div className={s.stageText}>
                  <p>{st.text}</p>
                  <p className={s.stageTerm}>{st.term}</p>
                </div>
                <div className={s.stageArt}>
                  <img
                    src={asset(st.image.src)}
                    srcSet={srcSet(st.image.src, st.image.width, [st.image.variant])}
                    sizes="(max-width: 640px) 100vw, 25vw"
                    alt=""
                    width={st.image.width}
                    height={st.image.height}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </Grid>
            ))}
          </ol>
        </Container>
      </section>

      <section id="drawing" className="section band" aria-labelledby="drawing-title">
        <Container>
          <Grid className={s.sectionHead}>
            <Col area="head">
              <h2 id="drawing-title" className="t-h2">
                Расчёт по&nbsp;чертежу
              </h2>
            </Col>
            <Col area="aside">
              <p className="t-muted">{typo("Пришлите КМ, КМД или эскиз с размерами — посчитаем массу, цену и срок за 2 рабочих дня. Бесплатно.")}</p>
            </Col>
          </Grid>
          <Grid className={s.formGrid}>
            <Col area="form">
              <DrawingForm />
            </Col>
            <Col area="formAside" className={s.formAside}>
              <dl className={c.facts}>
                <div>
                  <dt>Что прислать</dt>
                  <dd>{typo("КМ, КМД, DWG или эскиз")}</dd>
                </div>
                <div>
                  <dt>Что вернём</dt>
                  <dd>{typo("массу, цену, срок")}</dd>
                </div>
                <div>
                  <dt>Срок изготовления</dt>
                  <dd>{typo("от 3 рабочих дней")}</dd>
                </div>
                <div>
                  <dt>Доставка</dt>
                  <dd>{typo("вместе с прокатом")}</dd>
                </div>
              </dl>
              <p className="t-muted">
                {typo("Большой комплект — пришлите ссылкой на облако в поле «Что нужно» или на почту")}{" "}
                <a className="link" href={`mailto:${company.email}`}>
                  {company.email}
                </a>
                .
              </p>
            </Col>
          </Grid>
        </Container>
      </section>
    </>
  );
}
