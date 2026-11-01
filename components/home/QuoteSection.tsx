import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Container, Grid } from "@/components/layout/Grid";
import { company } from "@/lib/nav";
import { cx } from "@/lib/cx";
import { typo, typoAll } from "@/lib/typo";
import { QuoteForm } from "./QuoteForm";
import s from "./QuoteSection.module.css";

/** Что происходит после заявки — реальная последовательность, поэтому с временем, а не с номерами. */
const steps = typoAll([
  { time: "15 мин", text: "Менеджер перезвонит: уточнит марки, длины, резку и куда везти" },
  { time: "2 часа", text: "КП в PDF: цена за тонну, вес, резка, доставка — одной суммой" },
  { time: "3 дня", text: "Держим металл в резерве по счёту, пока идёт оплата" },
]);

/**
 * Главная: форма заявки (чат 5б, прототип одобрен). Слева — заголовок, что будет дальше и контакты,
 * справа — короткая форма. Без карточек: текст прямо на фоне, разделители линиями. Якорь #calc.
 */
export function QuoteSection() {
  return (
    <section id="calc" className="section band" aria-labelledby="calc-title">
      <Container>
        <Grid className={s.grid}>
          <div className={s.info}>
            <h2 id="calc-title" className={cx("t-h2", s.title)}>
              Посчитаем
              <br />
              вашу заявку
            </h2>
            <p className={cx("t-lead", s.lead)}>
              {typo("Пришлите спецификацию или перечислите позиции — ответим ценой с резкой и доставкой.")}
            </p>

            <ol className={s.steps}>
              {steps.map((step) => (
                <li key={step.time} className={s.step}>
                  <span className={s.stepTime}>{step.time}</span>
                  <span>{step.text}</span>
                </li>
              ))}
            </ol>

            <ul className={s.contacts}>
              <li>
                <Phone aria-hidden="true" />
                <a href={company.phoneHref} className={s.phone}>
                  {company.phone}
                </a>
              </li>
              <li>
                <Mail aria-hidden="true" />
                <a href={`mailto:${company.email}`} className="link">
                  {company.email}
                </a>
              </li>
              <li>
                <MapPin aria-hidden="true" />
                <span>{typo(company.address)}</span>
              </li>
              <li>
                <Clock aria-hidden="true" />
                <span>{typo(company.hours)}</span>
              </li>
            </ul>
          </div>

          <div className={s.formCol}>
            <QuoteForm />
          </div>
        </Grid>
      </Container>
    </section>
  );
}
