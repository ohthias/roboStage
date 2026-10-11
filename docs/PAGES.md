# Páginas da plataforma

Catálogo das páginas disponíveis no RoboStage. Os grupos entre parênteses no
código-fonte, como `(public)` e `(protected)`, são grupos de rotas do Next.js:
eles organizam o projeto, mas **não aparecem na URL**.

## Convenções de URL

| Convenção | Significado |
| --- | --- |
| `[competicao]` | Identificador da competição, por exemplo `fll` |
| `[season]` | Identificador da temporada |
| `[id]` | Identificador de um recurso |
| `[documentId]` | Identificador de um documento |
| `[boardId]` | Identificador de um quadro Kanban |
| `[slug]` | Identificador textual de uma página |
| `[mode]` | Modo selecionado de uma ferramenta |

> As rotas protegidas exigem autenticação e podem depender de uma equipe ou
> organização ativa. As rotas públicas podem apresentar conteúdo específico
> da competição selecionada.

## Entrada e autenticação

| URL | Acesso | Finalidade |
| --- | --- | --- |
| `/` | Público | Página inicial do RoboStage |
| `/sign-in` | Público | Entrada na conta |
| `/sign-up` | Público | Criação de uma conta |
| `/onboarding` | Autenticado | Configuração inicial de perfil e interesses |

