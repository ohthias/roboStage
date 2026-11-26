# Arquitetura

```
app/            só rotas, layouts e route handlers finos
components/
  stage/        Stage UI: única fonte de UI genérica
  layout/       Navbar, Footer, Header, Breadcrumbs, PageHero, Hero
  providers/    Toast, Confirm, Theme, Clerk (AppProviders em app/layout.tsx)
features/       uma pasta por funcionalidade
lib/            transversal, sem regra de nenhuma funcionalidade
types/          só global: *.d.ts e League/Season (types/league.ts)
data/           JSON de origem, fora do public
db/             schema e cliente Drizzle
public/         arquivos servidos como estão (ver public/README.md)
```

## app/

Só `page.tsx`, `layout.tsx`, `route.ts`, `loading.tsx`, `error.tsx`, `not-found.tsx`.
Componente, action, constante ou hook de uma rota vai para `features/<funcionalidade>/`.

## features/

```
features/
  leagues/
    fll/ obr/ ftc/     home, docs, guias, confere-ai, partiu-mesa, scouting FTC…
    shared/            CompetitionSections, DocsSearch, navigation, routes, competicoes
  scoring/             scores.ts, mission-scoring.ts, useScoreCalculator, FormMission, future-edition
  quickbrick/<tool>/   arena-builder, estrategia, heatmap, notebook, swot… (+ shared/)
  labtest/             inclui anatix/
  stagebook/           editor, documents, folders, kanban, journal, calendar, team, settings, shell
  thinklab/ showlive/ timers/ flashqa/ empathy-map/ rubric/
  institutional/       news, roboticar, páginas de produto, licenças, changelog
  home/                home do site + dashboard/ (home logada por persona)
  onboarding/
```

Dentro de uma funcionalidade (ou subpasta, como `quickbrick/heatmap/`):

| Pasta/arquivo | O quê |
|---|---|
| `components/` | React |
| `hooks/` | hooks da funcionalidade |
| `lib/` | lógica sem JSX, storage, queries |
| `actions/` ou `actions.ts` | server actions (`"use server"`) |
| `types.ts` ou `types/` | tipos da funcionalidade |

Regras:

- Funcionalidade não importa de dentro de outra se der para evitar. Se duas precisam, a peça sobe:
  UI genérica → `components/stage/`, lógica sem regra de negócio → `lib/`.
- `stagebook/` é o espaço logado (dashboard). Ferramentas com página própria (labtest, quickbrick,
  thinklab, showlive) ficam na própria pasta, mesmo quando abertas pelo dashboard.

## lib/

| Arquivo | O quê |
|---|---|
| `data/static-data.ts` | catálogo de missões, Future Edition e tools-about (`server-only`) |
| `data/missions-client.ts` | o mesmo no navegador, via `/api/data/*` e imports sob demanda |
| `assets.ts` | `asset("/images/...")` tipado com `assets-manifest.ts` (gerado: `npm run data:assets`) |
| `r2.ts`, `audio.ts`, `format.ts`, `action-result.ts` | utilitários |
| `hooks/` | `use-mobile`, `useUndoable`, `useChangeNotifier` |

## data/

```
data/
  leagues/fll/seasons/<temporada>.json   missões oficiais por temporada
  leagues/fll/future-edition.json
  leagues/fll/mission-guide/<temporada>.json
  leagues/obr/confere-ai.json
  docs/<liga>.json                       documentos oficiais por liga
  tools-about.json
  confere-ai.json                        checklist FLL
```

Sempre importado (`import x from "@/data/..."` ou `import()` sob demanda), nunca lido por URL.
Temporada nova: crie `seasons/<temporada>.json`, inclua em `MISSIONS_CATALOG`
(`lib/data/static-data.ts`) e em `SEASON_ORDER` (`scripts/generate-mission-images.mjs`),
depois rode `npm run data:mission-images`.
