import type { Metadata } from "next";
import { AccountOverview } from "@/components/account/AccountOverview";

export const metadata: Metadata = { title: "Обзор" };

export default function Page() {
  return <AccountOverview />;
}
