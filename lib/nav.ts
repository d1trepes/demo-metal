/** Навигация и контакты компании — одно место для шапки, мобильного меню и подвала. */

export const mainNav = [
  { href: "/catalog/", label: "Каталог" },
  { href: "/constructions/", label: "Металлоконструкции" },
  { href: "/about/", label: "О производстве" },
  { href: "/contacts/", label: "Контакты" },
] as const;

export const company = {
  name: "Пролёт",
  legalName: "ООО «Пролёт»",
  city: "Екатеринбург",
  address: "Екатеринбург, ул. Монтажников, 26, склад 3",
  phone: "+7 343 300-14-26",
  phoneHref: "tel:+73433001426",
  email: "zakaz@prolet-metall.ru",
  /** Мессенджер отдела продаж (вымышленный, ссылкой не делаем — демо). */
  telegram: "@prolet_zakaz",
  hours: "Пн–Пт 8:00–18:00, Сб 9:00–14:00",
  shipping: "Отгрузка: Пн–Сб до 17:00",
  inn: "6670000000",
  kpp: "667001001",
} as const;
