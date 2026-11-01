import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cx } from "@/lib/cx";
import s from "./Field.module.css";

type FieldShell = { label: string; hint?: string; error?: string; className?: string };

function Shell({ id, label, hint, error, className, children }: FieldShell & { id: string; children: ReactNode }) {
  return (
    <div className={cx(s.field, error && s.invalid, className)}>
      <label htmlFor={id} className={s.label}>
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-msg`} className={s.error} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-msg`} className={s.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Поле ввода с подписью, подсказкой и ошибкой. */
export function TextField({ label, hint, error, className, id, ...rest }: FieldShell & InputHTMLAttributes<HTMLInputElement>) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <Shell id={fieldId} label={label} hint={hint} error={error} className={className}>
      <input
        id={fieldId}
        className={s.input}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${fieldId}-msg` : undefined}
        {...rest}
      />
    </Shell>
  );
}

/** Многострочное поле. */
export function TextArea({ label, hint, error, className, id, ...rest }: FieldShell & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <Shell id={fieldId} label={label} hint={hint} error={error} className={className}>
      <textarea
        id={fieldId}
        className={s.input}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${fieldId}-msg` : undefined}
        {...rest}
      />
    </Shell>
  );
}

/** Выпадающий список (адрес доставки, длина хлыста). Нативный select — удобен на телефоне. */
export function SelectField({ label, hint, error, className, id, children, ...rest }: FieldShell & SelectHTMLAttributes<HTMLSelectElement>) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <Shell id={fieldId} label={label} hint={hint} error={error} className={className}>
      <span className={s.selectWrap}>
        <select
          id={fieldId}
          className={cx(s.input, s.select)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${fieldId}-msg` : undefined}
          {...rest}
        >
          {children}
        </select>
        <ChevronDown aria-hidden="true" className={s.chevron} />
      </span>
    </Shell>
  );
}

/** Чекбокс. Для форм — ConsentCheckbox. */
export function Checkbox({ children, className, ...rest }: InputHTMLAttributes<HTMLInputElement> & { children: ReactNode }) {
  return (
    <label className={cx(s.check, className)}>
      <input type="checkbox" {...rest} />
      <span>{children}</span>
    </label>
  );
}

/** Согласие на обработку ПДн — обязательно в каждой форме (152-ФЗ). */
export function ConsentCheckbox(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Checkbox required {...props}>
      Согласен на обработку персональных данных по{" "}
      <Link href="/privacy" className="link">
        политике конфиденциальности
      </Link>
    </Checkbox>
  );
}
