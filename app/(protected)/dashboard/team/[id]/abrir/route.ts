import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import {
  STAGEBOOK_SCOPE_COOKIE,
  requireStagebookAccess,
  StagebookAuthError,
} from "@/utils/stagebook/scope";
import { safeDashboardPath } from "../../_components/team-links";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * GET /dashboard/team/:id/abrir?to=/dashboard/...
 *
 * As ferramentas do RoboStage (StageBook, Kanban, ThinkLab, LabTest, agenda…)
 * operam sobre o espaço ATIVO (cookie `stagebook_team_id`). A página de uma
 * equipe pode estar aberta com outro espaço ativo — aí os atalhos dela abriam
 * a ferramenta no espaço pessoal (ou davam 404 num recurso da equipe), e o que
 * se criava ia parar fora da equipe. Este endpoint confirma que a pessoa é
 * membro, torna a equipe o espaço ativo e só então redireciona para `to`.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const teamPage = new URL(`/dashboard/team/${encodeURIComponent(id)}`, request.url);

  if (!UUID_RE.test(id)) return NextResponse.redirect(teamPage);

  try {
    const scope = await requireStagebookAccess(id);
    if (scope.type !== "team") return NextResponse.redirect(teamPage);
  } catch (error) {
    // Sem sessão ou sem membership: a página da equipe mostra o aviso certo.
    if (error instanceof StagebookAuthError) return NextResponse.redirect(teamPage);
    throw error;
  }

  const target = new URL(safeDashboardPath(request.nextUrl.searchParams.get("to")), request.url);
  const response = NextResponse.redirect(target);
  response.cookies.set(STAGEBOOK_SCOPE_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  // Barra lateral e páginas do dashboard dependem do espaço ativo.
  revalidatePath("/dashboard", "layout");
  return response;
}
