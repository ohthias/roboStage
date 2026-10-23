import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { teams } from "@/db/schema";
import { requireStagebookAccess, StagebookAuthError } from "@/utils/stagebook/scope";
import { roleCan } from "@/utils/stagebook/team-permissions";
import { OrganizationProfilePanel } from "./organization-profile-panel";
import { SettingsNoAccess, SettingsShell } from "../../../_components/settings-shell";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Painel do Clerk (<OrganizationProfile />) para a equipe técnica (técnico e
 * mentor, ambos `org:admin` no Clerk). Mesma regra das demais ações de
 * administração: ver `utils/stagebook/team-permissions.ts`.
 */
export default async function TeamAdvancedSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!UUID_RE.test(id)) return <SettingsNoAccess />;

  let scope;
  try {
    scope = await requireStagebookAccess(id);
  } catch (error) {
    if (error instanceof StagebookAuthError) return <SettingsNoAccess />;
    throw error;
  }

  if (scope.type !== "team" || !roleCan(scope.role, "team.edit")) {
    return <SettingsNoAccess message="Só técnicos e mentores podem gerenciar a equipe." />;
  }

  const team = await db.query.teams.findFirst({
    where: eq(teams.id, id),
    columns: { name: true, clerkOrgId: true },
  });

  if (!team?.clerkOrgId) {
    return <SettingsNoAccess message="Esta equipe não tem uma Organização do Clerk vinculada." />;
  }

  return (
    <SettingsShell teamId={id} teamName={team.name} active="avancado" wide>
      <OrganizationProfilePanel clerkOrgId={team.clerkOrgId} />
    </SettingsShell>
  );
}
