# Utilitários e regras de negócio

A pasta [`utils/`](https://github.com/ohthias/roboStage/tree/main/utils) reúne funções e regras de negócio compartilhadas entre páginas, componentes, hooks e rotas da aplicação.

A organização por domínio reduz a duplicação de lógica, centraliza cálculos e mantém as regras da plataforma separadas da camada visual.

## 1. Visão geral dos módulos

| Diretório ou arquivo | Responsabilidade |
| --- | --- |
| `utils/competitions/` | Configuração, navegação e regras das competições. |
| `utils/competitions/fll/` | Fluxos e dados específicos da FIRST LEGO League. |
| `utils/EmpathyMap/` | Análise heurística e exportação do mapa de empatia. |
| `utils/heatmap/` | Gerenciamento de pontos, intensidade, estatísticas e exportação de mapas de calor. |
| `utils/institutional/` | Notícias, documentos legais, comunidade e releases. |
| `utils/labtest/` | Catálogo, modos de teste e estatísticas. |
| `utils/quickbrick/` | Normalização de missões e cálculo de pontuação. |
| `utils/stagebook/` | Escopo, permissões, validação, ordenação e ações do Stagebook. |
| `utils/audio.ts` | Reprodução de sons utilizados pelos cronômetros. |
| `utils/scores.ts` | Cálculos compartilhados de pontuação. |

## 2. Competições

O diretório [`utils/competitions/`](https://github.com/ohthias/roboStage/tree/main/utils/competitions) centraliza configurações utilizadas na navegação e na composição das páginas de cada competição.

### Arquivos principais

| Arquivo | Responsabilidade |
| --- | --- |
| [`competicoes.ts`](https://github.com/ohthias/roboStage/blob/main/utils/competitions/competicoes.ts) | Define o catálogo de competições suportadas. |
| [`competicoes-map.ts`](https://github.com/ohthias/roboStage/blob/main/utils/competitions/competicoes-map.ts) | Associa competições aos componentes correspondentes. |
| [`navigation.ts`](https://github.com/ohthias/roboStage/blob/main/utils/competitions/navigation.ts) | Define grupos e itens de navegação. |
| [`hero.ts`](https://github.com/ohthias/roboStage/blob/main/utils/competitions/hero.ts) | Centraliza a configuração visual das páginas de competição. |

Essa camada permite que a rota dinâmica `/{competicao}` selecione o conteúdo adequado sem distribuir condicionais específicas de cada competição pela interface.

## 3. Ferramentas da FIRST LEGO League

O diretório [`utils/competitions/fll/`](https://github.com/ohthias/roboStage/tree/main/utils/competitions/fll) concentra regras e funções reutilizáveis pelas ferramentas relacionadas à FIRST LEGO League (FLL).

### 3.1. Confere AI

Diretório: [`confere-ai/`](https://github.com/ohthias/roboStage/tree/main/utils/competitions/fll/confere-ai)

O módulo gerencia os dados dos checklists, incluindo a criação do estado inicial, a combinação de itens padrão e personalizados, o cálculo do progresso e a persistência no navegador.

**Funções principais:**

- `createDefaultConfereAIState`
- `mergeChecklistItems`
- `calculateProgress`
- `findNextPendingItem`
- `getChecklistsForMode`
- `getConfereAIState`
- `setConfereAIState`
- `resetConfereAIState`

### 3.2. Guia de missões

Diretório: [`mission-guide/`](https://github.com/ohthias/roboStage/tree/main/utils/competitions/fll/mission-guide)

Fornece tipos, normalização de dados e funções auxiliares para preparar as informações das missões para apresentação no guia.

### 3.3. Partiu Mesa

Diretório: [`partiu-mesa/`](https://github.com/ohthias/roboStage/tree/main/utils/competitions/fll/partiu-mesa)

Reúne funções para o planejamento de mesa, incluindo:

- cálculos e normalização de dados;
- armazenamento local;
- geração de documentos Markdown;
- exportação em PDF;
- sincronização do relógio com a interface por meio do hook `useClockTick`.

A centralização dessas operações permite reutilizar a lógica de planejamento sem concentrar todas as responsabilidades nos componentes visuais.

## 4. Empathy Map

Diretório: [`utils/EmpathyMap/`](https://github.com/ohthias/roboStage/tree/main/utils/EmpathyMap)

O módulo reúne funções para analisar e exportar os dados do mapa de empatia.

| Função | Responsabilidade |
| --- | --- |
| `generateHeuristicAnalysis` | Agrupa e interpreta notas relacionadas a pensamentos, sentimentos, falas e ações. |
| `exportMapToMarkdown` | Gera uma representação legível em Markdown. |
| `exportMapToCSV` | Converte os dados para um formato tabular CSV. |
| `downloadFile` | Inicia o download de um arquivo no navegador. |

A separação entre análise, exportação e interface permite reutilizar as operações em diferentes contextos da aplicação.

## 5. Heatmap

Diretório: [`utils/heatmap/`](https://github.com/ohthias/roboStage/tree/main/utils/heatmap)

O módulo fornece funções para renderização, análise espacial e exportação de mapas de calor.

### Funções principais

| Função | Responsabilidade |
| --- | --- |
| `renderHeatmap` | Desenha a intensidade dos pontos no mapa. |
| `renderTable` | Renderiza a representação da mesa. |
| `computeStats` | Calcula estatísticas dos dados. |
| `getLocalIntensity` | Consulta a intensidade próxima a uma posição. |
| `findNearestPoint` | Localiza o ponto mais próximo. |
| `getMissions` | Carrega as zonas de missão de uma temporada. |
| `exportCanvasPNG` | Exporta o conteúdo do canvas como PNG. |
| `getCanvasDataURL` | Obtém uma representação do canvas em formato Data URL. |

O hook [`useHeatmap`](https://github.com/ohthias/roboStage/blob/main/hooks/useHeatmap.ts) utiliza essa camada para gerenciar o estado e as interações da ferramenta.

Consulte também a documentação de [contextos React e hooks](DEVELOPMENT.md#hook-do-mapa-de-calor).

## 6. Pontuação e missões

### 6.1. Cálculos compartilhados

Arquivo: [`utils/scores.ts`](https://github.com/ohthias/roboStage/blob/main/utils/scores.ts)

Implementa cálculos gerais de pontuação, detalhamento por missão e soma do resultado final.

### 6.2. Pontuação do QuickBrick

Arquivo: [`utils/quickbrick/scoring.ts`](https://github.com/ohthias/roboStage/blob/main/utils/quickbrick/scoring.ts)

O módulo converte os dados JSON brutos de uma temporada em um modelo consistente para a tabela de missões.

O processamento contempla as seguintes etapas:

1. Interpretação dos tipos `switch` e `range`.
2. Normalização de missões e sub-missões.
3. Avaliação de pré-requisitos.
4. Cálculo dos pontos obtidos e da pontuação máxima.
5. Atualização de uma missão sem modificar o objeto original.

Essa estrutura permite trabalhar com missões que utilizam valores booleanos, opções, contadores, dependências e missões personalizadas.

## 7. LabTest

Diretório: [`utils/labtest/`](https://github.com/ohthias/roboStage/tree/main/utils/labtest)

Os módulos fornecem configurações, dados e cálculos utilizados pelas funcionalidades do LabTest.

| Arquivo | Responsabilidade |
| --- | --- |
| `catalog.ts` | Define o catálogo e os campos dos testes. |
| `fll.ts` | Reúne regras e dados relacionados à FLL. |
| `modes.tsx` | Define as configurações dos modos de teste. |
| `stats.ts` | Calcula métricas e estatísticas das execuções. |

A função `computeFieldStats` considera o tipo de campo para produzir métricas apropriadas:

- **Booleanos:** métricas relacionadas a valores verdadeiro/falso.
- **Numéricos:** estatísticas de valores e resultados.
- **Duração:** métricas específicas para tempos registrados.

O módulo complementa os hooks documentados em [Contextos React e hooks](DEVELOPMENT.md#hooks-de-dados-e-testes).

## 8. Stagebook: escopo, permissões e validação

Diretório: [`utils/stagebook/`](https://github.com/ohthias/roboStage/tree/main/utils/stagebook)

O Stagebook utiliza regras compartilhadas para gerenciar o espaço pessoal e os espaços de equipe. Essa camada concentra verificações de escopo, permissões e integridade dos dados.

### 8.1. Resolução de escopo

Arquivo: [`scope.ts`](https://github.com/ohthias/roboStage/blob/main/utils/stagebook/scope.ts)

Resolve informações relacionadas ao usuário autenticado, ao espaço atual e ao papel do membro.

Os papéis documentados são:

- `owner`
- `mentor`
- `competidor`
- `colaborador`

### 8.2. Controle de permissões

Arquivo: [`permissions.ts`](https://github.com/ohthias/roboStage/blob/main/utils/stagebook/permissions.ts)

| Função | Responsabilidade |
| --- | --- |
| `scopeWhere` | Vincula consultas ao usuário ou à equipe correspondente. |
| `requireRole` | Restringe ações conforme o papel exigido. |
| `assertSameScope` | Impede relacionar recursos pertencentes a espaços diferentes. |

**Regra de segurança:** não confie exclusivamente no identificador de um recurso recebido do cliente. As operações no servidor devem validar a autenticação, o escopo e as permissões aplicáveis antes de consultar ou modificar dados.

### 8.3. Validação e ordenação

| Arquivo ou módulo | Responsabilidade |
| --- | --- |
| `validation.ts` | Limpa e valida textos, UUIDs e datas; utiliza `ValidationError` para entradas inválidas. |
| `position.ts` | Calcula posições para inserir itens sem exigir a reordenação completa. |
| `actions/teams.ts` | Implementa operações de criação, listagem e troca de equipe. |
| `actions/notifications.ts` | Implementa operações de criação, listagem e marcação de notificações. |

A centralização dessas regras favorece a consistência entre as operações e reduz a duplicação de verificações.

## 9. Conteúdo institucional

Diretório: [`utils/institutional/`](https://github.com/ohthias/roboStage/tree/main/utils/institutional)

Os módulos abstraem o carregamento de informações institucionais, permitindo que diferentes páginas reutilizem as mesmas fontes de dados.

| Arquivo | Responsabilidade |
| --- | --- |
| `news.ts` | Lista notícias e busca uma notícia pelo `slug`. |
| `legal.ts` | Lista documentos legais e carrega documentos específicos. |
| `github.ts` | Consulta releases do GitHub. |
| `community.ts` | Disponibiliza os canais da comunidade. |

As páginas institucionais e o sitemap reutilizam essas funções para manter uma única fonte de verdade para o conteúdo correspondente.

## 10. Áudio

Arquivo: [`utils/audio.ts`](https://github.com/ohthias/roboStage/blob/main/utils/audio.ts)

A função `playSound(type)` centraliza a reprodução dos sons utilizados pelos cronômetros.

Os tipos documentados são:

- `start`
- `warning`
- `end`
- `tick`

Com essa abstração, os cronômetros podem solicitar a reprodução de um som sem precisar conhecer os caminhos dos arquivos de áudio.

## 11. Boas práticas para novos utilitários

Ao adicionar ou modificar regras compartilhadas no RoboStage:

1. **Organize por domínio:** mantenha a lógica no módulo correspondente à funcionalidade.
2. **Prefira funções puras:** para cálculos que não dependem de estado ou efeitos colaterais.
3. **Valide dados externos:** verifique entradas antes de normalizar ou processar os dados.
4. **Preserve a segurança no servidor:** não dependa de verificações executadas exclusivamente em componentes do cliente para autorizar operações.
5. **Evite mutações desnecessárias:** preserve os objetos de entrada quando a operação puder retornar uma nova estrutura.
6. **Atualize a documentação:** inclua novos módulos nesta página quando passarem a fazer parte da arquitetura compartilhada.

## 12. Documentação relacionada

- [Páginas e rotas](pages.md) — catálogo das páginas e dos caminhos da aplicação.
- [Referência de APIs](API.md) — endpoints utilizados pelo sistema.
- [Contextos React e hooks](DEVELOPMENT.md) — estado compartilhado e lógica reutilizável da interface.
