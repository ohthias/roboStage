# Utilitários e regras de negócio

A pasta [`utils/`](https://github.com/ohthias/roboStage/tree/main/utils)
reúne lógica compartilhada entre páginas, componentes, hooks e rotas. A
separação por domínio evita duplicar cálculos e mantém as regras da plataforma
fora da camada visual.

## Mapa dos módulos

| Diretório ou arquivo | Responsabilidade |
| --- | --- |
| `utils/competitions` | Configuração, navegação e regras específicas das competições |
| `utils/competitions/fll` | Fluxos e dados específicos da FIRST LEGO League |
| `utils/EmpathyMap` | Análise heurística e exportação do mapa de empatia |
| `utils/heatmap` | Pontos, intensidade, estatísticas e exportação de mapas de calor |
| `utils/institutional` | Notícias, documentos legais, comunidade e releases |
| `utils/labtest` | Catálogo, modos e estatísticas dos testes |
| `utils/quickbrick` | Normalização e cálculo de pontuação das missões |
| `utils/stagebook` | Escopo, permissões, validação, posições e ações do Stagebook |
| `utils/audio.ts` | Reprodução dos sons usados pelos cronômetros |
| `utils/scores.ts` | Cálculos compartilhados de pontuação |

## Competições

Arquivos principais:

- [`competicoes.ts`](https://github.com/ohthias/roboStage/blob/main/utils/competitions/competicoes.ts):
  catálogo das competições suportadas.
- [`competicoes-map.ts`](https://github.com/ohthias/roboStage/blob/main/utils/competitions/competicoes-map.ts):
  associação entre uma competição e seus componentes.
- [`navigation.ts`](https://github.com/ohthias/roboStage/blob/main/utils/competitions/navigation.ts):
  grupos e itens de navegação.
- [`hero.ts`](https://github.com/ohthias/roboStage/blob/main/utils/competitions/hero.ts):
  configuração visual das páginas de competição.

Essa camada permite que a rota dinâmica `/<competicao>` selecione o conteúdo
correto sem espalhar condicionais de competição pelos componentes.

## Ferramentas FLL

O diretório
[`utils/competitions/fll`](https://github.com/ohthias/roboStage/tree/main/utils/competitions/fll)
contém regras dos fluxos da FLL:

### Confere AI

[`confere-ai/`](https://github.com/ohthias/roboStage/tree/main/utils/competitions/fll/confere-ai)
define os tipos dos checklists, cria o estado inicial, combina itens padrão e
personalizados, calcula o progresso e persiste o estado no navegador.

Funções importantes:

- `createDefaultConfereAIState`;
- `mergeChecklistItems`;
- `calculateProgress`;
- `findNextPendingItem`;
- `getChecklistsForMode`;
- `getConfereAIState`;
- `setConfereAIState`;
- `resetConfereAIState`.

### Guia de missões

[`mission-guide/`](https://github.com/ohthias/roboStage/tree/main/utils/competitions/fll/mission-guide)
normaliza dados das missões e fornece tipos e helpers para a apresentação do
guia.

### Partiu Mesa

[`partiu-mesa/`](https://github.com/ohthias/roboStage/tree/main/utils/competitions/fll/partiu-mesa)
concentra cálculos, normalização, armazenamento local, geração de Markdown e
exportação em PDF para o planejamento de mesa. O hook `useClockTick` mantém o
relógio sincronizado com a interface.

## Empathy Map

Arquivos:
[`utils/EmpathyMap`](https://github.com/ohthias/roboStage/tree/main/utils/EmpathyMap).

- `generateHeuristicAnalysis` agrupa e interpreta notas de pensamentos,
  sentimentos, falas e ações.
- `exportMapToMarkdown` gera uma versão legível para documentação.
- `exportMapToCSV` gera dados tabulares.
- `downloadFile` inicia o download no navegador.

O domínio mantém a análise e a exportação independentes da tela que edita o
mapa.

## Heatmap

Arquivos:
[`utils/heatmap`](https://github.com/ohthias/roboStage/tree/main/utils/heatmap).

O módulo fornece:

- `renderHeatmap` para desenhar a intensidade dos pontos;
- `renderTable` para renderizar a mesa;
- `computeStats` para calcular estatísticas;
- `getLocalIntensity` para consultar a intensidade próxima a uma posição;
- `findNearestPoint` para localizar o ponto mais próximo;
- `getMissions` para carregar zonas de missão por temporada;
- `exportCanvasPNG` e `getCanvasDataURL` para exportação.

O hook [`useHeatmap`](DEVELOPMENT.md#hook-do-mapa-de-calor) usa essa lógica
para controlar o estado da ferramenta.

## Pontuação e missões

### Placar compartilhado

[`scores.ts`](https://github.com/ohthias/roboStage/blob/main/utils/scores.ts)
implementa cálculos gerais de pontos, detalhamento por missão e soma do
resultado final.

### Tabela de missões do QuickBrick

[`quickbrick/scoring.ts`](https://github.com/ohthias/roboStage/blob/main/utils/quickbrick/scoring.ts)
converte o JSON bruto da temporada em um modelo consistente para a tabela.

O fluxo:

1. interpreta tipos `switch` e `range`;
2. normaliza missões e sub-missões;
3. avalia pré-requisitos;
4. calcula pontos obtidos e pontuação máxima;
5. atualiza uma missão sem alterar o objeto original.

Isso permite suportar missões com booleanos, opções, contadores, dependências e
missões personalizadas.

### LabTest

Os módulos em
[`utils/labtest`](https://github.com/ohthias/roboStage/tree/main/utils/labtest)
complementam os hooks do LabTest:

- `catalog.ts`: catálogo e definição dos campos;
- `fll.ts`: regras e dados relacionados à FLL;
- `modes.tsx`: configurações dos modos de teste;
- `stats.ts`: total possível, médias, melhores resultados e taxa de conclusão.

`computeFieldStats` trata campos booleanos, numéricos e de duração de maneira
diferente para produzir métricas adequadas a cada tipo.

## Stagebook: escopo e segurança

Os módulos em
[`utils/stagebook`](https://github.com/ohthias/roboStage/tree/main/utils/stagebook)
implementam regras usadas pelo espaço pessoal e pelos espaços de equipe.

### Escopo

[`scope.ts`](https://github.com/ohthias/roboStage/blob/main/utils/stagebook/scope.ts)
resolve o usuário autenticado, o espaço atual e o papel do membro. Os papéis
disponíveis são `owner`, `mentor`, `competidor` e `colaborador`.

### Permissões

[`permissions.ts`](https://github.com/ohthias/roboStage/blob/main/utils/stagebook/permissions.ts)
fornece:

- `scopeWhere`, que vincula consultas ao usuário ou à equipe;
- `requireRole`, que restringe ações administrativas;
- `assertSameScope`, que impede relacionar recursos de espaços diferentes.

Essas verificações são importantes para não confiar somente no identificador
de um recurso recebido pelo cliente.

### Validação e ordenação

- `validation.ts`: limpeza de texto, UUIDs e datas, com
  `ValidationError` para entradas inválidas.
- `position.ts`: cálculo de posições para inserir itens sem reordenar tudo.
- `actions/teams.ts`: criação, listagem e troca de equipe.
- `actions/notifications.ts`: criação, listagem e marcação de notificações.

## Conteúdo institucional

Os módulos em
[`utils/institutional`](https://github.com/ohthias/roboStage/tree/main/utils/institutional)
abstraem o carregamento de conteúdo:

- `news.ts`: lista notícias e busca uma notícia por `slug`;
- `legal.ts`: lista documentos legais e carrega um documento específico;
- `github.ts`: consulta releases do GitHub;
- `community.ts`: disponibiliza os canais da comunidade.

As páginas institucionais e o sitemap reutilizam essas funções para manter uma
única fonte de verdade.

## Áudio

[`audio.ts`](https://github.com/ohthias/roboStage/blob/main/utils/audio.ts)
expõe `playSound(type)`, com os tipos `start`, `warning`, `end` e `tick`.
Cronômetros podem usar essa função sem conhecer os caminhos dos arquivos de
áudio.

## Boas práticas para novos utilitários

1. Coloque a regra no domínio correto, evitando helpers genéricos sem contexto.
2. Mantenha funções de cálculo puras sempre que não precisarem de estado.
3. Valide dados externos antes de normalizá-los.
4. Não mova regras de autorização para componentes de cliente.
5. Adicione o link do novo módulo nesta página quando ele se tornar parte da
   arquitetura compartilhada.

