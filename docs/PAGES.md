# Catálogo de páginas e rotas

Referência das páginas da aplicação RoboStage, organizadas por área funcional, finalidade e nível de acesso.

O projeto utiliza o **Next.js App Router**. Diretórios entre parênteses, como `(public)` e `(protected)`, representam grupos de rotas: organizam os arquivos internamente, mas não fazem parte da URL pública.

## Convenções de URL

| Parâmetro | Significado |
| --- | --- |
| `[competicao]` | Identificador da competição, como `fll`. |
| `[season]` | Identificador da temporada. |
| `[id]` | Identificador de um recurso. |
| `[documentId]` | Identificador de um documento. |
| `[boardId]` | Identificador de um quadro Kanban. |
| `[slug]` | Identificador textual de uma página. |
| `[mode]` | Modo selecionado de uma ferramenta. |

> **Acesso:** rotas protegidas exigem autenticação e podem depender da equipe ou do contexto de trabalho ativo. Rotas públicas podem apresentar conteúdo específico de uma competição ou temporada.

---

## 1. Entrada e autenticação

| Rota | Acesso | Descrição |
| --- | --- | --- |
| `/` | Público | Página inicial da plataforma. |
| `/sign-in` | Público | Entrada na conta. |
| `/sign-up` | Público | Criação de uma conta. |
| `/onboarding` | Autenticado | Configuração inicial do perfil e dos interesses. |

**Código-fonte:**

