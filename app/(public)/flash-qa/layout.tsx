import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flash QA - RoboStage",
  description: "Sistema de perguntas e respostas para sala de avaliação.",
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
