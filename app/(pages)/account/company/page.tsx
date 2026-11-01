import type { Metadata } from "next";
import { CompanyView } from "@/components/account/CompanyView";

export const metadata: Metadata = { title: "Реквизиты" };

export default function Page() {
  return <CompanyView />;
}
