"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

/** Кнопка «Скопировать реквизиты»: кладёт готовый текст карточки предприятия в буфер. */
export function CopyRequisites({ text }: { text: string }) {
  const [state, setState] = useState<"idle" | "done" | "fail">("idle");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState("done");
    } catch {
      setState("fail"); // нет доступа к буферу (http, старый браузер) — реквизиты видны на странице
    }
    window.setTimeout(() => setState("idle"), 2500);
  };

  return (
    <Button variant="secondary" onClick={copy} aria-live="polite">
      {state === "done" ? "Скопировано" : state === "fail" ? "Выделите текст вручную" : "Скопировать реквизиты"}
    </Button>
  );
}
