# Contextos React e hooks

Esta página documenta os contextos React e hooks reutilizáveis do RoboStage, responsáveis por compartilhar estado, encapsular operações de dados e centralizar cálculos utilizados pela interface.

As regras de negócio compartilhadas entre diferentes funcionalidades estão documentadas em [Utilitários e regras de negócio](UTILS.md).

## 1. Contexto de notificações

**Arquivo:** [`app/context/ToastContext.tsx`](https://github.com/ohthias/roboStage/blob/main/app/context/ToastContext.tsx)

O `ToastProvider` disponibiliza um sistema de notificações temporárias para os componentes da aplicação. O hook `useToast` permite acessar as operações de notificação dentro do contexto.

O hook deve ser utilizado dentro de um `ToastProvider`. Caso contrário, um erro é lançado para indicar que o contexto não foi configurado corretamente.

### Recursos

- Adicionar uma notificação.
- Remover uma notificação específica.
- Limpar todas as notificações.
- Expirar notificações automaticamente.
- Gerenciar referências de timeout para evitar temporizadores pendentes após a remoção dos toasts.

### Integração

O `ToastProvider` deve envolver a parte da árvore React que precisa acessar as notificações. Os componentes descendentes podem utilizar `useToast` para acionar as operações disponíveis.

## 2. Hooks de dados e testes

**Arquivo:** [`hooks/useLabTests.ts`](https://github.com/ohthias/roboStage/blob/main/hooks/useLabTests.ts)

Os hooks deste módulo encapsulam operações de consulta e persistência relacionadas aos testes do LabTest, reduzindo a necessidade de implementar a mesma lógica diretamente nas páginas e nos componentes.

| Hook | Responsabilidade |
| --- | --- |
| `useTests` | Lista os testes do usuário autenticado. |
| `useTest(testId)` | Carrega um teste, seus campos e suas execuções. |
| `useCreateTest` | Cria um teste e seus campos. |
| `useSaveEntries(testId)` | Salva um lote de execuções. |
| `useMissionCatalog(season)` | Carrega o catálogo de missões de uma temporada. |

### Tratamento de estados

Os hooks expõem estados de carregamento e erro para permitir que a interface apresente feedback adequado durante as consultas e operações.

As operações persistentes utilizam as rotas da aplicação documentadas em [Referência de APIs](API.md).

## 3. Hook de cálculo de pontuação

**Arquivo:** [`hooks/useScoreCalculator.ts`](https://github.com/ohthias/roboStage/blob/main/hooks/useScoreCalculator.ts)

O hook `useScoreCalculator(data)` mantém os valores das missões e das penalidades e calcula os resultados utilizados no placar.

### Resultados calculados

- Pontuação individual de cada missão.
- Soma da pontuação das missões.
- Faixa de penalidade aplicável.
- Pontuação final.

O hook utiliza `useMemo` para evitar recalcular os resultados quando os dados de entrada não mudam.

## 4. Hook do mapa de calor

**Arquivo:** [`hooks/useHeatmap.ts`](https://github.com/ohthias/roboStage/blob/main/hooks/useHeatmap.ts)

O hook `useHeatmap()` gerencia os pontos, as configurações e o histórico de alterações do mapa de calor.

### Operações disponíveis

| Operação | Descrição |
| --- | --- |
| `addPoint(x, y)` | Adiciona um ponto às coordenadas informadas. |
| `removeNearest(x, y)` | Remove o ponto mais próximo das coordenadas informadas. |
| `deleteById(id)` | Remove um ponto pelo identificador. |
| `clear()` | Limpa os pontos do mapa. |
| `undo()` | Desfaz uma alteração anterior. |
| `setMode(mode)` | Atualiza o modo de operação. |
| `setSeason(season)` | Define a temporada utilizada. |
| `setConfig(patch)` | Atualiza as configurações a partir de um conjunto parcial de alterações. |

### Histórico de alterações

O hook mantém um histórico interno que permite desfazer alterações sem exigir que a página conheça os detalhes de implementação do reducer.

Essa separação concentra o gerenciamento do estado no hook e simplifica sua integração com os componentes da interface.

## 5. Organização do código

A lógica reutilizável está distribuída entre diretórios com responsabilidades distintas.

| Diretório | Responsabilidade |
| --- | --- |
| [`app/`](https://github.com/ohthias/roboStage/tree/main/app) | Rotas, layouts, ações e componentes específicos das páginas. |
| [`app/context/`](https://github.com/ohthias/roboStage/tree/main/app/context) | Contextos React compartilhados pela aplicação. |
| [`hooks/`](https://github.com/ohthias/roboStage/tree/main/hooks) | Hooks reutilizáveis para gerenciamento de estado, dados e cálculos. |
| [`types/`](https://github.com/ohthias/roboStage/tree/main/types) | Tipos compartilhados entre módulos. |
| [`utils/`](https://github.com/ohthias/roboStage/tree/main/utils) | Regras de negócio e funções reutilizáveis organizadas por domínio. |

## 6. Documentação relacionada

- [Páginas e rotas](pages.md) — catálogo de páginas e caminhos da aplicação.
- [Referência de APIs](API.md) — documentação dos endpoints utilizados pelo sistema.
- [Utilitários e regras de negócio](UTILS.md) — funções compartilhadas e lógica de domínio.
