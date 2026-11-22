import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { teamMembers, teams } from "@/db/schema";
import { resolveStagebookScope } from "@/utils/stagebook/scope";
import type { TransferKind } from "@/types/legacy";
import { TransferToTeamButton } from "./transfer-dialog";

/**
 * "Transferir para equipe" nas ferramentas. Só aparece no espaço PESSOAL e
 * para quem participa de ao menos uma equipe; no espaço de equipe não há o que
 * transferir (os itens já são da equipe).
 */
export async function PersonalTransferButton({ kind, size, className }: { kind?: TransferKind; size?: "sm" | "md"; className?: string }) {
  const scope = await resolveStagebookScope().catch(() => null);
  if (!scope || scope.type !== "personal") return null;
  const targets = await db
    .select({ id: teams.id, name: teams.name })
    .from(teamMembers)
    .innerJoin(teams, eq(teams.id, teamMembers.teamId))
    .where(eq(teamMembers.userId, scope.userId))
    .orderBy(teams.name);
  if (!targets.length) return null;
  return <TransferToTeamButton teams={targets} kind={kind} size={size} className={className} />;
}
