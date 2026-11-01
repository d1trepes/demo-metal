import type { Metadata } from "next";
import { DocumentsView } from "@/components/account/DocumentsView";

export const metadata: Metadata = { title: "Документы" };

export default function Page() {
  return <DocumentsView />;
}
