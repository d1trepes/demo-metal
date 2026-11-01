import type { Metadata } from "next";
import { AccountShell } from "@/components/account/AccountShell";

export const metadata: Metadata = {
  title: { template: "%s · Личный кабинет", default: "Личный кабинет" },
  robots: { index: false },
};

/** Все страницы кабинета: проверка входа, шапка с реквизитами и вкладки разделов (клиентский AccountShell). */
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <AccountShell>{children}</AccountShell>;
}
