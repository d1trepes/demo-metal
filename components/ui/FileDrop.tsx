"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import { Paperclip, X } from "lucide-react";
import { cx } from "@/lib/cx";
import s from "./FileDrop.module.css";

const NB = " ";
export const DRAWING_FILE_TYPES = ".pdf,.xlsx,.xls,.docx,.dwg,.dxf,.jpg,.jpeg,.png";

type FileDropProps = {
  file: File | null;
  onChange: (file: File | null) => void;
  /** Ошибка снаружи (например, «приложите чертёж»). Своя ошибка размера показывается здесь же. */
  error?: string;
  title?: string;
  hint?: string;
  maxMb?: number;
  accept?: string;
  className?: string;
};

/**
 * Поле файла в одну строку: скрепка · подпись · справа форматы. Перетаскивание или клик.
 * Выбранный файл — строкой с размером и крестиком. Используется в формах главной и /constructions.
 */
export function FileDrop({
  file,
  onChange,
  error,
  title = "Приложить спецификацию или чертёж",
  hint,
  maxMb = 20,
  accept = DRAWING_FILE_TYPES,
  className,
}: FileDropProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [sizeError, setSizeError] = useState<string>();

  const pick = (f: File | undefined) => {
    if (!f) return;
    if (f.size > maxMb * 1024 * 1024) {
      setSizeError(`Файл больше ${maxMb}${NB}МБ — пришлите ссылку в${NB}комментарии`);
      return;
    }
    setSizeError(undefined);
    onChange(f);
  };

  const clear = () => {
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    pick(event.dataTransfer.files?.[0]);
  };

  const message = sizeError ?? error;

  return (
    <div className={className}>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className={cx("visually-hidden", s.input)}
        onChange={(e) => pick(e.target.files?.[0])}
        aria-describedby={`${id}-msg`}
        aria-invalid={message ? true : undefined}
      />
      {file ? (
        <div className={s.chosen}>
          <Paperclip aria-hidden="true" />
          <span className={s.name}>{file.name}</span>
          <span className="t-muted t-nums">
            {(file.size / 1024 / 1024).toFixed(1)}
            {NB}МБ
          </span>
          <button type="button" className={s.remove} onClick={clear} aria-label="Убрать файл">
            <X aria-hidden="true" />
          </button>
        </div>
      ) : (
        <label
          htmlFor={id}
          className={cx(s.drop, dragging && s.dragging, message && s.invalid)}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <Paperclip aria-hidden="true" />
          <span className={s.title}>{title}</span>
          <span id={`${id}-msg`} className={message ? s.error : s.hint}>
            {message ?? hint ?? `PDF, Excel, DWG — до${NB}${maxMb}${NB}МБ`}
          </span>
        </label>
      )}
    </div>
  );
}
