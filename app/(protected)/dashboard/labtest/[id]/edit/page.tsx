// ---------------------------------------------------------------------------
// /dashboard/labtest/[id]/edit
// Edita os dados de organização do teste: nome, descrição, pasta, tags e
// marco. A configuração (modo, missões, parâmetros) não muda aqui, para não
// invalidar as execuções já registradas.
// ---------------------------------------------------------------------------

import { notFound } from "next/navigation";
import { getResourceTags } from "@/features/stagebook/actions/tags";
import { getResourceMilestone } from "@/features/stagebook/actions/milestones";
import { getModeMeta, summarizeConfig } from "@/features/labtest/lib/catalog";
import { getTestEditData } from "@/features/labtest/actions/labtest";
import { EditTestForm } from "@/features/labtest/components/edit/edit-form";

export const metadata = { title: "Editar teste · LabTest" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditTestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const data = await getTestEditData(id);
  if (!data) notFound();

  // Etiquetas falhando não podem impedir a edição dos outros dados.
  const [tags, milestone] = await Promise.all([
    getResourceTags("labtest", id).catch(() => []),
    getResourceMilestone("labtest", id).catch(() => null),
  ]);

  const { test, folders } = data;

  return (
    <EditTestForm
      test={{
        id: test.id,
        name: test.name,
        description: test.description,
        folderId: test.folderId,
        season: test.season,
        createdAt: test.createdAt,
        modeLabel: getModeMeta(test.mode).label,
        configSummary: summarizeConfig(test.mode, test.config),
      }}
      folders={folders}
      initialTags={tags}
      initialMilestone={milestone}
    />
  );
}
