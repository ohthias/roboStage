import type { Metadata } from "next";
import { notFound } from "next/navigation";

import BeginnerGuide from "@/features/leagues/fll/guides/components/BeginnerGuide";
import { challengeGuide } from "@/features/leagues/fll/guides/lib/guides";

export const metadata: Metadata = {
  title: "Iniciando na FIRST LEGO League Challenge | RoboStage",
  description:
    "Guia para equipes estreantes na FIRST LEGO League Challenge (FLLC): o que é o programa, como funciona a temporada, checklist inicial, vídeos recomendados, canais oficiais e FAQ.",
};

export default async function BeginsPage({
  params,
}: {
  params: Promise<{ competicao: string }>;
}) {
  const { competicao } = await params;
  // Guia exclusivo da FLL.
  if (competicao !== "fll") notFound();

  return <BeginnerGuide data={challengeGuide} />;
}
