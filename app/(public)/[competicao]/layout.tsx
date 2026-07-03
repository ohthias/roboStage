import { Navbar } from "@/components/UI/Navbar";
import { COMPETICOES } from "@/utils/competitions/competicoes";
import { notFound } from "next/navigation";

import type { Metadata } from "next";

interface PageProps {
  params: Promise<{
    competicao: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { competicao } = await params;

  switch (competicao) {
    case "fll":
      return {
        title: "FIRST LEGO League",
        description:
          "Gerencie sua equipe FLL: missões, projetos de inovação, testes e torneios.",
      };

    case "ftc":
      return {
        title: "FIRST Tech Challenge",
        description: "Gestão completa para equipes FTC.",
      };

    case "OBR":
      return {
        title: "Olimpíada Brasileira de Robótica",
        description: "Gestão completa para equipes OBR.",
      };

    default:
      return {
        title: "Competições",
        description: "Competições de robótica.",
      };
  }
}

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ competicao: string }>;
}) {
  const { competicao } = await params;

  if (!COMPETICOES[competicao as keyof typeof COMPETICOES]) {
    notFound();
  }

  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  );
}