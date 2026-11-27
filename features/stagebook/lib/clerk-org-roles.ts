import "server-only";

import { clerkClient } from "@clerk/nextjs/server";
import { isClerkAdminRole } from "./clerk-roles";
import { isStaffRole, type TeamRole } from "./team-permissions";

/**
 * Descobre quais papéis do Clerk usar para uma Organização.
 *
 * O código assumia que toda Organização tem `org:admin` e `org:member`. Mas
 * instâncias do Clerk com papéis personalizados ou com "role sets" podem não
 * ter esses papéis, e o Clerk recusava o convite com "Organization role not
 * found". Aqui lemos o role set da Organização (ou a lista de papéis da
 * instância) e escolhemos:
 *  - equipe técnica (técnico/mentor): `org:admin` se existir; senão o papel
 *    dado a quem cria a Organização; senão um papel com "admin"/"owner";
 *  - demais cargos: `org:member` se existir; senão o papel padrão de novos
 *    membros; senão o primeiro papel que não é de administração.
 */

type RoleKeys = { admin: string; member: string };

const FALLBACK: RoleKeys = { admin: "org:admin", member: "org:member" };
const TTL_MS = 5 * 60_000;
const cache = new Map<string, { keys: RoleKeys; at: number }>();

export function pickRoleKeys(
  available: string[],
  creatorKey: string | null | undefined,
  defaultKey: string | null | undefined,
): RoleKeys {
  const has = (key: string | null | undefined): key is string => !!key && available.includes(key);

  const admin =
    (has("org:admin") && "org:admin") ||
    (has(creatorKey) && creatorKey) ||
    available.find(isClerkAdminRole) ||
    FALLBACK.admin;

  const member =
    (has("org:member") && "org:member") ||
    (has(defaultKey) && defaultKey !== admin && defaultKey) ||
    available.find((key) => key !== admin && !isClerkAdminRole(key)) ||
    (has(defaultKey) && defaultKey) ||
    FALLBACK.member;

  return { admin, member };
}

async function loadRoleKeys(clerkOrgId: string): Promise<RoleKeys> {
  const client = await clerkClient();

  // 1) Role set da própria Organização (instâncias com role sets).
  try {
    const organization = await client.organizations.getOrganization({ organizationId: clerkOrgId });
    const roleSetKey = (organization.raw as { role_set_key?: string | null } | null)?.role_set_key;
    if (roleSetKey) {
      const roleSet = await client.roleSets.getRoleSet(roleSetKey);
      const available = roleSet.roles.map((role) => role.key);
      if (available.length) return pickRoleKeys(available, roleSet.creatorRole?.key, roleSet.defaultRole?.key);
    }
  } catch (error) {
    console.warn("[stagebook] não foi possível ler o role set da Organização:", error);
  }

  // 2) Papéis da instância.
  try {
    const { data } = await client.organizationRoles.getOrganizationRoleList({ limit: 100 });
    const available = data.map((role) => role.key);
    if (available.length) return pickRoleKeys(available, null, null);
  } catch (error) {
    console.warn("[stagebook] não foi possível listar os papéis de Organização do Clerk:", error);
  }

  return FALLBACK;
}

/** Chave do papel do Clerk para um cargo do RoboStage nesta Organização. */
export async function clerkRoleKeyFor(clerkOrgId: string, role: TeamRole): Promise<string> {
  const hit = cache.get(clerkOrgId);
  let keys = hit && Date.now() - hit.at < TTL_MS ? hit.keys : null;
  if (!keys) {
    keys = await loadRoleKeys(clerkOrgId);
    cache.set(clerkOrgId, { keys, at: Date.now() });
  }
  return isStaffRole(role) ? keys.admin : keys.member;
}

/** Esquece os papéis lidos (ex.: depois de um "role not found"). */
export function forgetClerkRoleKeys(clerkOrgId: string) {
  cache.delete(clerkOrgId);
}
