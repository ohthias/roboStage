import { beforeAll, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { boardColumns, boards, tests as labTests, thinklab } from "@/db/schema";
import {
  createTeamBoard,
  createTeamLabTest,
  createTeamThinkLab,
} from "@/utils/stagebook/actions/team-resources";
import { isClerkAdminRole, mapClerkOrgRole, reconcileClerkOrgRole } from "@/utils/stagebook/clerk-roles";
import { pickRoleKeys } from "@/utils/stagebook/clerk-org-roles";
import {
  safeDashboardPath,
  teamToolHref,
} from "@/app/(protected)/dashboard/team/_components/team-links";
import { call } from "./helpers/actions";
import { actAs } from "./helpers/context";
import { applySchema, createTeam } from "./helpers/db";

describe("criação pela página da equipe", () => {
  let teamId: string;
  beforeAll(async () => {
    await applySchema();
    teamId = await createTeam("Atalhos", [
      { userId: "sc_tec", role: "owner" },
      { userId: "sc_comp", role: "competidor" },
    ]);
  });

  it("cria kanban mesmo sem suporte a transações (driver neon-http)", async () => {
    // Em produção o driver é o neon-http, que lança em `db.transaction`.
    const spy = vi.spyOn(db, "transaction").mockImplementation(() => {
      throw new Error("No transactions support in neon-http driver");
    });
    try {
      // Espaço ativo é o pessoal: a criação pela página da equipe usa o teamId explícito.
      actAs("sc_comp", null);
      const { id } = await call(createTeamBoard(teamId, { name: "Missões R2" }));

      const [board] = await db.select().from(boards).where(eq(boards.id, id));
      expect(board).toMatchObject({ teamId, userId: null, createdBy: "sc_comp" });
      const columns = await db.select().from(boardColumns).where(eq(boardColumns.boardId, id));
      expect(columns.map((c) => c.name).sort()).toEqual(["A fazer", "Concluído", "Em andamento"]);
    } finally {
      spy.mockRestore();
    }
  });

  it("cria ThinkLab e LabTest dentro da equipe", async () => {
    actAs("sc_comp", null);
    const think = await call(createTeamThinkLab(teamId, { name: "Garra" }));
    const test = await call(createTeamLabTest(teamId, { name: "Giro 90" }));

    const [t] = await db.select().from(thinklab).where(eq(thinklab.id, think.id));
    const [l] = await db.select().from(labTests).where(eq(labTests.id, test.id));
    expect(t.teamId).toBe(teamId);
    expect(l.teamId).toBe(teamId);
  });
});

describe("links dos atalhos", () => {
  it("passam pela rota que ativa a equipe", () => {
    expect(teamToolHref("abc", "/dashboard/kanban/1")).toBe(
      "/dashboard/team/abc/abrir?to=%2Fdashboard%2Fkanban%2F1",
    );
  });

  it("só aceitam destinos internos do dashboard", () => {
    expect(safeDashboardPath("/dashboard/documents?x=1")).toBe("/dashboard/documents?x=1");
    expect(safeDashboardPath("//evil.com/dashboard")).toBe("/dashboard");
    expect(safeDashboardPath("https://evil.com/dashboard")).toBe("/dashboard");
    expect(safeDashboardPath("/\\evil.com")).toBe("/dashboard");
    expect(safeDashboardPath("/sign-in")).toBe("/dashboard");
    expect(safeDashboardPath("/dashboardx")).toBe("/dashboard");
    expect(safeDashboardPath(null)).toBe("/dashboard");
  });
});

describe("cargos vindos do Clerk", () => {
  it("o cargo escolhido no convite vence o admin/member do Clerk", () => {
    // Mentor entra como org:admin no Clerk, mas continua mentor (não técnico).
    expect(mapClerkOrgRole("org:admin", "mentor")).toBe("mentor");
    expect(mapClerkOrgRole("org:member", "competidor")).toBe("competidor");
    expect(mapClerkOrgRole("org:admin", "owner")).toBe("owner");
    expect(mapClerkOrgRole("org:admin", "tecnico")).toBe("owner");
    expect(mapClerkOrgRole("org:admin")).toBe("owner");
    expect(mapClerkOrgRole("org:member")).toBe("colaborador");
  });

  it("atualização do Clerk mantém o cargo fino quando compatível", () => {
    expect(reconcileClerkOrgRole("mentor", "org:admin")).toBe("mentor");
    expect(reconcileClerkOrgRole("owner", "org:admin")).toBe("owner");
    expect(reconcileClerkOrgRole("competidor", "org:member")).toBe("competidor");
    expect(reconcileClerkOrgRole("competidor", "org:admin")).toBe("mentor");
    expect(reconcileClerkOrgRole("mentor", "org:member")).toBe("colaborador");
  });
});

describe("papéis da Organização no Clerk", () => {
  it("usa org:admin/org:member quando existem", () => {
    expect(pickRoleKeys(["org:admin", "org:member"], null, null)).toEqual({
      admin: "org:admin",
      member: "org:member",
    });
  });

  it("usa os papéis do role set quando os padrões não existem", () => {
    // Instância sem org:member: o convite falhava com "Organization role not found".
    expect(pickRoleKeys(["org:owner", "org:participant"], "org:owner", "org:participant")).toEqual({
      admin: "org:owner",
      member: "org:participant",
    });
    expect(pickRoleKeys(["org:admin", "org:viewer"], "org:admin", "org:viewer")).toEqual({
      admin: "org:admin",
      member: "org:viewer",
    });
    expect(pickRoleKeys(["org:team_admin", "org:aluno"], null, null)).toEqual({
      admin: "org:team_admin",
      member: "org:aluno",
    });
  });

  it("reconhece papéis de administração personalizados", () => {
    expect(isClerkAdminRole("org:admin")).toBe(true);
    expect(isClerkAdminRole("org:owner")).toBe(true);
    expect(isClerkAdminRole("org:team_admin")).toBe(true);
    expect(isClerkAdminRole("org:member")).toBe(false);
    expect(isClerkAdminRole("org:administrativo")).toBe(false);
  });
});
