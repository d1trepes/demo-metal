"use client";

import { useRef, useState, type DragEvent, type FormEvent } from "react";
import { Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConsentCheckbox, TextArea, TextField } from "@/components/ui/Field";
import { sendQuoteRequest } from "@/lib/api";
import { cx } from "@/lib/cx";
import type { QuoteRequestResult } from "@/lib/types";
import s from "./QuoteSection.module.css";

const MAX_FILE_MB = 20;
const FILE_TYPES = ".pdf,.xlsx,.xls,.docx,.dwg,.dxf,.jpg,.jpeg,.png";
const NB = " "; // клиентский компонент: typograf сюда не тянем, неразрывные пробелы — вручную

type Errors = Partial<Record<"name" | "phone" | "message" | "file", string>>;

/** Телефон: от 10 цифр, остальное — как ввёл человек. */
const phoneOk = (v: string) => v.replace(/\D/g, "").length >= 10;

/**
 * Форма заявки на главной (чат 5в): сначала все текстовые поля парами, ниже — «что нужно» и файл.
 * Обязательны имя, телефон, согласие и «что нужно» ИЛИ файл. Ничего не спрятано.
 * Отправка — только через lib/api.ts.
 */
export function QuoteForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<QuoteRequestResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (f: File | undefined) => {
    if (!f) return;
    if (f.size > MAX_FILE_MB * 1024 * 1024) {
      setErrors((e) => ({ ...e, file: `Файл больше ${MAX_FILE_MB}${NB}МБ — пришлите ссылку в${NB}поле ниже` }));
      return;
    }
    setErrors((e) => ({ ...e, file: undefined, message: undefined }));
    setFile(f);
  };

  const clearFile = () => {
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    onFile(event.dataTransfer.files?.[0]);
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
            <span className="t-muted t-nums">{(file.size / 1024 / 1024).toFixed(1)}{NB}МБ</span>
            <button type="button" className={s.fileRemove} onClick={clearFile} aria-label="Убрать файл">
              <X aria-hidden="true" />
            </button>
          </div>
        ) : (
          <label
            htmlFor="quote-file"
            className={cx(s.fileDrop, dragging && s.dragging)}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <Paperclip aria-hidden="true" />
            <span className={s.fileTitle}>Приложить спецификацию или чертёж</span>
            <span id="quote-file-msg" className={errors.file ? s.fileError : s.fileHint}>
              {errors.file ?? `PDF, Excel, DWG — до${NB}${MAX_FILE_MB}${NB}МБ`}
            </span>
          </label>
        )}
      </div>

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

/** «сегодня до 14:30», «завтра до 10:00», «в понедельник до 10:00». */
function callbackText(at: Date): string {
  const time = at.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const days = Math.round((new Date(at).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000);
  if (days === 0) return `сегодня до${NB}${time}`;
  if (days === 1) return `завтра до${NB}${time}`;
  const weekday = ["в воскресенье", "в понедельник", "во вторник", "в среду", "в четверг", "в пятницу", "в субботу"];
  return `${weekday[at.getDay()]} до${NB}${time}`;
}
