/** Личный кабинет: названия статусов, даты, разделы. Тексты статусов КП — в components/kp/KpSteps.tsx. */
import type { BadgeTone } from "@/components/ui/Badge";
import type { DocumentKind, KpStatus, OrderStatus } from "./types";

const NB = " ";

/** Разделы кабинета — вкладки под заголовком. */
export const accountNav = [
  { href: "/account/", label: "Обзор" },
  { href: "/account/requests/", label: "Запросы КП" },
  { href: "/account/orders/", label: "Заказы" },
  { href: "/account/documents/", label: "Документы" },
  { href: "/account/favorites/", label: "Избранное" },
  { href: "/account/company/", label: "Реквизиты" },
] as const;

/** Этапы заказа (паспорт §5): оплачен → в производстве → готов к отгрузке → отгружен. */
export const ORDER_STEPS: { status: OrderStatus; title: string; text: string }[] = [
  { status: "paid", title: "Оплачен", text: `Оплата пришла, металл зарезервирован` },
  { status: "production", title: "В производстве", text: `Резка в${NB}размер, сборка пакетов` },
  { status: "ready", title: `Готов к${NB}отгрузке`, text: `Пакеты на${NB}площадке, ждём машину` },
  { status: "shipped", title: "Отгружен", text: `УПД и${NB}сертификаты — в${NB}документах` },
];

export const ORDER_STATUS: Record<OrderStatus, { label: string; tone: BadgeTone }> = {
  paid: { label: "Оплачен", tone: "neutral" },
  production: { label: "В производстве", tone: "warning" },
  ready: { label: "Готов к отгрузке", tone: "success" },
  shipped: { label: "Отгружен", tone: "ink" },
};

export const KP_STATUS: Record<KpStatus, { label: string; tone: BadgeTone }> = {
  sent: { label: "Отправлен", tone: "neutral" },
  "in-work": { label: "В работе", tone: "warning" },
  "kp-ready": { label: "КП готово", tone: "success" },
  invoiced: { label: "Счёт выставлен", tone: "ink" },
};

export const DOC_KIND: Record<DocumentKind, string> = { kp: "КП", invoice: "Счёт", upd: "УПД" };

/** Даты показываем по Екатеринбургу — там склад, и сборка не зависит от часового пояса машины. */
const dateFmt = new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Yekaterinburg" });
const shortFmt = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", timeZone: "Asia/Yekaterinburg" });

/** «28.10.2026» */
export function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso));
}

/** «28 окт.» — для таймлайна заказа. */
export function formatShortDate(iso: string): string {
  return shortFmt.format(new Date(iso)).replace(" ", NB);
}
