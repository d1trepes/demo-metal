import { Col, Container, Grid } from "@/components/layout/Grid";
import { company } from "@/lib/nav";
import { cx } from "@/lib/cx";
import { QuoteForm } from "./QuoteForm";
import s from "./QuoteSection.module.css";

/** Что происходит после заявки — реальная последовательность, поэтому с временем, а не с номерами. */
const steps = [
  { time: "15 мин", text: "Менеджер перезвонит: уточнит марки, длины, резку и куда везти" },
  { time: "2 часа", text: "КП в PDF: цена за тонну, вес, резка, доставка — одной суммой" },
  { time: "3 дня", text: "Держим металл в резерве по счёту, пока идёт оплата" },
];

/** Главная: форма расчёта (колонки 1–6) + что дальше и контакты (8–12). Якорь #calc. */
export function QuoteSection() {
  return (
    <section id="calc" className="section band" aria-labelledby="calc-title">
      <Container>
        <Grid className={s.grid}>
          <Col area="form">
            <h2 id="calc-title" className={cx("t-h2", s.title)}>
              Посчитаем
              <br />
              вашу заявку
            </h2>
            <p className={cx("t-lead", s.lead)}>
              Пришлите спецификацию или перечислите позиции — ответим ценой с резкой и доставкой.
            </p>
            <QuoteForm />
          </Col>
          <Col area="formAside" className={s.aside}>
            <ol className={s.steps}>
              {steps.map((step) => (
                <li key={step.time} className={s.step}>
                  <span className={s.stepTime}>{step.time}</span>
                  <span>{step.text}</span>
                </li>
              ))}
            </ol>
            <dl className={s.contacts}>
              <div>
                <dt className="t-label t-muted">Телефон</dt>
                <dd>
                  <a href={company.phoneHref} className={s.phone}>
                    {company.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="t-label t-muted">Почта для заявок</dt>
                <dd>
                  <a href={`mailto:${company.email}`} className="link">
                    {company.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="t-label t-muted">Склад</dt>
                <dd>
                  {company.address}
                  <br />
                  {company.hours}
                </dd>
              </div>
            </dl>
          </Col>
        </Grid>
      </Container>
    </section>
  );
}
