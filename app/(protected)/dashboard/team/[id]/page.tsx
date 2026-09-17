import { ShieldAlert } from "lucide-react";
import { resolveStagebookScope, requireStagebookAccess, StagebookAuthError } from "@/utils/stagebook/scope";
import { TeamContent } from "../team-content";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function TeamByIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!UUID_RE.test(id)) {
    return <NoAccess />;
  }

  let scope;
  try {
    scope = await requireStagebookAccess(id);
  } catch (error) {
    if (error instanceof StagebookAuthError) return <NoAccess />;
    throw error;
  }

  if (scope.type !== "team") {
    // requireStagebookAccess só volta "personal" quando o id passado é vazio,
    // o que não é o caso aqui — mas cobrimos por segurança de tipos.
    return <NoAccess />;
  }

  const activeScope = await resolveStagebookScope();
  const isActiveScope = activeScope.type === "team" && activeScope.teamId === id;

  return <TeamContent scope={scope} isActiveScope={isActiveScope} />;
}

function NoAccess() {
  return (
    <div className="mx-auto flex flex-col items-center px-4 py-20 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-error/10 text-error">
        <ShieldAlert size={24} />
      </span>
      <h1 className="text-lg font-bold">Sem acesso a esta equipe</h1>
      <p className="mt-2 text-sm text-base-content/60">
        Ou essa equipe não existe, ou você não é mais membro dela.
      </p>
    </div>
  );
}
