import { Container } from "@/components/layout/Grid";
import { asset, srcSet } from "@/lib/asset";
import { Reveal } from "./Reveal";
import s from "./TruckDivider.module.css";

/**
 * Фура-разделитель (реф. docs/refs/04-truck-emons.png): стоит на границе каталога
 * и следующей секции, колёсами заходит в неё на --truck-overlap своей высоты.
 * Следующая секция должна начинаться с отступа .afterTruck (см. ниже).
 */
export function TruckDivider() {
  return (
    <div className={s.divider}>
      <Container className={s.inner}>
        <Reveal from="right" className={s.truck}>
          <img
            src={asset("/truck/truck.webp")}
            srcSet={srcSet("/truck/truck.webp", 1241)}
            sizes="(max-width: 640px) 90vw, 920px"
            alt="Длинномер «Пролёт» с пачками трубы и арматуры"
            width={1241}
            height={667}
            loading="lazy"
            decoding="async"
          />
        </Reveal>
      </Container>
    </div>
  );
}

/** Класс для секции сразу под фурой: верхний отступ = заход фуры + обычный отступ. */
export const afterTruck = s.afterTruck;
