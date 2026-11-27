/**
 * Links das páginas da equipe para as ferramentas do RoboStage.
 *
 * As ferramentas (StageBook, Kanban, ThinkLab, LabTest, agenda…) leem o espaço
 * ATIVO do cookie. Por isso todo atalho que sai da página da equipe passa por
 * `/dashboard/team/:id/abrir?to=…`, que ativa a equipe antes de redirecionar —
 * assim o que for aberto ou criado ali pertence à equipe, mesmo que a pessoa
 * estivesse com o espaço pessoal (ou outra equipe) ativo.
 *
 * Use `<a href>` (não `<Link>`) com estes endereços: um prefetch do `<Link>`
 * trocaria o espaço ativo só de o link aparecer na tela.
 */
export function teamToolHref(teamId: string, path: string): string {
  return `/dashboard/team/${teamId}/abrir?to=${encodeURIComponent(safeDashboardPath(path))}`;
}

/** Só aceita caminhos internos do dashboard (evita open redirect). */
export function safeDashboardPath(value: string | null | undefined): string {
  const fallback = "/dashboard";
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  try {
    const url = new URL(value, "http://robostage.local");
    if (url.origin !== "http://robostage.local") return fallback;
    if (url.pathname !== "/dashboard" && !url.pathname.startsWith("/dashboard/")) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
