import "server-only";

import { and, eq, isNull, type SQL, type Column } from "drizzle-orm";
import { StagebookAuthError, type StagebookScope, type TeamRole } from "./scope";

/**
 * Seção 31: nunca confiar em `where(eq(id, resourceId))` sozinho. Toda query
 * de listagem/leitura passa por aqui para amarrar o filtro ao scope atual —
 * assim fica impossível esquecer o filtro de equipe em um componente novo.
 */
export function scopeWhere(
  scope: StagebookScope,
  columns: { userId: Column; teamId: Column }
): SQL {
  return (
    scope.type === "personal"
      ? and(eq(columns.userId, scope.userId), isNull(columns.teamId))
      : and(eq(columns.teamId, scope.teamId), isNull(columns.userId))
  ) as SQL;
}

/**
 * Seção 29: papéis existem (owner/mentor/competidor/colaborador) mas a spec
 * pede explicitamente para não montar uma ACL complexa agora. `requireRole`
 * cobre o essencial: no espaço pessoal o dono pode tudo; no espaço de
 * equipe, restringe ações destrutivas/administrativas a quem tiver um dos
 * papéis permitidos.
 */
export function requireRole(scope: StagebookScope, allowed: TeamRole[]) {
  if (scope.type === "personal") return;
  if (!allowed.includes(scope.role)) {
    throw new StagebookAuthError(
      "Seu papel nesta equipe não permite esta ação."
    );
  }
}

/**
 * Garante que dois recursos (ex: um Card e a Page que ele vai referenciar)
 * pertencem ao MESMO scope antes de criar uma relação entre eles — seção 30
 * ("integridade entre scopes" é tratada como requisito crítico).
 */
export function assertSameScope(
  a: { userId: string | null; teamId: string | null },
  b: { userId: string | null; teamId: string | null },
  message = "Os recursos precisam pertencer ao mesmo espaço (pessoal ou de equipe)."
) {
  const sameUser = a.userId !== null && a.userId === b.userId;
  const sameTeam = a.teamId !== null && a.teamId === b.teamId;
  if (!sameUser && !sameTeam) {
    throw new StagebookAuthError(message);
  }
}
