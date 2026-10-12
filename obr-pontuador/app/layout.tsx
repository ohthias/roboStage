import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pontuador OBR 2026 – Resgate",
  description:
    "Pontuador de arena da OBR 2026 (Robótica de Resgate, etapas Regional/Estadual) conforme o Manual de Regras v1.2",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-theme="light">
      <body className="min-h-screen bg-base-200">{children}</body>
    </html>
  );
}
