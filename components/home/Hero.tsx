import { Container } from "@/components/layout/Grid";
import { Header } from "@/components/layout/Header";
import { HeroContent } from "./HeroContent";
import { HeroVideo } from "./HeroVideo";
import s from "./Hero.module.css";

/**
 * Первый экран главной: видео во всю ширину (сетка B),
 * поверх — стеклянная панель с шапкой; текст внутри стоит по сетке A.
 */
export function Hero() {
  return (
    <section className={s.hero} aria-label="Пролёт — металлобаза и цех металлоконструкций">
      <HeroVideo />
      <Container className={s.frame}>
        <div className={s.panel}>
          <Header variant="glass" />
          <HeroContent />
        </div>
      </Container>
    </section>
  );
}
