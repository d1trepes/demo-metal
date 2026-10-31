"use client";

import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { HeroSearch } from "./HeroSearch";
import { heroSlides } from "./heroSlides";
import s from "./Hero.module.css";

/** Текст hero с переключением «Металлопрокат / Металлоконструкции». */
export function HeroContent() {
  const [index, setIndex] = useState(0);
  const slide = heroSlides[index];
  const next = heroSlides[(index + 1) % heroSlides.length];
  const go = (step: number) => setIndex((i) => (i + step + heroSlides.length) % heroSlides.length);

  return (
    <>
      <div key={slide.id} className={s.content}>
        <h1 className={`t-display ${s.title}`}>
          {slide.title[0]}
          <br />
          {slide.title[1]}
        </h1>
        <p className={`t-lead ${s.lead}`}>{slide.lead}</p>

        {slide.id === "stock" ? (
          <HeroSearch />
        ) : (
          <div className={s.ctas}>
            <Button href="/constructions/#calc" variant="onInk">
              Расчёт по чертежу
            </Button>
            <Button href="/constructions/" variant="onInkOutline">
              Что делаем в цехе
            </Button>
          </div>
        )}
      </div>

      <div className={s.bottom}>
        <div key={`${slide.id}-facts`} className={s.facts}>
          <p className="t-label">{slide.factsLabel}</p>
          <ul>
            {slide.facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </div>

        <div className={s.switcher} role="group" aria-label="Направления">
          <button type="button" className={s.arrow} onClick={() => go(-1)} aria-label="Предыдущее направление">
            <ArrowDownLeft aria-hidden="true" />
          </button>
          <button type="button" className={s.switchLabel} onClick={() => go(1)}>
            <span className="t-nums">
              0{index + 1}/0{heroSlides.length}
            </span>
            {next.name}
          </button>
          <button type="button" className={s.arrow} onClick={() => go(1)} aria-label="Следующее направление">
            <ArrowUpRight aria-hidden="true" />
          </button>
        </div>
      </div>
    </>
  );
}
