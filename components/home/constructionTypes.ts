/**
 * Пять направлений цеха для раскрывающихся панелей на главной (реф. docs/refs/05).
 * Рендеры — public/constructions/<slug>.webp. Цифры согласованы с hero: цех 4 200 м²,
 * до 180 т/мес, расчёт по чертежу за 2 дня, сварка по ГОСТ 14771.
 * Пригодится и на /constructions (чат 8).
 */
export type ConstructionType = {
  slug: string;
  number: string;
  title: string;
  /** До 2 строк на десктопе (~85 знаков): что делаем, из чего. */
  text: string;
  /** Три коротких факта: срок, объём, норматив. */
  specs: { label: string; value: string }[];
  image: { width: number; height: number };
};

export const constructionTypes: ConstructionType[] = [
  {
    slug: "fermy",
    number: "01",
    title: "Фермы",
    text: "Стропильные фермы пролётом 12–36 м из профильной трубы и парных уголков, сталь С345.",
    specs: [
      { label: "Срок", value: "от 10 рабочих дней" },
      { label: "Объём", value: "до 60 т в месяц" },
      { label: "Норматив", value: "ГОСТ 23119‑78" },
    ],
    image: { width: 1123, height: 789 },
  },
  {
    slug: "karkas",
    number: "02",
    title: "Каркасы зданий",
    text: "Колонны, ригели, связи и прогоны для складов и цехов пролётом до 30 м.",
    specs: [
      { label: "Срок", value: "от 15 рабочих дней" },
      { label: "Объём", value: "до 400 т на объект" },
      { label: "Норматив", value: "ГОСТ 23118‑2019" },
    ],
    image: { width: 1086, height: 838 },
  },
  {
    slug: "lestnica",
    number: "03",
    title: "Лестницы и площадки",
    text: "Маршевые лестницы, площадки обслуживания и стремянки. Настил — рифлёный лист 4–6 мм.",
    specs: [
      { label: "Срок", value: "от 7 рабочих дней" },
      { label: "Ширина марша", value: "700–1200 мм" },
      { label: "Норматив", value: "ГОСТ 23120‑2016" },
    ],
    image: { width: 753, height: 895 },
  },
  {
    slug: "ograzhdenie",
    number: "04",
    title: "Ограждения",
    text: "Ограждения кровли, площадок и лестниц высотой 1000–1200 мм. Эмаль или горячий цинк.",
    specs: [
      { label: "Срок", value: "от 5 рабочих дней" },
      { label: "Объём", value: "до 2 000 пог. м в месяц" },
      { label: "Норматив", value: "ГОСТ 25772‑2021" },
    ],
    image: { width: 936, height: 878 },
  },
  {
    slug: "zakladnye",
    number: "05",
    title: "Закладные",
    text: "Закладные МН по серии 1.400-15: пластины 6–20 мм, анкеры из арматуры А500С.",
    specs: [
      { label: "Срок", value: "от 3 рабочих дней" },
      { label: "Партия", value: "от 50 штук" },
      { label: "Норматив", value: "ГОСТ 14098‑2014" },
    ],
    image: { width: 1122, height: 766 },
  },
];
