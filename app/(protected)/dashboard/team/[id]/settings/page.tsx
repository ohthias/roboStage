import { requireStagebookAccess, StagebookAuthError } from "@/utils/stagebook/scope";
import { roleCan } from "@/utils/stagebook/team-permissions";
import { getTeamSettingsInfo } from "../../actions";
import { GeneralSettingsPanel } from "./general-settings-panel";
import { SettingsNoAccess, SettingsShell } from "../../_components/settings-shell";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Configurações da equipe com a cara do app (nome, foto, perfil, exclusão).
 * Técnicos e mentores acessam; só o técnico vê a exclusão. O painel completo
 * do Clerk fica em /settings/advanced.
 */
export default async function TeamGeneralSettingsPage({
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

  const info = await getTeamSettingsInfo(id);

  return (
    <SettingsShell teamId={id} teamName={info.name} active="geral">
      <GeneralSettingsPanel
        teamId={info.id}
        clerkOrgId={info.clerkOrgId}
        initialName={info.name}
        initialSeason={info.season}
        initialOrganizationName={info.organizationName}
        initialLogoUrl={info.hasCustomLogo ? info.logoUrl : null}
        canDeleteTeam={roleCan(scope.role, "team.delete")}
      />
    </SettingsShell>
  );
}
