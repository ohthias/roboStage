import { COMPETICOES_COMPONENTES } from "@/config/competicoes-map";

type Competicao = keyof typeof COMPETICOES_COMPONENTES;

export default async function Page({
  params,
}: {
  params: Promise<{ competicao: string }>;
}) {
  const { competicao } = await params;

  const Comp =
    COMPETICOES_COMPONENTES[competicao as Competicao]?.Home;

  if (!Comp) return <div>Competição não encontrada</div>;

  return <Comp />;
}