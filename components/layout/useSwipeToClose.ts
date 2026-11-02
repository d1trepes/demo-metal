"use client";

import { useRef, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, type RefObject } from "react";

/** Доля ширины панели, после которой отпускание закрывает меню. */
const CLOSE_SHARE = 0.3;
/** Скорость «быстрого жеста», px/мс. */
const FLICK_SPEED = 0.5;
/** Сдвиг пальца, после которого понятно направление жеста. */
const AXIS_LOCK_PX = 8;

type Gesture = {
  id: number;
  x0: number;
  y0: number;
  lastX: number;
  lastT: number;
  speed: number;
  axis: "x" | "y" | null;
};

/**
 * Свайп вправо по выдвижной панели: панель едет за пальцем,
 * отпустили дальше 30 % ширины или быстрым жестом — закрываем, иначе пружинит назад.
 * Вертикальный жест не трогаем — им листается список (touch-action: pan-y).
 */
export function useSwipeToClose(panelRef: RefObject<HTMLElement | null>, onClose: () => void) {
  const gesture = useRef<Gesture | null>(null);
  const dragged = useRef(false);

  const setOffset = (px: number | null) => {
    const el = panelRef.current;
    if (!el) return;
    if (px === null) {
      el.style.transform = "";
      el.style.transition = "";
    } else {
      el.style.transform = `translateX(${px}px)`;
      el.style.transition = "none";
    }
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragged.current = false;
    gesture.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, lastX: e.clientX, lastT: e.timeStamp, speed: 0, axis: null };
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    const dx = e.clientX - g.x0;
    const dy = e.clientY - g.y0;

    if (!g.axis) {
      if (Math.abs(dx) < AXIS_LOCK_PX && Math.abs(dy) < AXIS_LOCK_PX) return;
      g.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (g.axis === "y") return;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      dragged.current = true;
    }
    if (g.axis !== "x") return;

    const dt = Math.max(1, e.timeStamp - g.lastT);
    g.speed = (e.clientX - g.lastX) / dt;
    g.lastX = e.clientX;
    g.lastT = e.timeStamp;
    setOffset(Math.max(0, dx));
  };

  const finish = (e: ReactPointerEvent, cancelled: boolean) => {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    gesture.current = null;
    if (g.axis !== "x") return;

    const dx = Math.max(0, e.clientX - g.x0);
    const width = panelRef.current?.offsetWidth ?? 1;
    setOffset(null); // дальше едет CSS-переход: к закрытию или обратно
    if (!cancelled && (dx > width * CLOSE_SHARE || g.speed > FLICK_SPEED)) onClose();
  };

  /** После протяжки не срабатывает клик по ссылке под пальцем. */
  const onClickCapture = (e: ReactMouseEvent) => {
    if (!dragged.current) return;
    dragged.current = false;
    e.preventDefault();
    e.stopPropagation();
  };

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: (e: ReactPointerEvent) => finish(e, false),
    onPointerCancel: (e: ReactPointerEvent) => finish(e, true),
    onClickCapture,
  };
}
