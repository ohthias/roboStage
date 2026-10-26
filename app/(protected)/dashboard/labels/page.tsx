import { resolveStagebookScope } from "@/utils/stagebook/scope";
import { listTagsWithUsage } from "@/utils/stagebook/actions/tags";
import { listMilestonesWithUsage } from "@/utils/stagebook/actions/milestones";
import { LabelsManager } from "@/components/stagebook/labels/labels-manager";

export default async function LabelsPage() {
  const scope = await resolveStagebookScope();
  const [tags, milestones] = await Promise.all([listTagsWithUsage(), listMilestonesWithUsage()]);

  // Em equipes, excluir/mesclar fica com owner e mentor (mesma regra das actions).
  const canDelete = scope.type === "personal" || scope.role === "owner" || scope.role === "mentor";

  return (
    <main className="min-h-full bg-base-100 px-4 py-8 text-base-content sm:px-6 lg:px-8 space-y-8">
      <LabelsManager initialTags={tags} initialMilestones={milestones} canDelete={canDelete} />
    </main>
  );
}
