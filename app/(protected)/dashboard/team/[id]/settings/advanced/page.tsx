import { ShieldAlert } from "lucide-react";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { teams } from "@/db/schema";
import { requireStagebookAccess, StagebookAuthError } from "@/utils/stagebook/scope";
import { OrganizationProfilePanel } from "./organization-profile-panel";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Painel de configuração da equipe para administradores, montado em cima do
 * componente oficial do Clerk (<OrganizationProfile />), conforme:
 * https://clerk.com/docs/nextjs/reference/components/organization/organization-profile
 *
 * Só o "técnico" (team_role === "owner") acessa — mesma regra das outras
 * ações de administração (ver app/(protected)/dashboard/team/actions.ts).
 */
export default async function TeamSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!UUID_RE.test(id)) return <NoAccess />;

  let scope;
  try {
    scope = await requireStagebookAccess(id);
  } catch (error) {
    if (error instanceof StagebookAuthError) return <NoAccess />;
    throw error;
  }

  if (scope.type !== "team" || scope.role !== "owner") {
    return (
      <NoAccess message="Só o técnico responsável (owner) pela equipe pode acessar as configurações." />
    );
  }

  const team = await db.query.teams.findFirst({
    where: eq(teams.id, id),
    columns: { name: true, clerkOrgId: true },
  });

  if (!team?.clerkOrgId) {
    return (
      <NoAccess message="Esta equipe não tem uma Organização do Clerk vinculada." />
    );
  }

  return (
    <OrganizationProfilePanel teamId={id} teamName={team.name} clerkOrgId={team.clerkOrgId} />
  );
}

function NoAccess({ message }: { message?: string } = {}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-error/10 text-error">
        <ShieldAlert size={24} />
      </span>
      <h1 className="text-lg font-bold">Sem acesso</h1>
      <p className="mt-2 text-sm text-base-content/60">
        {message ?? "Ou essa equipe não existe, ou você não é mais membro dela."}
      </p>
    </div>
  );
}
