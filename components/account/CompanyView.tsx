"use client";

import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { lookupCompanyByInn, updateCompany } from "@/lib/api";
import { useAuthStore } from "@/lib/stores/auth";
import type { CompanyLookup, User } from "@/lib/types";
import s from "./Account.module.css";

const NB = " ";

/** Реквизиты и адреса доставки. Сохранение — api.updateCompany, профиль в сторе обновляется (подставится в /kp/). */
export function CompanyView() {
  const user = useAuthStore((st) => st.user);
  if (!user) return null;
  return <CompanyForm user={user} />;
}

function CompanyForm({ user }: { user: User }) {
  const setUser = useAuthStore((st) => st.setUser);
  const [company, setCompany] = useState<CompanyLookup>(user.company);
  const [addresses, setAddresses] = useState<string[]>(user.deliveryAddresses);
  const [newAddress, setNewAddress] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const [innError, setInnError] = useState<string | undefined>();

  const edit = (patch: Partial<CompanyLookup>) => {
    setCompany((c) => ({ ...c, ...patch }));
    setState("idle");
  };

  async function onInnBlur() {
    if (company.inn === user.company.inn) return;
    const found = await lookupCompanyByInn(company.inn);
    if (!found) return setInnError("ИНН — 10 цифр для организации, 12 для ИП");
    setInnError(undefined);
    edit(found);
  }

  function addAddress() {
    const value = newAddress.trim();
    if (!value) return;
    setAddresses((list) => [...list, value]);
    setNewAddress("");
    setState("idle");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (innError) return;
    setState("saving");
    setUser(await updateCompany(company, addresses));
    setState("saved");
  }

  return (
    <div className={s.withAside}>
      <form className={s.companyForm} onSubmit={onSubmit} noValidate aria-busy={state === "saving"}>
        <fieldset className={s.group}>
          <legend className="t-h3">Организация</legend>
          <TextField
            label="ИНН"
            value={company.inn}
            inputMode="numeric"
            maxLength={12}
            onChange={(e) => edit({ inn: e.target.value.replace(/\D/g, "") })}
            onBlur={onInnBlur}
            error={innError}
            hint="Название, КПП и адрес подтянутся сами"
          />
          <TextField label="КПП" value={company.kpp} inputMode="numeric" maxLength={9} onChange={(e) => edit({ kpp: e.target.value })} />
          <TextField className={s.wide} label="Название" value={company.name} onChange={(e) => edit({ name: e.target.value })} />
          <TextField className={s.wide} label="Юридический адрес" value={company.address} onChange={(e) => edit({ address: e.target.value })} />
        </fieldset>

        <fieldset className={s.group}>
          <legend className="t-h3">Адреса доставки</legend>
          <ul className={s.addresses}>
            {addresses.map((a, i) => (
              <li key={`${a}-${i}`}>
                <span>{a}</span>
                <button
                  type="button"
                  aria-label={`Удалить адрес: ${a}`}
                  onClick={() => {
                    setAddresses((list) => list.filter((_, j) => j !== i));
                    setState("idle");
                  }}
                >
                  <X aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          <div className={s.addRow}>
            <TextField
              label="Новый адрес"
              value={newAddress}
              placeholder="Город, улица, дом — объект или склад"
              onChange={(e) => setNewAddress(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addAddress();
                }
              }}
            />
            <Button variant="secondary" onClick={addAddress} disabled={!newAddress.trim()}>
              Добавить
            </Button>
          </div>
        </fieldset>

        <div className={s.saveRow}>
          <Button type="submit" disabled={state === "saving"}>
            {state === "saving" ? "Сохраняем…" : "Сохранить"}
          </Button>
          {state === "saved" && (
            <p className={s.saved} role="status">
              Сохранено. Подставим в{NB}следующий запрос КП
            </p>
          )}
        </div>
      </form>

      <aside className={s.aside}>
        <h2 className="t-h3">Контакт</h2>
        <dl className={s.who}>
          <div>
            <dt>Закупщик</dt>
            <dd>{user.name}</dd>
          </div>
          <div>
            <dt>Почта</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>Телефон</dt>
            <dd className="t-nums">{user.phone.replace(/ /g, NB)}</dd>
          </div>
        </dl>
        <p className={s.meta}>
          Реквизиты и адреса подставляются в{NB}каждый запрос КП и{NB}в{NB}счёт. Сменить контакт или добавить коллегу — через менеджера.
        </p>
      </aside>
    </div>
  );
}
