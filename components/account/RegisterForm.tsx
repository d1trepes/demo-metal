"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { ConsentCheckbox, TextField } from "@/components/ui/Field";
import { lookupCompanyByInn } from "@/lib/api";
import type { CompanyLookup, RegisterRequest } from "@/lib/types";
import s from "./Login.module.css";

const NB = " ";
type Errors = Partial<Record<keyof RegisterRequest | "form", string>>;

/** Регистрация по ИНН: компания подтягивается сама, дальше контакт и пароль. onSubmit бросает ошибку — показываем её под формой. */
export function RegisterForm({ onSubmit, disabled }: { onSubmit: (request: RegisterRequest) => Promise<void>; disabled: boolean }) {
  const [company, setCompany] = useState<CompanyLookup | null>(null);
  const [errors, setErrors] = useState<Errors>({});

  async function onInnBlur(inn: string) {
    if (!inn) return;
    const found = await lookupCompanyByInn(inn);
    setCompany(found);
    setErrors((e) => ({ ...e, inn: found ? undefined : "ИНН — 10 цифр для организации, 12 для ИП" }));
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const request: RegisterRequest = {
      inn: String(data.get("inn") ?? "").replace(/\D/g, ""),
      name: String(data.get("name") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      password: String(data.get("password") ?? ""),
    };
    const next: Errors = {};
    if (!/^\d{10}(\d{2})?$/.test(request.inn)) next.inn = "ИНН — 10 цифр для организации, 12 для ИП";
    if (!request.name) next.name = "Как к вам обращаться";
    if (request.phone.replace(/\D/g, "").length < 10) next.phone = "Телефон для связи с менеджером";
    if (!request.email.includes("@")) next.email = "Рабочая почта — на неё придут КП и счета";
    if (request.password.length < 6) next.password = "Не короче 6 символов";
    if (!data.get("consent")) next.form = "Нужно согласие на обработку персональных данных";
    setErrors(next);
    if (Object.keys(next).length) return;
    try {
      await onSubmit(request);
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Не удалось зарегистрироваться" });
    }
  }

  return (
    <form className={s.form} onSubmit={submit} noValidate id="panel-register" role="tabpanel" aria-labelledby="tab-register">
      <TextField
        label="ИНН компании"
        name="inn"
        inputMode="numeric"
        maxLength={12}
        onBlur={(e) => onInnBlur(e.target.value.replace(/\D/g, ""))}
        error={errors.inn}
        hint={company ? `${company.name}${company.kpp ? ` · КПП${NB}${company.kpp}` : ""}` : "Название, КПП и адрес подтянем сами"}
      />
      <div className={s.pair}>
        <TextField label="Имя" name="name" autoComplete="name" error={errors.name} />
        <TextField label="Телефон" name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="+7" error={errors.phone} />
      </div>
      <TextField label="Рабочая почта" name="email" type="email" autoComplete="email" inputMode="email" error={errors.email} />
      <TextField label="Пароль" name="password" type="password" autoComplete="new-password" error={errors.password} hint="Не короче 6 символов" />
      <ConsentCheckbox name="consent" />
      {errors.form && (
        <p className={s.formError} role="alert">
          {errors.form}
        </p>
      )}
      <Button type="submit" variant="secondary" block disabled={disabled}>
        {disabled ? "Регистрируем…" : "Зарегистрироваться"}
      </Button>
      <p className={s.help}>
        Кабинет откроется сразу. Цены по{NB}договору и{NB}отсрочку менеджер подключит после проверки ИНН — в{NB}течение рабочего дня.
      </p>
    </form>
  );
}
