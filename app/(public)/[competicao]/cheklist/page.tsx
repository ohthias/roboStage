import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ConfereAI from "@/components/competicoes/FLL/confere-ai/ConfereAI";
import {
  CONFERE_AI_COMPETITIONS,
  isConfereAICompetition,
} from "@/utils/competitions/fll/confere-ai/types";

type Props = {
  params: Promise<{ competicao: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { competicao } = await params;
  if (!isConfereAICompetition(competicao)) return {};

  const { label } = CONFERE_AI_COMPETITIONS[competicao];
  const title = `Confia, mas Confira! ${label} | RoboStage`;
  const description = `Organize sua equipe para os treinos e campeonatos da ${label} com o Confia, mas Confira!, uma checklist gratuita que funciona sem login.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/${competicao}/cheklist`,
      type: "website",
    },
    twitter: { card: "summary", title, description },
  };
}

export default async function ConfereAiPage({ params }: Props) {
  const { competicao } = await params;
  if (!isConfereAICompetition(competicao)) notFound();

  return <ConfereAI key={competicao} competicao={competicao} />;
}
