import type { Metadata } from "next";
import Link from "next/link";
import { CopyRequisites } from "@/components/contacts/CopyRequisites";
import { YandexMap } from "@/components/contacts/YandexMap";
import { QuoteForm } from "@/components/home/QuoteForm";
import { Col, Container, Grid } from "@/components/layout/Grid";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { company } from "@/lib/nav";
import { typo } from "@/lib/typo";
import c from "../catalog/catalog.module.css";
import s from "@/components/contacts/Contacts.module.css";

export const metadata: Metadata = {
  title: "Контакты",
  description: "Отдел продаж, склад и цех в Екатеринбурге: телефон, почта, карта проезда для фур, часы работы и реквизиты.",
};

const requisites = [
  { label: "Полное название", value: `Общество с ограниченной ответственностью «${company.name}»` },
  { label: "ИНН / КПП", value: `${company.inn} / ${company.kpp}` },
  { label: "ОГРН", value: company.ogrn },
  { label: "Юридический адрес", value: company.legalAddress },
  { label: "Расчётный счёт", value: company.account },
  { label: "Банк", value: company.bank },
  { label: "БИК", value: company.bik },
  { label: "Корр. счёт", value: company.corrAccount },
  { label: "Директор", value: company.director },
];

const drivers = [
  { label: "Въезд для фур", value: "ворота 2 с ул. Монтажников" },
  { label: "Длинномер", value: "до 13,6 м, разворот на площадке" },
  { label: "Пропуск", value: "не нужен — номер счёта на КПП" },
  { label: "Весы", value: "автомобильные, до 60 т" },
  { label: "Погрузка", value: "Пн–Сб до 17:00, краном за 40 минут" },
];

/** Контакты (паспорт §4): крупные контакты, карта проезда, водителям, реквизиты, форма. */
export default function ContactsPage() {
  const requisitesText = [company.legalName, ...requisites.map((r) => `${r.label}: ${r.value}`)].join("\n");

  return (
    <>
      <Container className={s.top}>
        <Grid className={c.head}>
          <Col area="head">
            <Breadcrumbs items={[{ href: "/", label: "Главная" }, { label: "Контакты" }]} />
            <h1 className="t-h1">Контакты</h1>
          </Col>
          <Col area="aside" className={c.lead}>
            <dl className={c.facts}>
              <div>
                <dt>Офис и продажи</dt>
                <dd>{typo(company.hours)}</dd>
              </div>
              <div>
                <dt>Склад</dt>
                <dd>{typo(company.shipping)}</dd>
              </div>
            </dl>
          </Col>
        </Grid>

        <Grid className={s.main}>
          <dl className={s.contacts}>
            <div className={s.contact}>
              <dt className="t-label t-muted">Отдел продаж</dt>
              <dd>
                <a href={company.phoneHref} className={s.contactBig}>
                  {company.phone}
                </a>
              </dd>
            </div>
            <div className={s.contact}>
              <dt className="t-label t-muted">Почта для заявок</dt>
              <dd>
                <a href={`mailto:${company.email}`} className={s.contactBig}>
                  {company.email}
                </a>
              </dd>
            </div>
            <div className={s.contact}>
              <dt className="t-label t-muted">Telegram</dt>
              <dd className={s.contactBig}>{company.telegram}</dd>
            </div>
            <div className={s.contact}>
              <dt className="t-label t-muted">Склад и цех</dt>
              <dd className={s.contactAddress}>{typo(company.address)}</dd>
            </div>
          </dl>
          <div className={s.mapCol}>
            <YandexMap caption={typo("С ЕКАД — съезд на Сибирский тракт в сторону центра, через 1,2 км направо на ул. Монтажников. Вторые ворота — для грузовых.")} />
          </div>
        </Grid>
      </Container>

      <section className="section" aria-labelledby="drive-title">
        <Container>
          <Grid className={s.split}>
            <div className={s.splitCol}>
              <h2 id="drive-title" className="t-h3">
                Водителям
              </h2>
              <dl className={s.specs}>
                {drivers.map((d) => (
                  <div key={d.label}>
                    <dt>{d.label}</dt>
                    <dd>{typo(d.value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className={s.splitCol}>
              <h2 id="requisites-title" className="t-h3">
                Реквизиты
              </h2>
              <dl className={s.specs}>
                {requisites.map((r) => (
                  <div key={r.label}>
                    <dt>{r.label}</dt>
                    <dd className={s.nums}>{typo(r.value)}</dd>
                  </div>
                ))}
              </dl>
              <div>
                <CopyRequisites text={requisitesText} />
              </div>
            </div>
          </Grid>
        </Container>
      </section>

      <section id="write" className="section band" aria-labelledby="write-title">
        <Container>
          <Grid className={s.sectionHead}>
            <Col area="head">
              <h2 id="write-title" className="t-h2">
                Написать нам
              </h2>
            </Col>
            <Col area="aside">
              <p className="t-muted">{typo("Вопрос по наличию, счёт, сверка, претензия — всё сюда. Ответим за 2 часа в рабочее время.")}</p>
            </Col>
          </Grid>
          <Grid>
            <Col area="form">
              <QuoteForm />
            </Col>
            <Col area="aside" className={s.formAside}>
              <p>
                {typo("Нужен прокат по списку — удобнее собрать")}{" "}
                <Link className="link" href="/kp/">
                  список для КП
                </Link>
                {typo(": цены и масса посчитаются сами.")}
              </p>
              <p>
                {typo("Чертёж металлоконструкций — в")}{" "}
                <Link className="link" href="/constructions/#drawing">
                  расчёт по чертежу
                </Link>
                .
              </p>
            </Col>
          </Grid>
        </Container>
      </section>
    </>
  );
}
