/**
 * Estado da "requisição" simulada nos testes: quem está logado e quais cookies
 * existem. `tests/setup.ts` liga o Clerk e o `next/headers` a este objeto.
 */
export const requestContext: {
  userId: string | null;
  cookies: Map<string, string>;
  revalidated: string[];
} = {
  userId: null,
  cookies: new Map(),
  revalidated: [],
};

/** Simula o usuário logado e o espaço ativo (pessoal ou de uma equipe). */
export function actAs(userId: string | null, teamId: string | null = null) {
  requestContext.userId = userId;
  requestContext.cookies.clear();
  if (teamId) requestContext.cookies.set("stagebook_team_id", teamId);
}
