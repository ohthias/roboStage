import Link from "next/link";
import { Settings2, ShieldAlert } from "lucide-react";
import { requireStagebookAccess, StagebookAuthError } from "@/utils/stagebook/scope";
import { getTeamSettingsInfo } from "../../actions";
import { GeneralSettingsPanel } from "./general-settings-panel";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Página personalizada de configurações da equipe — foto, nome e exclusão,
 * com a cara do app (em vez do <OrganizationProfile /> completo do Clerk,
 * que fica em /settings/advanced pra quem precisar de domínio verificado,
 * Billing, SSO etc). Só o técnico responsável (owner) acessa.
 */
export default async function TeamGeneralSettingsPage({
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

  const info = await getTeamSettingsInfo(id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Configurações da equipe</h1>
          <p className="mt-1 text-sm text-base-content/60">Foto, nome e exclusão da equipe.</p>
        </div>
        <Link
          href={`/dashboard/team/${id}/settings/advanced`}
          className="btn btn-ghost btn-sm gap-1.5 text-base-content/50"
        >
          <Settings2 size={14} />
          Avançado
        </Link>
      </div>

      <GeneralSettingsPanel
        teamId={info.id}
        clerkOrgId={info.clerkOrgId}
        initialName={info.name}
        initialLogoUrl={info.hasCustomLogo ? info.logoUrl : null}
      />
    </div>
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
