"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { ConsentCheckbox, TextArea, TextField } from "@/components/ui/Field";
import { FileDrop } from "@/components/ui/FileDrop";
import { uploadDrawing } from "@/lib/api";
import { callbackText } from "@/lib/format";
import type { QuoteRequestResult } from "@/lib/types";
import s from "./Constructions.module.css";

const NB = " ";
type Errors = Partial<Record<"name" | "phone" | "description" | "file", string>>;
const phoneOk = (v: string) => v.replace(/\D/g, "").length >= 10;

/**
 * «Расчёт по чертежу» (паспорт §4): порядок как в форме главной — контакты → «Что нужно» → файл → согласие. Файл обязателен.
 * Отправка — через uploadDrawing в lib/api.ts.
 */
export function DrawingForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<QuoteRequestResult | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const value = (k: string) => String(data.get(k) ?? "").trim();

    const next: Errors = {};
    if (!value("name")) next.name = "Как к вам обращаться";
    if (!phoneOk(value("phone"))) next.phone = `Нужен номер из${NB}10–11 цифр`;
    if (!value("description")) next.description = "Что за конструкция и сколько";
    if (!file) next.file = `Приложите чертёж — PDF, DWG или фото эскиза`;
    setErrors(next);
    if (Object.keys(next).length) {
      requestAnimationFrame(() => form.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }
    if (!form.reportValidity() || !file) return; // согласие на ПДн

    setSending(true);
    try {
      setResult(
        await uploadDrawing({
          name: value("name"),
          phone: value("phone"),
          email: value("email") || undefined,
          company: value("company") || undefined,
          description: value("description"),
          file,
        }),
      );
    } finally {
      setSending(false);
    }
  };

  if (result) {
    return (
      <div className={s.done} role="status">
        <p className="t-label t-muted">Чертёж {result.id}</p>
        <p className="t-h3">Чертёж у{NB}инженера. Перезвоним {callbackText(new Date(result.callbackBy))}</p>
        <p className="t-muted">Уточним вопросы по{NB}узлам, расчёт с{NB}массой, ценой и{NB}сроком пришлём за{NB}2{NB}рабочих дня.</p>
        <Button
          variant="secondary"
          onClick={() => {
            setResult(null);
            setFile(null);
          }}
        >
          Отправить ещё один
        </Button>
      </div>
    );
  }

  return (
    <form className={s.form} onSubmit={onSubmit} noValidate aria-busy={sending}>
      <TextField label="Имя" name="name" autoComplete="name" error={errors.name} required />
      <TextField label="Телефон" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+7" error={errors.phone} required />
      <TextField label="Компания или ИНН" name="company" autoComplete="organization" />
      <TextField label="Почта" name="email" type="email" autoComplete="email" placeholder={`Пришлём расчёт в${NB}PDF`} />
      <TextArea
        className={s.wide}
        label="Что нужно"
        name="description"
        rows={3}
        placeholder={"Фермы ФС‑18, 12 шт, грунт ГФ‑021\nКаркас склада 24×48 м, монтаж свой"}
        error={errors.description}
        required
      />
      <FileDrop
        className={s.wide}
        file={file}
        onChange={(f) => {
          setFile(f);
          if (f) setErrors((e) => ({ ...e, file: undefined }));
        }}
        title="Приложить чертёж КМ, КМД или эскиз"
        hint={`PDF, DWG, DXF, фото — до${NB}50${NB}МБ`}
        maxMb={50}
        error={errors.file}
      />
      <ConsentCheckbox name="consent" className={s.wide} />
      <div className={s.submit}>
        <Button type="submit" disabled={sending}>
          {sending ? "Загружаем чертёж…" : "Отправить на расчёт"}
        </Button>
        <p className="t-muted">Расчёт — бесплатно, за{NB}2{NB}рабочих дня</p>
      </div>
    </form>
  );
}
