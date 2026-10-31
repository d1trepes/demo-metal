import type { ButtonVariant } from "@/components/ui/Button";

/** Два направления в hero: переключаются вкладками внизу справа. */
export type HeroCta = { label: string; href: string; variant: ButtonVariant };

export type HeroSlide = {
  id: "stock" | "constructions";
  /** Короткое имя для переключателя. */
  name: string;
  /** Заголовок: каждая строка — отдельный элемент массива. */
  title: [string, string];
  lead: string;
  /** Кнопки справа под лидом: первая — акцентная. */
  ctas: [HeroCta, HeroCta];
  /** Подпись к списку фактов (метка над данными, не надзаголовок). */
  factsLabel: string;
  facts: string[];
};

export const heroSlides: HeroSlide[] = [
  {
    id: "stock",
    name: "Металлопрокат",
    title: ["Металлопрокат", "со склада"],
    lead: "1 860 позиций по ГОСТ: арматура, балка, лист, трубы. Резка в размер, отгрузка в день оплаты, доставка по УрФО своими длинномерами.",
    ctas: [
      { label: "Открыть каталог", href: "/catalog/", variant: "onInk" },
      { label: "Отправить спецификацию", href: "/kp/", variant: "onInkOutline" },
    ],
    factsLabel: "Склад",
    facts: ["12 400 т на складе", "Отгрузка в день оплаты до 15:00", "Резка в размер ±2 мм", "Сертификат на каждую партию"],
  },
  {
    id: "constructions",
    name: "Металлоконструкции",
    title: ["Металлоконструкции", "по вашим КМД"],
    lead: "Фермы, каркасы зданий, лестницы, ограждения, закладные. Расчёт по чертежу за 2 рабочих дня, сварка по ГОСТ 14771, покраска в цеху.",
    ctas: [
      { label: "Расчёт по чертежу", href: "/constructions/#calc", variant: "onInk" },
      { label: "Что делаем в цехе", href: "/constructions/", variant: "onInkOutline" },
    ],
    factsLabel: "Цех",
    facts: ["Цех 4 200 м², кран-балки 10 т", "До 180 т конструкций в месяц", "Расчёт по чертежу за 2 дня", "Грунт и покраска по ГОСТ 9.402"],
  },
];
