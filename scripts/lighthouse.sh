#!/usr/bin/env bash
# Roda o Lighthouse (perfil mobile padrão) 3 vezes por página contra um build
# de produção local e mostra a mediana de cada categoria e das métricas.
#
# uso:  npm run build && npm start   (em outro terminal)
#       npm run perf:lighthouse -- /anatix /labtest /fll/rubric
# Variáveis: BASE_URL (padrão http://localhost:3000), RUNS (padrão 3).
set -euo pipefail
BASE_URL="${BASE_URL:-http://localhost:3000}"
RUNS="${RUNS:-3}"
OUT="$(mktemp -d)"
PAGES=("$@")
[ ${#PAGES[@]} -eq 0 ] && PAGES=(/anatix /labtest /fll/rubric)

for page in "${PAGES[@]}"; do
  for i in $(seq 1 "$RUNS"); do
    npx --yes lighthouse@12 "$BASE_URL$page" --quiet \
      --chrome-flags="--headless=new" \
      --only-categories=performance,accessibility,best-practices,seo \
      --output=json --output-path="$OUT/$(echo "$page" | tr '/' '_')-$i.json"
  done
done

node - "$OUT" "${PAGES[@]}" <<'NODE'
const fs = require("fs");
const [dir, ...pages] = process.argv.slice(2);
const median = (xs) => xs.sort((a, b) => a - b)[Math.floor(xs.length / 2)];
for (const page of pages) {
  const runs = fs.readdirSync(dir)
    .filter((f) => f.startsWith(page.replace(/\//g, "_") + "-"))
    .map((f) => JSON.parse(fs.readFileSync(`${dir}/${f}`, "utf8")));
  const cat = (k) => Math.round(median(runs.map((r) => r.categories[k].score * 100)));
  const ms = (k) => Math.round(median(runs.map((r) => r.audits[k].numericValue)));
  console.log(
    `${page.padEnd(28)} perf ${cat("performance")}  a11y ${cat("accessibility")}  bp ${cat("best-practices")}  seo ${cat("seo")}` +
      `  | FCP ${ms("first-contentful-paint")}ms  LCP ${ms("largest-contentful-paint")}ms  TBT ${ms("total-blocking-time")}ms  CLS ${median(runs.map((r) => r.audits["cumulative-layout-shift"].numericValue)).toFixed(3)}`,
  );
}
NODE