Código relacionado: [`app/(auth)`](https://github.com/ohthias/roboStage/tree/main/app/%28auth%29) e
[`app/onboarding`](https://github.com/ohthias/roboStage/tree/main/app/onboarding).

## Páginas institucionais e suporte

| URL | Finalidade |
| --- | --- |
| `/about` | Apresentação do projeto |
| `/help` | Central de ajuda |
| `/news` | Lista de notícias |
| `/news/[slug]` | Notícia específica |
| `/changelog` | Histórico de alterações |
| `/legal` | Lista de documentos legais |
| `/legal/[slug]` | Documento legal específico |
| `/licences` | Licenças e créditos de dependências |
| `/assets` | Identidade visual e materiais da marca |
| `/sponsors` | Patrocinadores |
| `/universe` | Universo e ecossistema RoboStage |
| `/robostage-canopy` | Página especial do RoboStage Canopy |

Código: [`app/(public)`](https://github.com/ohthias/roboStage/tree/main/app/%28public%29).

## Área da competição

Todas as rotas abaixo usam o prefixo `/<competicao>`. No uso atual, o exemplo
mais comum é `/fll`.

| URL | Finalidade |
| --- | --- |
| `/<competicao>` | Página inicial da competição |
| `/<competicao>/begins` | Conteúdos introdutórios da temporada |
| `/<competicao>/explore` | Exploração de conteúdos e recursos |
| `/<competicao>/future-edition` | Conteúdo da edição futura |
| `/<competicao>/partiu-mesa` | Preparação para a mesa |
| `/<competicao>/empathy-map` | Mapa de empatia |
| `/<competicao>/cheklist` | Checklist de preparação |
| `/<competicao>/score` | Seleção e acesso ao placar |
| `/<competicao>/score/<season>` | Placar da temporada |
| `/<competicao>/recall` | Revisão com perguntas e flashcards |
| `/<competicao>/timers` | Seleção de cronômetros |
| `/<competicao>/timers/<mode>` | Cronômetro no modo escolhido |

### Documentação e avaliação FLL

| URL | Finalidade |
| --- | --- |
| `/<competicao>/docs` | Índice de documentos da competição |
| `/<competicao>/docs/missions-guide` | Guia de missões |
| `/<competicao>/rubric` | Rubricas de avaliação |
| `/<competicao>/future-edition/rubric` | Rubrica da edição futura |
| `/<competicao>/future-edition/score` | Pontuação da edição futura |

Os componentes dessas páginas ficam em
[`app/(public)/[competicao]`](https://github.com/ohthias/roboStage/tree/main/app/%28public%29/%5Bcompeticao%5D).

## QuickBrick

O QuickBrick concentra ferramentas de estratégia e planejamento. Todas as
rotas usam o prefixo `/<competicao>/quickbrick`.

| URL | Finalidade |
| --- | --- |
| `/<competicao>/quickbrick` | Índice das ferramentas QuickBrick |
| `/<competicao>/quickbrick/estrategia` | Planejamento de estratégia |
| `/<competicao>/quickbrick/heatmap` | Mapa de calor para análise da mesa |
| `/<competicao>/quickbrick/matriz-de-risco` | Matriz de risco |
| `/<competicao>/quickbrick/matriz-swot` | Matriz SWOT |
| `/<competicao>/quickbrick/matriz-swot/<season>` | Matriz SWOT por temporada |
| `/<competicao>/quickbrick/tabela-de-missoes` | Tabela de missões |
| `/<competicao>/quickbrick/tabela-de-missoes/<season>` | Tabela de missões por temporada |
| `/<competicao>/quickbrick/sharks-simulator` | Simulador de trajetórias |

Código: [`app/(public)/[competicao]/quickbrick`](https://github.com/ohthias/roboStage/tree/main/app/%28public%29/%5Bcompeticao%5D/quickbrick).

## ShowLive e LabTest público

| URL | Acesso | Finalidade |
| --- | --- | --- |
| `/showlive` | Público | Área de eventos e torneios |
| `/labtest` | Público | Entrada para o ambiente de testes |
| `/stagebook` | Público | Apresentação do Stagebook |

Essas páginas apresentam as ferramentas ou direcionam para fluxos que podem
exigir autenticação.

## Dashboard

As páginas do dashboard usam o prefixo `/dashboard` e são protegidas.

| URL | Finalidade |
| --- | --- |
| `/dashboard` | Visão geral da área autenticada |
| `/dashboard/projects` | Projetos da equipe |
| `/dashboard/settings` | Configurações da conta ou workspace |
| `/dashboard/calendar` | Calendário de atividades e eventos |
| `/dashboard/documents` | Lista de documentos |
| `/dashboard/documents/<documentId>` | Editor de um documento |
| `/dashboard/kanban` | Lista de quadros Kanban |
| `/dashboard/kanban/<boardId>` | Quadro Kanban específico |
| `/dashboard/team` | Lista e gestão de equipes |
| `/dashboard/team/<id>` | Detalhes de uma equipe |
| `/dashboard/team/<id>/settings` | Configurações da equipe |
| `/dashboard/team/<id>/settings/advanced` | Configurações avançadas da equipe |

Código: [`app/(protected)/dashboard`](https://github.com/ohthias/roboStage/tree/main/app/%28protected%29/dashboard).

## LabTest autenticado

| URL | Finalidade |
| --- | --- |
| `/dashboard/labtest` | Lista de testes do usuário |
| `/dashboard/labtest/new` | Criação de um teste |
| `/dashboard/labtest/<id>` | Detalhes e histórico de um teste |
| `/dashboard/labtest/<id>/execute` | Registro de uma execução |
| `/dashboard/labtest/<id>/export` | Exportação dos resultados |
| `/dashboard/labtest/analytics` | Análise dos resultados |

Para a integração HTTP, consulte a [referência da API do LabTest](API.md#labtest).

## Tratamento de estados especiais

O App Router também possui páginas para estados que não são rotas de produto:

- [`app/error.tsx`](https://github.com/ohthias/roboStage/blob/main/app/error.tsx):
  erro recuperável durante a renderização.
- [`app/not-found.tsx`](https://github.com/ohthias/roboStage/blob/main/app/not-found.tsx):
  recurso ou página não encontrada.
- [`app/(public)/[competicao]/not-found.tsx`](https://github.com/ohthias/roboStage/blob/main/app/%28public%29/%5Bcompeticao%5D/not-found.tsx):
  competição inexistente.

