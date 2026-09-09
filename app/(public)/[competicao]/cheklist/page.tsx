// app/(public)/fll/confere-ai/page.tsx
//
// Rota pública, sem autenticação e sem dependência do Dashboard.
// Server Component: apenas metadata + composição. Toda a interatividade
// (estado, cookies, JSON via fetch) fica isolada no ConfereAI (client component).

import type { Metadata } from "next";
import ConfereAI from "@/components/competicoes/FLL/confere-ai/ConfereAI";

const TITLE = "Confia, mas Confira! FLL | RoboStage";
const DESCRIPTION =
  "Organize sua equipe para os treinos e campeonatos da FLL com o ConfereAí, uma checklist gratuita que funciona sem login.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/fll/confere-ai",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function ConfereAiPage() {
  return (
    <main className="min-h-screen bg-base-200/40">
      <ConfereAI />
    </main>
  );
}
