import type { Metadata } from "next";
import { RequestsView } from "@/components/account/RequestsView";

export const metadata: Metadata = { title: "Запросы КП" };

export default function Page() {
  return <RequestsView />;
}
