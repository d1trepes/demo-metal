"use client";

import { useState } from "react";
import { cx } from "@/lib/cx";
import { heroSlides } from "./heroSlides";
import s from "./Hero.module.css";

/** Текст hero с переключением «Металлопрокат / Металлоконструкции». */
export function HeroContent() {
  const [index, setIndex] = useState(0);
  const slide = heroSlides[index];

  return (
    <>
      <div key={slide.id} className={s.content}>
        <h1 className={cx("t-display", s.title)}>
          {slide.title[0]}
          <br />
          {slide.title[1]}
        </h1>
        <p className={cx("t-lead", s.lead)}>{slide.lead}</p>
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

        <div className={s.switcher} role="group" aria-label="Направление">
          {heroSlides.map((item, i) => (
            <button
              key={item.id}
              type="button"
              className={s.tab}
              aria-pressed={i === index}
              onClick={() => setIndex(i)}
            >
              <span className="caps-center">{item.name}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
