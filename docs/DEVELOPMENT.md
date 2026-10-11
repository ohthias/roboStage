# Referência técnica

Esta página documenta os contextos React e hooks reutilizáveis do RoboStage.

As regras de negócio compartilhadas ficam documentadas em
[Utilitários e regras de negócio](UTILS.md).

## Contexto de notificações

Arquivo: [`app/context/ToastContext.tsx`](https://github.com/ohthias/roboStage/blob/main/app/context/ToastContext.tsx)

O `ToastProvider` disponibiliza notificações temporárias para os componentes
da aplicação. O hook `useToast` deve ser chamado dentro de um
`ToastProvider`; fora dele, a aplicação lança um erro para indicar uso
incorreto.

Recursos principais:

- adicionar uma notificação;
- remover uma notificação;
- limpar todas as notificações;
- expiração automática dos toasts;
- prevenção de referências de timeout esquecidas.

## Hooks de dados e testes

Arquivo: [`hooks/useLabTests.ts`](https://github.com/ohthias/roboStage/blob/main/hooks/useLabTests.ts)

| Hook | Responsabilidade |
| --- | --- |
| `useTests` | Lista os testes do usuário autenticado |
| `useTest(testId)` | Carrega um teste, seus campos e execuções |
| `useCreateTest` | Cria um teste e seus campos |
| `useSaveEntries(testId)` | Salva um lote de execuções |
| `useMissionCatalog(season)` | Carrega o catálogo de missões da temporada |

Os hooks expõem estados de carregamento e erro para que a interface possa
mostrar feedback explícito. As operações persistentes utilizam as rotas
documentadas em [`API.md`](API.md).

## Hook do placar

Arquivo: [`hooks/useScoreCalculator.ts`](https://github.com/ohthias/roboStage/blob/main/hooks/useScoreCalculator.ts)

`useScoreCalculator(data)` mantém os valores das missões e das penalidades e
calcula:

- pontuação de cada missão;
- total das missões;
- faixa de penalidade;
- pontuação final.

O hook usa `useMemo` para evitar recalcular resultados quando os dados de
entrada não mudaram.

## Hook do mapa de calor

Arquivo: [`hooks/useHeatmap.ts`](https://github.com/ohthias/roboStage/blob/main/hooks/useHeatmap.ts)

`useHeatmap()` gerencia os pontos e as configurações do mapa de calor.

Operações disponíveis:

- `addPoint(x, y)`;
- `removeNearest(x, y)`;
- `deleteById(id)`;
- `clear()`;
- `undo()`;
- `setMode(mode)`;
- `setSeason(season)`;
- `setConfig(patch)`.

O histórico interno permite desfazer alterações sem que a página precise
conhecer a implementação do reducer.

## Organização no código

- [`app/`](https://github.com/ohthias/roboStage/tree/main/app): rotas,
  layouts, ações e componentes específicos das páginas.
- [`app/context/`](https://github.com/ohthias/roboStage/tree/main/app/context):
  contextos compartilhados pela aplicação.
- [`hooks/`](https://github.com/ohthias/roboStage/tree/main/hooks): lógica
  reutilizável de estado e dados.
- [`types/`](https://github.com/ohthias/roboStage/tree/main/types): tipos
  compartilhados.
- [`utils/`](https://github.com/ohthias/roboStage/tree/main/utils): regras de
  negócio e funções reutilizáveis por domínio.
