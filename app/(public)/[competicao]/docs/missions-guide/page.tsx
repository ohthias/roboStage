import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MissionGuide } from "@/components/competicoes/FLL/mission-guide/MissionGuide";

export const metadata: Metadata = {
  title: "Guia de Missões | FLL | RoboStage",
  description:
    "As missões da temporada da FIRST LEGO League Challenge explicadas uma a uma, com dicas, estratégias e mecanismos.",
};

export default async function MissionsGuidePage({
  params,
}: {
  params: Promise<{ competicao: string }>;
}) {
  const { competicao } = await params;
  // Guia exclusivo da FLL (linkado no menu, na home e na página de documentos).
  if (competicao !== "fll") notFound();

  return <MissionGuide />;
}
