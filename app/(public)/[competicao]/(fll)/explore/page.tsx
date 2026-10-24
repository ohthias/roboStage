import type { Metadata } from "next";
import { notFound } from "next/navigation";

import BeginnerGuide from "@/components/competicoes/FLL/guides/BeginnerGuide";
import { exploreGuide } from "@/utils/competitions/fll/guides";

export const metadata: Metadata = {
  title: "Iniciando na FLL Explore | RoboStage",
  description:
    "Guia para equipes estreantes na FIRST LEGO League Explore: o que é o programa, como funciona a temporada, checklist inicial, vídeos recomendados, canais oficiais e FAQ.",
};

export default async function ExploreBeginsPage({
  params,
}: {
  params: Promise<{ competicao: string }>;
}) {
  const { competicao } = await params;
  // Guia exclusivo da FLL.
  if (competicao !== "fll") notFound();

  return <BeginnerGuide data={exploreGuide} />;
}
