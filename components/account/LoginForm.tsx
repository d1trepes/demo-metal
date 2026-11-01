"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { company } from "@/lib/nav";
import { useAuthStore } from "@/lib/stores/auth";
import { RegisterForm } from "./RegisterForm";
import s from "./Login.module.css";

/** Куда вернуть после входа: ?next=/account/orders/ (только разделы кабинета). */
function safeNext(next: string | null): string {
  return next && next.startsWith("/account/") ? next : "/account/";
}

/** Форма входа + кнопка демо-кабинета (основная: посетитель демки не знает пароля). Заглушка api.login пускает с любой почтой и непустым паролем. */
export function LoginForm({ demoNote }: { demoNote: string }) {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const signUp = useAuthStore((st) => st.signUp);
  const signIn = useAuthStore((st) => st.signIn);
  const signInDemo = useAuthStore((st) => st.signInDemo);
  const params = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">(params.get("mode") === "register" ? "register" : "login");
  const [busy, setBusy] = useState<"form" | "demo" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    if (!email.includes("@") || !password) {
      setError("Введите рабочую почту и пароль");
      return;
    }
    setError(null);
    setBusy("form");
    try {
      await signIn(email, password);
      router.replace(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось войти");
      setBusy(null);
    }
  }

  async function onDemo() {
    setBusy("demo");
    await signInDemo();
    router.replace(next);
  }

  return (
    <>
      <section className={s.demo} aria-labelledby="demo-title">
        <h2 id="demo-title" className="t-h3">
          Демо-кабинет
        </h2>
        <p>{demoNote}</p>
        <Button block onClick={onDemo} disabled={busy !== null}>
          {busy === "demo" ? "Открываем…" : "Войти в демо-кабинет"}
        </Button>
      </section>

      <div className={s.modes} role="tablist" aria-label="Вход или регистрация">
        {(
          [
            ["login", "Вход по паролю"],
            ["register", "Регистрация"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            id={`tab-${key}`}
            type="button"
            role="tab"
            aria-selected={mode === key}
            aria-controls={`panel-${key}`}
            onClick={() => {
              setMode(key);
              setError(null);
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "login" ? (
        <form className={s.form} onSubmit={onSubmit} noValidate aria-busy={busy === "form"} id="panel-login" role="tabpanel" aria-labelledby="tab-login">
          <TextField label="Почта" name="email" type="email" autoComplete="username" inputMode="email" placeholder="snab@company.ru" />
          <TextField label="Пароль" name="password" type="password" autoComplete="current-password" error={error ?? undefined} />
          <Button type="submit" variant="secondary" block disabled={busy !== null}>
            {busy === "form" ? "Входим…" : "Войти"}
          </Button>
          <p className={s.help}>
            Забыли пароль или нет доступа — позвоните менеджеру:{" "}
            <a href={company.phoneHref} className="link">
              {company.phone.replace(/ /g, "\u00a0")}
            </a>
          </p>
        </form>
      ) : (
        <RegisterForm
          disabled={busy !== null}
          onSubmit={async (request) => {
            setBusy("form");
            try {
              await signUp(request);
              router.replace(next);
            } catch (err) {
              setBusy(null);
              throw err;
            }
          }}
        />
      )}
    </>
  );
}
