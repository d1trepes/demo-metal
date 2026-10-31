"use client";

import { useRef, useState, type FormEvent } from "react";
import { Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConsentCheckbox, TextArea, TextField } from "@/components/ui/Field";
import { sendQuoteRequest } from "@/lib/api";
import type { QuoteRequestResult } from "@/lib/types";
import s from "./QuoteSection.module.css";

const MAX_FILE_MB = 20;
const FILE_TYPES = ".pdf,.xlsx,.xls,.docx,.dwg,.dxf,.jpg,.jpeg,.png";

type Errors = Partial<Record<"name" | "phone" | "message" | "file", string>>;

/** Телефон: от 10 цифр, остальное — как ввёл человек. */
const phoneOk = (v: string) => v.replace(/\D/g, "").length >= 10;

/** Форма «Расчёт заявки» на главной. Отправка — только через lib/api.ts (sendQuoteRequest). */
export function QuoteForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<QuoteRequestResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (f: File | undefined) => {
    if (!f) return;
    if (f.size > MAX_FILE_MB * 1024 * 1024) {
      setErrors((e) => ({ ...e, file: `Файл больше ${MAX_FILE_MB} МБ — пришлите ссылку в поле выше` }));
      return;
    }
    setErrors((e) => ({ ...e, file: undefined }));
    setFile(f);
  };

  const clearFile = () => {
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const value = (k: string) => String(data.get(k) ?? "").trim();

    const next: Errors = {};
    if (!value("name")) next.name = "Как к вам обращаться";
    if (!phoneOk(value("phone"))) next.phone = "Нужен номер из 10–11 цифр";
    if (!value("message") && !file) next.message = "Опишите позиции или приложите спецификацию";
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
        <p className="t-muted">
          Менеджер уточнит позиции, КП в PDF придёт на почту, если вы её указали.
        </p>
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
      <TextField label="Почта" name="email" type="email" autoComplete="email" hint="Пришлём КП в PDF" />
      <TextField label="Компания или ИНН" name="company" autoComplete="organization" hint="Для счёта, можно потом" />
      <TextArea
        className={s.wide}
        label="Что нужно"
        name="message"
        rows={4}
        placeholder={"Арматура А500С Ø12, 11,7 м — 8 т\nБалка 20Б1, резка по 6 м — 14 шт\nДоставка: Берёзовский, к 12.11"}
        error={errors.message}
      />

      <div className={s.wide}>
        <input
          ref={fileRef}
          id="quote-file"
          type="file"
          name="file"
          accept={FILE_TYPES}
          className="visually-hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
          aria-describedby="quote-file-msg"
        />
        {file ? (
          <div className={s.fileChosen}>
            <Paperclip aria-hidden="true" />
            <span className={s.fileName}>{file.name}</span>
            <span className="t-muted t-nums">{(file.size / 1024 / 1024).toFixed(1)} МБ</span>
            <button type="button" className={s.fileRemove} onClick={clearFile} aria-label="Убрать файл">
              <X aria-hidden="true" />
            </button>
          </div>
        ) : (
          <label htmlFor="quote-file" className={s.fileDrop}>
            <Paperclip aria-hidden="true" />
            <span>Приложить спецификацию или чертёж</span>
          </label>
        )}
        <p id="quote-file-msg" className={errors.file ? s.fileError : s.fileHint}>
          {errors.file ?? `PDF, Excel, Word, DWG, JPG — до ${MAX_FILE_MB} МБ`}
        </p>
      </div>

      <ConsentCheckbox name="consent" className={s.wide} />

      <div className={s.submit}>
        <Button type="submit" disabled={sending}>
          {sending ? "Отправляем…" : "Отправить на расчёт"}
        </Button>
        <p className="t-muted">Ответ — в течение 2 рабочих часов</p>
      </div>
    </form>
  );
}

/** «сегодня до 14:30», «завтра до 10:00», «в понедельник до 10:00». */
function callbackText(at: Date): string {
  const time = at.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const days = Math.round((new Date(at).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000);
  if (days === 0) return `сегодня до ${time}`;
  if (days === 1) return `завтра до ${time}`;
  const weekday = ["в воскресенье", "в понедельник", "во вторник", "в среду", "в четверг", "в пятницу", "в субботу"];
  return `${weekday[at.getDay()]} до ${time}`;
}
