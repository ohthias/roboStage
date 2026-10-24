import { Metadata } from "next";
// @ts-ignore: allow side-effect CSS import without type declarations
import "./style.css";
import { RECALL_MODES, isRecallCompetition } from "./modes";

type Props = {
  params: Promise<{ competicao: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { competicao } = await params;
  const label = isRecallCompetition(competicao) ? RECALL_MODES[competicao].name : "";

  return {
    title: `RECALL ${label} | RoboStage`.replace("  ", " "),
    description:
      "Reavalie você e sua equipe com o RECALL, o jogo de perguntas e respostas da RoboStage, estilo flashcards. Escolha uma categoria, responda às perguntas e veja como você se saiu!",
    keywords: [
      "RoboStage",
      "Flash QA",
      "Perguntas e Respostas",
      "Robótica Educacional",
      label,
    ].filter(Boolean),
  };
}

export default function LayoutFlashQA({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
