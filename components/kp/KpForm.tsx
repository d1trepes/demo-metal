"use client";

import { useRef, useState, type FormEvent } from "react";
import { ConsentCheckbox, SelectField, TextArea, TextField } from "@/components/ui/Field";
import { lookupCompanyByInn } from "@/lib/api";
import { company as ourCompany } from "@/lib/nav";
import type { KpRequest, User } from "@/lib/types";
import s from "./Kp.module.css";

const NB = " ";
const PICKUP = "pickup";
const OTHER = "other";

type Errors = Partial<Record<"inn" | "name" | "contact" | "phone" | "email" | "address", string>>;
type Company = { inn: string; name: string; kpp: string; address: string };
type InnState = "idle" | "loading" | "found" | "notFound";

const phoneOk = (v: string) => v.replace(/\D/g, "").length >= 10;
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/**
 * Реквизиты и контакты для запроса КП. ИНН из 10 или 12 цифр → реквизиты подставляются сами
 * (lookupCompanyByInn). Вошедшему пользователю всё заполнено из кабинета.
 * Кнопка отправки живёт в сводке справа (атрибут form="kp-form").
 */
export function KpForm({ user, onSubmit }: { user: User | null; onSubmit: (data: Omit<KpRequest, "items">) => void }) {
  const [errors, setErrors] = useState<Errors>({});
  const [company, setCompany] = useState<Company>(user?.company ?? { inn: "", name: "", kpp: "", address: "" });
  const [innState, setInnState] = useState<InnState>(user ? "found" : "idle");
  const [delivery, setDelivery] = useState<string>(user?.deliveryAddresses[0] ?? PICKUP);
  const lookupSeq = useRef(0);

  const onInn = async (raw: string) => {
    const inn = raw.replace(/\D/g, "").slice(0, 12);
    setCompany((c) => ({ ...c, inn }));
    setErrors((e) => ({ ...e, inn: undefined }));
    if (inn.length !== 10 && inn.length !== 12) {
      setInnState("idle");
      return;
    }
    const seq = ++lookupSeq.current;
    setInnState("loading");
    const found = await lookupCompanyByInn(inn);
    if (seq !== lookupSeq.current) return; // пока искали, ИНН уже поменяли
    if (found) {
      setCompany(found);
      setErrors((e) => ({ ...e, name: undefined }));
      setInnState("found");
    } else setInnState("notFound");
  };

  const innHint = {
    idle: `10${NB}цифр для${NB}организации, 12${NB}— для${NB}ИП`,
    loading: "Ищем реквизиты…",
    found: `Реквизиты подставлены${company.name ? `: ${company.name}` : ""}`,
    notFound: "Не нашли — заполните вручную",
  }[innState];

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const value = (k: string) => String(data.get(k) ?? "").trim();

    const next: Errors = {};
    if (!/^\d{10}(\d{2})?$/.test(company.inn)) next.inn = `ИНН${NB}— 10 или 12${NB}цифр`;
    if (!company.name.trim()) next.name = "Название для счёта";
    if (!value("contact")) next.contact = "Кому писать по КП";
    if (!phoneOk(value("phone"))) next.phone = `Нужен номер из${NB}10–11 цифр`;
    if (!emailOk(value("email"))) next.email = `На эту почту пришлём КП в${NB}PDF`;
    if (delivery === OTHER && !value("address")) next.address = "Город и адрес объекта";
    setErrors(next);
    if (Object.keys(next).length) {
      requestAnimationFrame(() => form.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }
    if (!form.reportValidity()) return; // согласие на ПДн

    onSubmit({
      company: { inn: company.inn, name: company.name.trim(), kpp: company.kpp || undefined, address: company.address || undefined },
      contact: { name: value("contact"), phone: value("phone"), email: value("email") },
      delivery: delivery === PICKUP ? `Самовывоз: ${ourCompany.address}` : delivery === OTHER ? value("address") : delivery,
      comment: value("comment") || undefined,
    });
  };

  return (
    <form id="kp-form" className={s.form} onSubmit={submit} noValidate>
      <fieldset className={s.fieldset}>
        <legend className={s.legend}>Покупатель</legend>
        <TextField
          label="ИНН"
          name="inn"
          inputMode="numeric"
          autoComplete="off"
          value={company.inn}
          onChange={(e) => onInn(e.target.value)}
          hint={innHint}
          error={errors.inn}
          aria-busy={innState === "loading"}
          required
        />
        <TextField
          label="КПП"
          name="kpp"
          inputMode="numeric"
          value={company.kpp}
          onChange={(e) => setCompany((c) => ({ ...c, kpp: e.target.value.replace(/\D/g, "").slice(0, 9) }))}
          hint="Для ИП не нужен"
        />
        <TextField
          className={s.wide}
          label="Организация"
          name="company"
          autoComplete="organization"
          value={company.name}
          onChange={(e) => setCompany((c) => ({ ...c, name: e.target.value }))}
          error={errors.name}
          required
        />
        <TextField
          className={s.wide}
          label="Юридический адрес"
          name="legalAddress"
          value={company.address}
          onChange={(e) => setCompany((c) => ({ ...c, address: e.target.value }))}
        />
      </fieldset>

      <fieldset className={s.fieldset}>
        <legend className={s.legend}>Контакт</legend>
        <TextField label="Имя" name="contact" autoComplete="name" defaultValue={user?.name} error={errors.contact} required />
        <TextField
          label="Телефон"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+7"
          defaultValue={user?.phone}
          error={errors.phone}
          required
        />
        <TextField
          className={s.wide}
          label="Почта"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={user?.email}
          hint={errors.email ? undefined : `Сюда придёт КП в${NB}PDF и${NB}счёт`}
          error={errors.email}
          required
        />
      </fieldset>

      <fieldset className={s.fieldset}>
        <legend className={s.legend}>Получение</legend>
        <SelectField className={s.wide} label="Доставка" name="delivery" value={delivery} onChange={(e) => setDelivery(e.target.value)}>
          <option value={PICKUP}>Самовывоз — {ourCompany.address}</option>
          {user?.deliveryAddresses.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
          <option value={OTHER}>Доставка по адресу…</option>
        </SelectField>
        {delivery === OTHER && (
          <TextField
            className={s.wide}
            label="Адрес доставки"
            name="address"
            autoComplete="street-address"
            placeholder="Тюмень, ул. Республики, 200 — объект"
            hint={errors.address ? undefined : `Длинномер до${NB}12${NB}м — манипулятором или полуприцепом`}
            error={errors.address}
          />
        )}
        <TextArea
          className={s.wide}
          label="Комментарий к запросу"
          name="comment"
          rows={3}
          placeholder={`Срок, условия оплаты, нужны сертификаты качества на${NB}каждую партию…`}
        />
      </fieldset>

      <ConsentCheckbox name="consent" />
    </form>
  );
}
