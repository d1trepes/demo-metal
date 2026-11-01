import { Col, Container, Grid } from "@/components/layout/Grid";
import { company } from "@/lib/nav";
import { cx } from "@/lib/cx";
import { typo } from "@/lib/typo";
import { QuoteForm } from "./QuoteForm";
import tiles from "./CatalogTiles.module.css";
import s from "./QuoteSection.module.css";

/**
 * Главная: форма заявки (чат 5г). Заголовок по типовой раскладке (1–8 + подзаголовок 9–12),
 * ниже слева форма, справа крупные контакты — куда звонить и писать. Без карточек, разделители линиями. Якорь #calc.
 */
export function QuoteSection() {
  return (
    <section id="calc" className="section band" aria-labelledby="calc-title">
      <Container>
        <Grid className={tiles.head}>
          <Col area="head">
            <h2 id="calc-title" className="t-h2">
              Посчитаем
              <br />
              вашу заявку
            </h2>
          </Col>
          <Col area="aside">
            <p className="t-muted">
              {typo("Пришлите спецификацию или перечислите позиции — ответим ценой с резкой и доставкой.")}
            </p>
          </Col>
        </Grid>

        <Grid className={s.grid}>
          <div className={s.formCol}>
            <QuoteForm />
          </div>

          <dl className={s.contacts}>
            <div className={s.contact}>
              <dt className={cx("t-label", s.contactLabel)}>Отдел продаж</dt>
              <dd>
                <a href={company.phoneHref} className={s.contactBig}>
                  {company.phone}
                </a>
              </dd>
            </div>
            <div className={s.contact}>
              <dt className={cx("t-label", s.contactLabel)}>Почта для заявок</dt>
              <dd>
                <a href={`mailto:${company.email}`} className={s.contactBig}>
                  {company.email}
                </a>
              </dd>
            </div>
            <div className={s.contact}>
              <dt className={cx("t-label", s.contactLabel)}>Telegram</dt>
              <dd className={s.contactBig}>{company.telegram}</dd>
            </div>
            <div className={cx(s.contact, s.contactPair)}>
              <div>
                <dt className={cx("t-label", s.contactLabel)}>Склад</dt>
                <dd>{typo(company.address)}</dd>
              </div>
              <div>
                <dt className={cx("t-label", s.contactLabel)}>Часы работы</dt>
                <dd>{typo(company.hours)}</dd>
              </div>
            </div>
          </dl>

        </Grid>
      </Container>
    </section>
  );
}
