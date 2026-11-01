import { Header } from "@/components/layout/Header";
import { typoAll } from "@/lib/typo";
import { HeroContent } from "./HeroContent";
import { heroSlides } from "./heroSlides";
import { HeroVideo } from "./HeroVideo";
import s from "./Hero.module.css";

/**
 * Первый экран главной: видео на весь экран, поверх — ровная тонировка без рамки и скругления
 * (решение чата 2в). Внутри — своя 12-колоночная раскладка с полями --hero-pad.
 */
export function Hero() {
  return (
    <section className={s.hero} aria-label="Пролёт — металлобаза и цех металлоконструкций">
      <HeroVideo />
      <div className={s.panel}>
        <Header variant="glass" />
        <HeroContent slides={typoAll(heroSlides)} />
      </div>
    </section>
  );
}
