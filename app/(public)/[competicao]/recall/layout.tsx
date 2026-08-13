import { Metadata } from "next";
// @ts-ignore: allow side-effect CSS import without type declarations
import "./style.css";

export const metadata: Metadata = {
  title: "RECALL FLL | RoboStage",
  description: "Reavalie você e sua equipe com o RECALL, o jogo de perguntas e respostas da RoboStage, estilo flashcards. Escolha uma categoria, responda às perguntas e veja como você se saiu!",
  keywords: [
    "RoboStage",
    "Flash QA",
    "Perguntas e Respostas",
    "Sala de Avaliação",
    "Robótica Educacional",
    "FLL",
  ],
};
export default function LayoutFlashQA({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