- [`app/(auth)`](https://github.com/ohthias/roboStage/tree/main/app/%28auth%29)
- [`app/onboarding`](https://github.com/ohthias/roboStage/tree/main/app/onboarding)

---

## 2. Páginas institucionais e suporte

| Rota | Descrição |
| --- | --- |
| `/about` | Apresentação do projeto. |
| `/help` | Central de ajuda. |
| `/news` | Lista de notícias. |
| `/news/[slug]` | Página de uma notícia. |
| `/changelog` | Histórico de alterações. |
| `/legal` | Índice de documentos legais. |
| `/legal/[slug]` | Documento legal específico. |
| `/licences` | Licenças e créditos de dependências. |
| `/assets` | Identidade visual e materiais da marca. |
| `/sponsors` | Patrocinadores. |
| `/universe` | Universo e ecossistema RoboStage. |
| `/robostage-canopy` | Página especial do RoboStage Canopy. |

**Código-fonte:** [`app/(public)`](https://github.com/ohthias/roboStage/tree/main/app/%28public%29).

---

## 3. Área das competições

As rotas de competição utilizam o prefixo `/{competicao}`. O identificador mais comum no contexto atual é `fll`.

| Rota | Descrição |
| --- | --- |
| `/{competicao}` | Página inicial da competição. |
| `/{competicao}/begins` | Conteúdos introdutórios da temporada. |
| `/{competicao}/explore` | Exploração de conteúdos e recursos. |
| `/{competicao}/future-edition` | Conteúdo da edição futura. |
| `/{competicao}/partiu-mesa` | Preparação para a mesa. |
| `/{competicao}/empathy-map` | Mapa de empatia. |
| `/{competicao}/cheklist` | Checklist de preparação. |
| `/{competicao}/score` | Seleção e acesso ao placar. |
| `/{competicao}/score/{season}` | Placar de uma temporada. |
| `/{competicao}/recall` | Revisão com perguntas e flashcards. |
| `/{competicao}/timers` | Seleção de cronômetros. |
| `/{competicao}/timers/{mode}` | Cronômetro em um modo específico. |

### 3.1. Documentação e avaliação FLL

| Rota | Descrição |
| --- | --- |
| `/{competicao}/docs` | Índice de documentos da competição. |
| `/{competicao}/docs/missions-guide` | Guia de missões. |
| `/{competicao}/rubric` | Rubricas de avaliação. |
| `/{competicao}/future-edition/rubric` | Rubrica da edição futura. |
| `/{competicao}/future-edition/score` | Pontuação da edição futura. |

**Código-fonte:** [`app/(public)/[competicao]`](https://github.com/ohthias/roboStage/tree/main/app/%28public%29/%5Bcompeticao%5D).

---

## 4. QuickBrick Studio

O QuickBrick reúne ferramentas de planejamento e análise estratégica. Suas rotas utilizam o prefixo `/{competicao}/quickbrick`.

| Rota | Descrição |
| --- | --- |
| `/{competicao}/quickbrick` | Índice das ferramentas QuickBrick. |
| `/{competicao}/quickbrick/estrategia` | Planejamento de estratégias. |
| `/{competicao}/quickbrick/heatmap` | Mapa de calor para análise da mesa. |
| `/{competicao}/quickbrick/matriz-de-risco` | Matriz de risco. |
| `/{competicao}/quickbrick/matriz-swot` | Matriz SWOT. |
| `/{competicao}/quickbrick/matriz-swot/{season}` | Matriz SWOT por temporada. |
| `/{competicao}/quickbrick/tabela-de-missoes` | Tabela de missões. |
| `/{competicao}/quickbrick/tabela-de-missoes/{season}` | Tabela de missões por temporada. |
| `/{competicao}/quickbrick/sharks-simulator` | Simulador de trajetórias do robô. |

**Código-fonte:** [`app/(public)/[competicao]/quickbrick`](https://github.com/ohthias/roboStage/tree/main/app/%28public%29/%5Bcompeticao%5D/quickbrick).

---

## 5. Ferramentas públicas

| Rota | Acesso | Descrição |
| --- | --- | --- |
| `/showlive` | Público | Área de eventos e torneios. |
| `/labtest` | Público | Página de entrada do ambiente de testes. |
| `/stagebook` | Público | Apresentação do Stagebook. |

Essas páginas apresentam ferramentas e podem direcionar o usuário a fluxos que exigem autenticação.

---

## 6. Dashboard

O dashboard concentra as funcionalidades autenticadas da plataforma. As rotas utilizam o prefixo `/dashboard`.

| Rota | Descrição |
| --- | --- |
| `/dashboard` | Visão geral da área autenticada. |
| `/dashboard/projects` | Projetos da equipe. |
| `/dashboard/settings` | Configurações da conta ou do espaço de trabalho. |
| `/dashboard/calendar` | Calendário de atividades e eventos. |
| `/dashboard/documents` | Lista de documentos. |
| `/dashboard/documents/{documentId}` | Editor de um documento. |
| `/dashboard/kanban` | Lista de quadros Kanban. |
| `/dashboard/kanban/{boardId}` | Quadro Kanban específico. |
| `/dashboard/team` | Lista e gestão de equipes. |
| `/dashboard/team/{id}` | Detalhes de uma equipe. |
| `/dashboard/team/{id}/settings` | Configurações da equipe. |
| `/dashboard/team/{id}/settings/advanced` | Configurações avançadas da equipe. |

**Código-fonte:** [`app/(protected)/dashboard`](https://github.com/ohthias/roboStage/tree/main/app/%28protected%29/dashboard).

---

## 7. LabTest autenticado

O ambiente autenticado do LabTest permite gerenciar testes e acompanhar suas execuções.

| Rota | Descrição |
| --- | --- |
| `/dashboard/labtest` | Lista de testes do usuário. |
| `/dashboard/labtest/new` | Criação de um teste. |
| `/dashboard/labtest/{id}` | Detalhes e histórico de um teste. |
| `/dashboard/labtest/{id}/execute` | Registro de uma execução. |
| `/dashboard/labtest/{id}/export` | Exportação dos resultados. |
| `/dashboard/labtest/analytics` | Análise dos resultados. |

Para integração programática, consulte a [referência da API do LabTest](API.md#labtest).

---

## 8. Tratamento de erros e estados especiais

Além das páginas de produto, o App Router possui componentes dedicados a estados especiais de navegação e renderização.

| Arquivo | Responsabilidade |
| --- | --- |
| [`app/error.tsx`](https://github.com/ohthias/roboStage/blob/main/app/error.tsx) | Tratamento de erros recuperáveis durante a renderização. |
| [`app/not-found.tsx`](https://github.com/ohthias/roboStage/blob/main/app/not-found.tsx) | Página para recursos ou rotas não encontrados. |
| [`app/(public)/[competicao]/not-found.tsx`](https://github.com/ohthias/roboStage/blob/main/app/%28public%29/%5Bcompeticao%5D/not-found.tsx) | Estado de competição não encontrada. |

Esses arquivos pertencem ao mecanismo de tratamento de estados do Next.js e não representam, necessariamente, páginas acessadas por links convencionais.

---

## Observações técnicas

- Os grupos de rotas do Next.js não aparecem no endereço público.
- Os parâmetros dinâmicos representam segmentos variáveis da URL.
- A existência de uma rota não garante acesso irrestrito: autenticação, autorização e validação podem ser aplicadas no servidor.
- As descrições deste catálogo são funcionais; detalhes de implementação devem ser confirmados no código-fonte correspondente.
- Mantenha esta página sincronizada com as alterações no diretório `app/` para evitar documentar rotas removidas ou desatualizadas.
