"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { ConsentCheckbox, TextArea, TextField } from "@/components/ui/Field";
import { FileDrop } from "@/components/ui/FileDrop";
import { sendQuoteRequest } from "@/lib/api";
import { callbackText } from "@/lib/format";
import type { QuoteRequestResult } from "@/lib/types";
import s from "./QuoteSection.module.css";

const NB = " "; // клиентский компонент: typograf сюда не тянем, неразрывные пробелы — вручную

type Errors = Partial<Record<"name" | "phone" | "message", string>>;

/** Телефон: от 10 цифр, остальное — как ввёл человек. */
export const phoneOk = (v: string) => v.replace(/\D/g, "").length >= 10;

/**
 * Форма заявки на главной (чат 5в): сначала все текстовые поля парами, ниже — «что нужно» и файл.
 * Обязательны имя, телефон, согласие и «что нужно» ИЛИ файл. Ничего не спрятано.
 * Отправка — только через lib/api.ts.
 */
export function QuoteForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<QuoteRequestResult | null>(null);

  const onFile = (f: File | null) => {
    setFile(f);
    if (f) setErrors((e) => ({ ...e, message: undefined }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const value = (k: string) => String(data.get(k) ?? "").trim();

    const next: Errors = {};
    if (!value("name")) next.name = "Как к вам обращаться";
    if (!phoneOk(value("phone"))) next.phone = `Нужен номер из${NB}10–11 цифр`;
    if (!value("message") && !file) next.message = `Приложите спецификацию или перечислите позиции`;
    setErrors(next);
    if (Object.keys(next).length) {
      form.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      return;
    }
    if (!form.reportValidity()) return; // согласие на ПДн

    setSending(true);
    try {
      const res = await sendQuoteRequest({
        name: value("name"),
        phone: value("phone"),
        email: value("email") || undefined,
        company: value("company") || undefined,
        city: value("city") || undefined,
        deadline: value("deadline") || undefined,
        message: value("message"),
        file: file ?? undefined,
      });
      setResult(res);
    } finally {
      setSending(false);
    }
  };

  if (result) {
    const when = callbackText(new Date(result.callbackBy));
    return (
      <div className={s.done} role="status">
        <p className="t-label t-muted">Заявка {result.id}</p>
        <p className="t-h3">Приняли. Перезвоним {when}</p>
        <p className="t-muted">Менеджер уточнит позиции, КП в{NB}PDF пришлём на{NB}почту или в{NB}мессенджер.</p>
        <Button variant="secondary" onClick={() => setResult(null)}>
          Отправить ещё одну
        </Button>
      </div>
    );
  }

  return (
    <form className={s.form} onSubmit={onSubmit} noValidate aria-busy={sending}>
      <TextField label="Имя" name="name" autoComplete="name" error={errors.name} required />
      <TextField
        label="Телефон"
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="+7"
        error={errors.phone}
        required
      />

      <TextField
        label="Компания или ИНН"
        name="company"
        autoComplete="organization"
        placeholder="Для счёта, можно только ИНН"
      />
      <TextField
        label="Почта"
        name="email"
        type="email"
        autoComplete="email"
        placeholder={`Пришлём КП в${NB}PDF`}
      />
      <TextField label="Город доставки" name="city" autoComplete="address-level2" placeholder="Екатеринбург" />
      <TextField label="Когда нужно" name="deadline" placeholder={`к${NB}15.11 или срочно`} />

      <TextArea
        className={s.wide}
        label={file ? "Комментарий к файлу" : "Что нужно"}
        name="message"
        rows={3}
        placeholder={"Арматура А500С Ø12, 11,7 м — 8 т\nБалка 20Б1, резка по 6 м — 14 шт"}
        error={errors.message}
      />

      <FileDrop className={s.wide} file={file} onChange={onFile} />

      <ConsentCheckbox name="consent" className={s.wide} />

      <div className={s.submit}>
        <Button type="submit" disabled={sending}>
          {sending ? "Отправляем…" : "Отправить заявку"}
        </Button>
        <p className="t-muted">Ответим в{NB}течение 2{NB}рабочих часов</p>
      </div>
    </form>
  );
}
