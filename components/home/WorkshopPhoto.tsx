import { asset } from "@/lib/asset";
import s from "./WorkshopPhoto.module.css";

/**
 * Полноширинное фото цеха (чат 5б, «ритм картинок») между глобусом и объектами.
 * Сетка B: картинка от края до края, текста внутри нет. 21:9, ч/б, public/workshop/hall.webp.
 */
export function WorkshopPhoto() {
  return (
    <figure className={s.band}>
      <img
        className={s.img}
        src={asset("/workshop/hall.webp")}
        alt="Цех металлоконструкций «Пролёт»: пролёт с кран-балками, на стеллажах — сваренные балки"
        width={1584}
        height={672}
        loading="lazy"
        decoding="async"
      />
    </figure>
  );
}
