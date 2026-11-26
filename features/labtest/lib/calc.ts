// ---------------------------------------------------------------------------
// Campos calculados dos presets (CalibraBot). A equipe digita as medições e o
// LabTest calcula o resto — no formulário (ao vivo) e de novo no servidor.
//
//   "ratio:a/b"     → a ÷ b × 100 (porcentagem, 1 casa)
//   "per:a/b"       → a ÷ b (2 casas)
//   "mingap:a,b,c"  → menor distância entre quaisquer dois valores
//                     (ex.: margem de separação entre leituras de cores)
// ---------------------------------------------------------------------------

type Values = Record<string, unknown>;

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);

/** Campos usados por uma fórmula. */
export function calcInputs(calc: string): string[] {
  const [, expr = ""] = calc.split(":");
  return expr.split(/[/,]/).map((s) => s.trim()).filter(Boolean);
}

/** Resultado da fórmula, ou null se faltam dados. */
export function computeCalc(calc: string, values: Values): number | null {
  const [kind, expr = ""] = calc.split(":");

  if (kind === "ratio" || kind === "per") {
    const [a, b] = expr.split("/").map((s) => num(values[s.trim()]));
    if (a === null || b === null || b === 0) return null;
    const v = a / b;
    return kind === "ratio" ? Math.round(v * 1000) / 10 : Math.round(v * 100) / 100;
  }

  if (kind === "mingap") {
    const list = expr
      .split(",")
      .map((s) => num(values[s.trim()]))
      .filter((v): v is number => v !== null)
      .sort((x, y) => x - y);
    if (list.length < 2) return null;
    let gap = Infinity;
    for (let i = 1; i < list.length; i++) gap = Math.min(gap, list[i] - list[i - 1]);
    return Math.round(gap * 100) / 100;
  }

  return null;
}

export function isValidCalc(calc: unknown): calc is string {
  return typeof calc === "string" && /^(ratio|per|mingap):[a-z0-9_,/]+$/i.test(calc);
}
