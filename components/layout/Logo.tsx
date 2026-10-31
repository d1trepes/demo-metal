import Link from "next/link";
import s from "./Logo.module.css";

/** Знак: сечение двутавра. Словесная часть — Display заглавными. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={`${s.logo} ${className ?? ""}`} aria-label="Пролёт — на главную">
      <svg className={s.mark} viewBox="0 0 28 28" aria-hidden="true">
        <path d="M3 3h22v5h-8v12h8v5H3v-5h8V8H3z" fill="currentColor" />
      </svg>
      <span className={s.word}>Пролёт</span>
    </Link>
  );
}
