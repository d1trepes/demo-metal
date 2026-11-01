import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/account/LoginForm";
import { Container, Grid } from "@/components/layout/Grid";
import { asset, srcSet } from "@/lib/asset";
import { typo } from "@/lib/typo";
import s from "@/components/account/Login.module.css";

export const metadata: Metadata = {
  title: "Вход и регистрация",
  description: "Кабинет закупщика: статусы заказов, запросы КП, счета и УПД в PDF, повтор заказа одной кнопкой.",
  robots: { index: false },
};

const features = [
  ["Заказы", "Статус от оплаты до отгрузки — с датами каждого этапа"],
  ["Документы", "КП, счета, УПД в PDF — без писем менеджеру"],
  ["Повтор заказа", "Те же позиции и длины — в список КП одной кнопкой"],
  ["Реквизиты", "ИНН, КПП и адреса объектов подставляются в каждый запрос"],
];

/** Вход и регистрация (паспорт §4): форма 1–5, справа 7–12 — рендер площадки и что есть в кабинете. */
export default function LoginPage() {
  return (
    <Container className={s.page}>
      <Grid className={s.layout}>
        <div className={s.formCol}>
          <h1 className="t-h1">Вход для клиентов</h1>
          <p className={s.lead}>
            {typo("Заказы, счета и УПД — в одном месте. Регистрация по ИНН занимает минуту, цены по договору подключит менеджер.")}
          </p>
          {/* useSearchParams внутри формы — для статичного экспорта нужен Suspense */}
          <Suspense>
            <LoginForm demoNote={typo("Заказы, запросы КП, счета и УПД вымышленной компании «УралСтройМонтаж». Пароль не нужен.")} />
          </Suspense>
        </div>
        <div className={s.asideCol}>
          <div className={s.art}>
            <img
              src={asset("/pages/base.webp")}
              srcSet={srcSet("/pages/base.webp", 1370, [800])}
              sizes="(max-width: 1024px) 100vw, 50vw"
              alt=""
              width={1370}
              height={754}
            />
          </div>
          <dl className={s.features}>
            {features.map(([title, text]) => (
              <div key={title}>
                <dt>{title}</dt>
                <dd>{typo(text)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Grid>
    </Container>
  );
}
