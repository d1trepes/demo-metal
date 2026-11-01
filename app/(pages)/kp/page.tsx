import type { Metadata } from "next";
import { KpView } from "@/components/kp/KpView";
import { Col, Container, Grid } from "@/components/layout/Grid";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { typo } from "@/lib/typo";
import s from "../catalog/catalog.module.css";

export const metadata: Metadata = {
  title: "Список для КП",
  description: "Соберите позиции из каталога, укажите ИНН — пришлём коммерческое предложение в PDF в течение 2 рабочих часов.",
  robots: { index: false },
};

/** Список для КП (паспорт §4): шапка как у каталога, ниже — список, реквизиты и сводка (клиентский KpView). */
export default function KpPage() {
  return (
    <Container className={s.page}>
      <Grid className={s.head}>
        <Col area="head">
          <Breadcrumbs items={[{ href: "/", label: "Главная" }, { href: "/catalog/", label: "Каталог" }, { label: "Список для КП" }]} />
          <h1 className="t-h1">Список для КП</h1>
        </Col>
        <Col area="aside" className={s.lead}>
          <p>
            {typo(
              "Это не корзина: оплаты на сайте нет. Менеджер проверит остатки и резку, пришлёт КП в PDF, после согласования — счёт.",
            )}
          </p>
        </Col>
      </Grid>
      <KpView />
    </Container>
  );
}
