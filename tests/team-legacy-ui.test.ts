import { it, expect, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh() {}, push() {} }), usePathname: () => "/", redirect() {}, unstable_rethrow() {} }));
vi.mock("next/image", () => ({ default: (p: any) => createElement("img", { src: p.src, alt: p.alt, className: p.className, width: p.width, height: p.height }) }));
vi.mock("@/app/context/ToastContext", () => ({ useToast: () => ({ addToast() {} }) }));

// Render no servidor (sem navegador): pega erro de hook/props e confere o que aparece em cada estado.
it("renderiza a aba Legado (temporada, competição, vazio) e o botão de transferir", async () => {
  const { LegacyTab } = await import("@/app/(protected)/dashboard/team/_components/legacy-tab");
  const { TransferToTeamButton } = await import("@/components/stagebook/transfer/transfer-dialog");
  const base = { color: null, location: null, createdBy: "u1", updatedAt: new Date().toISOString(), members: [], league: null, stage: null };
  const chapters: any[] = [
    { ...base, league: "fll", id: "s1", kind: "season", parentId: null, title: "Unearthed 2025/26", seasonKey: "unearthed", startDate: "2025-08-01", endDate: "2026-07-31",
      content: { summary: "Ano bom", result: "2º lugar", awards: [{ id: "a", title: "Robot Design", detail: "" }], highlights: [{ id: "h", text: "Primeiro torneio" }] },
      items: [{ id: "i1", kind: "labtest", resourceId: "t1", title: "Missões", icon: null, href: "/dashboard/labtest/t1", meta: "3 rodadas", note: null, updatedAt: "" }],
      stats: { executions: 12, bestScore: 310, journalEntries: 4, trainingSessions: 3, milestonesCompleted: 1 },
      members: [{ id: "u1", name: "Ana", avatarUrl: null, current: true }] },
    { ...base, id: "c1", kind: "competition", parentId: "s1", title: "Regional SP", seasonKey: null, startDate: "2026-03-14", endDate: null, content: {}, items: [], stats: null },
    { ...base, id: "c2", kind: "competition", parentId: null, title: "Avulsa", seasonKey: null, startDate: null, endDate: null, content: {}, items: [], stats: null },
    { ...base, league: "obr", id: "o1", kind: "season", parentId: null, title: "OBR 2026", seasonKey: "obr-2026", startDate: "2026-01-01", endDate: "2026-12-31", content: {}, items: [], stats: null },
    { ...base, league: "obr", stage: "estadual", id: "o2", kind: "competition", parentId: "o1", title: "Etapa estadual SP", seasonKey: null, startDate: "2026-08-15", endDate: null, location: "São Paulo, SP",
      content: {
        modality: "Prática · Resgate",
        result: "3º lugar",
        sections: [
          { id: "x1", kind: "scores", title: "Resgate — rodadas", showTime: true, rows: [{ id: "r1", label: "Rodada 1", points: 185, time: 242 }, { id: "r2", label: "Rodada 2", points: 230, time: 198, value: "kit novo" }] },
          { id: "x2", kind: "specs", title: "Ficha do robô", rows: [{ id: "s1", label: "Controlador", value: "ESP32" }, { id: "s2", label: "Sensores", value: "5 refletância + cor" }] },
          { id: "x3", kind: "links", title: "Fotos e vídeos", rows: [{ id: "l1", label: "Vídeo da rodada 2", url: "https://youtu.be/abc" }, { id: "l2", label: "Código", url: "https://github.com/x/y" }] },
          { id: "x4", kind: "feedback", title: "Avaliação dos juízes", rows: [{ id: "f1", label: "Inspeção", value: "Robô bem montado", extra: "Organizar cabos" }] },
          { id: "x5", kind: "timeline", title: "Linha do tempo", rows: [{ id: "t1", label: "Inscrição", date: "2026-04-20" }, { id: "t2", label: "Regional", date: "2026-07-05" }] },
        ],
      },
      items: [{ id: "i2", kind: "session", resourceId: "ss", title: "Estadual — dia 1", icon: null, href: "/dashboard/team/t/treinos/ss", meta: "Competição · 15 ago 2026", note: null, updatedAt: "" }],
      stats: { executions: 4, bestScore: 230, journalEntries: 2, trainingSessions: 1, milestonesCompleted: 0 } },
  ];
  const html = renderToStaticMarkup(
    createElement(LegacyTab, { teamId: "t", teamName: "Equipe", viewerId: "u1", viewerRole: "competidor", chapters, members: [], initialChapterId: null }),
  );
  for (const text of ["Legado da equipe", "Unearthed 2025/26", "Regional SP", "Outras competições", "Robot Design", "Missões", "310", "Primeiro torneio", "Temporada inteira"]) {
    expect(html).toContain(text);
  }
  const obr = renderToStaticMarkup(
    createElement(LegacyTab, { teamId: "t", teamName: "Equipe", viewerId: "u1", viewerRole: "competidor", chapters, members: [], initialChapterId: "o2" }),
  );
  for (const text of ["OBR 2026", "Etapa estadual SP", "ETAPA ESTADUAL", "Prática · Resgate", "Resgate — rodadas", "Melhor: 230 pts em 3:18", "ESP32", "youtu.be", "Organizar cabos", "Inscrição", "Estadual — dia 1", "Adicionar seção"]) {
    expect(obr).toContain(text);
  }
  // sessão de treino abre a página da equipe direto (sem ativar o espaço)
  expect(obr).toContain('href="/dashboard/team/t/treinos/ss"');
  const empty = renderToStaticMarkup(createElement(LegacyTab, { teamId: "t", teamName: "Equipe", viewerId: "u1", viewerRole: "owner", chapters: [], members: [], initialChapterId: null }));
  expect(empty).toContain("O legado ainda está vazio");
  const comp = renderToStaticMarkup(createElement(LegacyTab, { teamId: "t", teamName: "Equipe", viewerId: "u1", viewerRole: "owner", chapters, members: [], initialChapterId: "c1" }));
  expect(comp).toContain("/ COMPETIÇÃO");
  expect(renderToStaticMarkup(createElement(TransferToTeamButton, { teams: [{ id: "t", name: "E" }] }))).toContain("Transferir para equipe");
});
