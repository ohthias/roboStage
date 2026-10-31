import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { COMPETICOES } from "@/utils/competitions/competicoes";
import { isPublicPath, publicSitemapPaths } from "@/utils/competitions/routes";

const appDir = path.resolve(__dirname, "../app");

/** Padrões de URL (segmentos) de todas as páginas do app, sem route groups. */
function pagePatterns(dir = appDir, segments: string[] = []): string[][] {
  const patterns: string[][] = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      const isGroup = entry.startsWith("(") && entry.endsWith(")");
      patterns.push(...pagePatterns(full, isGroup ? segments : [...segments, entry]));
    } else if (entry === "page.tsx") {
      patterns.push(segments);
    }
  }
  return patterns;
}

function hasPage(pathname: string, patterns: string[][]) {
  const parts = pathname.split("/").filter(Boolean);
  return patterns.some(
    (pattern) =>
      pattern.length === parts.length &&
      pattern.every((segment, i) => segment.startsWith("[") || segment === parts[i]),
  );
}

describe("lista única de rotas", () => {
  const patterns = pagePatterns();

  it("toda URL do sitemap corresponde a uma página existente", () => {
    const missing = publicSitemapPaths().filter((p) => !hasPage(p, patterns));
    expect(missing).toEqual([]);
  });

  it("não publica rotas só da FLL na OBR e vice-versa", () => {
    const paths = publicSitemapPaths();
    expect(paths).not.toContain("/obr/future-edition");
    expect(paths).not.toContain("/obr/score/bioglow");
    expect(paths).not.toContain("/fll/bastidores");
    expect(paths).toContain("/obr/bastidores");
  });

  it("sitemap não tem URLs repetidas", () => {
    const paths = publicSitemapPaths();
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("toda competição cadastrada é pública no proxy", () => {
    for (const competition of Object.keys(COMPETICOES)) {
      expect(isPublicPath(`/${competition}`)).toBe(true);
      expect(isPublicPath(`/${competition}/docs`)).toBe(true);
    }
  });

  it("libera as APIs públicas e mantém o resto protegido", () => {
    expect(isPublicPath("/api/legal/privacidade")).toBe(true);
    expect(isPublicPath("/api/data/missions")).toBe(true);
    expect(isPublicPath("/")).toBe(true);
    expect(isPublicPath("/dashboard")).toBe(false);
    expect(isPublicPath("/api/competitions")).toBe(false);
    expect(isPublicPath("/fllx")).toBe(false);
    expect(isPublicPath("/onboarding/extra")).toBe(false);
  });
});
