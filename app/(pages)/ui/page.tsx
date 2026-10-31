import type { Metadata } from "next";
import { ArrowRight, Download } from "lucide-react";
import { Col, Container, Grid } from "@/components/layout/Grid";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConsentCheckbox, TextArea, TextField } from "@/components/ui/Field";
import { Table, type Column } from "@/components/ui/Table";
import { formatPrice } from "@/lib/format";
import s from "./ui.module.css";

export const metadata: Metadata = { title: "UI-кит" };

type Row = { size: string; grade: string; weight: number; length: string; price: number; stock: boolean };

const rows: Row[] = [
  { size: "⌀ 10", grade: "А500С", weight: 0.617, length: "11,7 м", price: 61200, stock: true },
  { size: "⌀ 12", grade: "А500С", weight: 0.888, length: "11,7 м", price: 58900, stock: true },
  { size: "⌀ 16", grade: "А500С", weight: 1.578, length: "11,7 м", price: 59400, stock: true },
  { size: "⌀ 25", grade: "А500С", weight: 3.853, length: "11,7 м", price: 60100, stock: false },
];

const columns: Column<Row>[] = [
  { key: "size", title: "Размер, мм", render: (r) => r.size },
  { key: "grade", title: "Класс", render: (r) => r.grade },
  { key: "weight", title: "Масса 1 м, кг", numeric: true, render: (r) => r.weight.toFixed(3).replace(".", ",") },
  { key: "length", title: "Длина", render: (r) => r.length },
  { key: "price", title: "Цена с НДС", numeric: true, render: (r) => formatPrice(r.price, "т") },
  {
    key: "stock",
    title: "Наличие",
    render: (r) => (r.stock ? <Badge tone="success">В наличии</Badge> : <Badge tone="warning">Под заказ, 3 дня</Badge>),
  },
];

/** Внутренняя страница: витрина UI-кита и сетки. В навигации её нет. */
export default function UiKitPage() {
  return (
    <Container className={s.page}>
      <h1 className="t-h1">UI-кит</h1>

      <section className={s.block}>
        <h2 className="t-h3">Сетка: 12 колонок</h2>
        <Grid className={s.gridDemo}>
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className={s.gridCell}>
              {i + 1}
            </div>
          ))}
        </Grid>
      </section>

      <section className={s.block}>
        <h2 className="t-h3">Типографика</h2>
        <p className="t-display">Пролёт 12 400 т</p>
        <p className="t-h2">Балка 20Б1 ГОСТ Р 57837</p>
        <p className="t-lead">Лид: резка в размер ±2 мм, отгрузка в день оплаты до 15:00.</p>
        <p>
          Основной текст. Арматура А500С по ГОСТ 34028-2016 поставляется прутками 11,7 м или в мотках. Ссылка{" "}
          <a href="#" className="link">
            в тексте
          </a>
          .
        </p>
        <p className="t-label t-muted">Метка над данными</p>
      </section>

      <section className={s.block}>
        <h2 className="t-h3">Кнопки</h2>
        <div className={s.row}>
          <Button>
            В список КП <ArrowRight aria-hidden="true" />
          </Button>
          <Button variant="secondary">Рассчитать вес</Button>
          <Button variant="ghost">
            <Download aria-hidden="true" /> Скачать прайс
          </Button>
          <Button size="sm">Малая</Button>
          <Button disabled>Недоступна</Button>
        </div>
        <div className={`${s.row} ${s.ink}`}>
          <Button variant="onInk">На тёмном</Button>
          <Button variant="onInkOutline">Рамка на тёмном</Button>
        </div>
      </section>

      <section className={s.block}>
        <h2 className="t-h3">Бейджи</h2>
        <div className={s.row}>
          <Badge tone="success">В наличии</Badge>
          <Badge tone="warning">Под заказ</Badge>
          <Badge tone="danger">Ошибка</Badge>
          <Badge>Отправлен</Badge>
          <Badge tone="ink">КП готово</Badge>
        </div>
      </section>

      <section className={s.block}>
        <h2 className="t-h3">Форма</h2>
        <Grid>
          <Col area="form" as="form" className={s.form}>
            <TextField label="ИНН" inputMode="numeric" placeholder="6670000000" hint="Подставим название и КПП" />
            <TextField label="Телефон" type="tel" placeholder="+7 900 000-00-00" error="Укажите телефон" />
            <TextArea label="Комментарий" placeholder="Доставка на объект, ул. Блюхера, 50" />
            <ConsentCheckbox />
            <Button type="submit">Отправить запрос</Button>
          </Col>
          <Col area="formAside" className="t-muted">
            Колонки 8–12: пояснение или контакты рядом с формой.
          </Col>
        </Grid>
      </section>

      <section className={s.block}>
        <h2 className="t-h3">Таблица ТТХ</h2>
        <Table caption="Арматура А500С" columns={columns} rows={rows} rowKey={(r) => r.size} />
      </section>
    </Container>
  );
}
