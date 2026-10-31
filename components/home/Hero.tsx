import { Header } from "@/components/layout/Header";
import { HeroContent } from "./HeroContent";
import { HeroVideo } from "./HeroVideo";
import s from "./Hero.module.css";

/**
 * Первый экран главной: видео на весь экран, поверх — стеклянная панель
 * во всю ширину с небольшим отступом от краёв (решение чата 2б: hero вне сетки A).
 */
export function Hero() {
  return (
    <section className={s.hero} aria-label="Пролёт — металлобаза и цех металлоконструкций">
      <HeroVideo />
      <div className={s.panel}>
        <Header variant="glass" />
        <HeroContent />
      </div>
    </section>
  );
}
