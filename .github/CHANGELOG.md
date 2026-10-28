# Changelog

Todas as mudanças relevantes do **RoboStage** são documentadas neste arquivo.

O RoboStage utiliza o versionamento **`YYYY.N`**, em que:

* `YYYY` representa o ano da atualização;
* `N` representa a ordem da atualização dentro daquele ano.

Exemplo: `2026.1` corresponde à primeira atualização oficial de 2026.

---

## [2026.6] — OBR Resgate no laboratório

**Data:** 28/10/2026

A sexta atualização de 2026 aprofunda o suporte à OBR. A modalidade Resgate chega ao LabTest com pontuação, registro de falhas e presets próprios, os testes passam a ser editáveis sem perder o histórico, o QuickBrick Studio ganha a base do StageMap para apresentações de arena e as páginas de documentação e notícias ficam mais fáceis de explorar.

### OBR Resgate

* Adicionado o suporte à modalidade **OBR Resgate**, com lógica de pontuação, registro de falhas e log de resgates.
* Adicionados presets OBR para sensores de cor, seguidor de linha e detecção de vítimas.
* Adicionado o modo `obr` ao `CalibraMode`, integrando presets e tipos OBR aos fluxos de configuração e execução.
* Atualizados os níveis de acesso da OBR e da OBR Resgate no catálogo de recursos por liga.

### LabTest

* Adicionada a página de **edição de testes**, que permite alterar nome, descrição, pasta, etiquetas e marco sem mexer na configuração do teste nem invalidar execuções anteriores.
* A página de execução passou a carregar dinamicamente o fluxo de cada competição, com `ObrRoundExecution` para a OBR e `FllRoundExecution` para a FLL.
* Os resultados das rodadas OBR passaram a ser normalizados e exibidos no histórico de execuções e na visualização do teste, junto aos demais tipos.
* Adicionados **campos calculados**, com fórmulas, campos obrigatórios e valores mínimo e máximo.
* Adicionado o mapa `KNOWN_FIELDS`, que padroniza rótulos, unidades e tipos dos campos, com atenção especial aos parâmetros de PID e giroscópio.
* Adicionadas novas imagens para as configurações de calibração e de runs.
* Melhorados os estados de carregamento e erro na execução de testes.

### QuickBrick Studio

* Criado o módulo **StageMap**, base para montar apresentações de arena com atores, cenas, frames e marcações.
* Adicionados utilitários para criar frames, cenas e atores, com um documento de exemplo.
* Adicionados os tipos `Actor`, `Scene`, `Frame` e `Marking`.
* Adicionadas constantes para as regras da OBR e as propriedades dos atores.

### Documentação e notícias

* Adicionado o componente `DocsSearch` para filtrar os documentos exibidos.
* Adicionado o `NewsUI`, com categorias e metadados das notícias.
* Adicionado o `ArticleClient`, com barra de progresso de leitura e compartilhamento das matérias.
* Adicionados utilitários para buscar, filtrar e formatar notícias.
* Adicionados novos documentos à biblioteca da OBR.
* Atualizados os links de documentos nos guias da FLL.
* Reorganizada a navegação das seções de recursos e ferramentas.

### Correções

* Corrigidas as URLs dos documentos da OBR em `obrDocs.json`.

### Infraestrutura

* As rotas de documentação da FLL e da OBR passaram a usar um utilitário comum de leitura, em vez de ler os arquivos diretamente.
* Adicionados testes para a funcionalidade OBR e para os métodos de cálculo.

> **A v2026.6 leva a OBR Resgate para dentro do laboratório: da calibração dos sensores à pontuação de cada rodada, a equipe testa, registra e analisa tudo no mesmo lugar.**

## [2026.5] — Um ecossistema para cada competição

**Data:** 26/10/2026

A quinta atualização de 2026 consolida o RoboStage como uma plataforma para mais de uma competição. A OBR ganha ferramentas próprias, o Anatix passa a enviar dados do robô em tempo real para o LabTest, o QuickBrick Studio se torna o caderno do robô dentro do Dashboard e o Stagebook recebe etiquetas e marcos universais, ligas, perfis de uso e uma nova gestão de equipes.

### OBR — Olimpíada Brasileira de Robótica

* Adicionado o suporte à OBR no **Confia, mas confira!**, com checklists próprios da competição.
* Adicionado cronômetro ao Pontuador OBR e aprimorada a lógica de pontuação.
* Adicionado o modo **Round OBR** aos Timers.
* Adicionado o modo OBR ao **Recall**, com perguntas e categorias específicas.
* Criada a página **Bastidores**, com uma biblioteca de materiais de estudo e preparação para a OBR.
* Adicionado o componente `LibraryExplorer` para busca e filtragem dos materiais.
* Reformulada a página inicial das competições com as seções de ferramentas, etapas e chamadas para ação (`CompetitionSections`).
* Adicionado o `LivePreview`, uma prévia em tempo real do treino com cronômetro, pontuação e registro das missões.

### Anatix

* Adicionada a conexão USB com robôs através da Web Serial API (`useAnatixSerial`).
* Implementada a decodificação do protocolo do Anatix e o acúmulo dos dados recebidos.
* Adicionados os **Labs Anatix** ao LabTest, com criação, gerenciamento e histórico das sessões.
* Adicionados gráficos de valores ao vivo, marcações na linha do tempo, estados do robô e medição do tempo de execução de trechos do código.
* Adicionados mapas e tabelas para análise dos dados coletados.
* A página pública do Anatix passou para `/anatix`, independente da competição.

### LabTest

* Adicionado suporte à **FLL Future Edition**, com partidas cronometradas, registro de eventos, pontuação por submissão e efeitos sonoros.
* Adicionada a análise das partidas da Future Edition, com evolução da pontuação, desempenho por missão e ritmo da partida.
* Adicionados predefinições do kit **LEGO Education CS & AI**.
* Adicionada a seção **CalibraBot** para calibração de motores, giroscópio e PID.
* Reorganizada a criação de testes em seções (Runs, CalibraBot, personalizados, Kit IA e detalhes do teste).
* Adicionados novos gráficos e o componente `CustomTooltip` para visualização dos dados.
* Aprimorados os cálculos estatísticos com novas métricas.
* Removida a página antiga de Analytics, substituída pelas análises dentro de cada teste.

### QuickBrick Studio

* Integrado o QuickBrick Studio ao Dashboard, com uma área própria de cadernos do robô.
* Adicionados cadernos com versões do robô, vinculados à liga da equipe.
* Adicionado o visualizador 3D de projetos do **BrickLink Studio 2.0** (`.io`), construído com three.js e a biblioteca LDraw.
* Adicionados diagramas de estratégia e missões dentro dos cadernos, com editor dedicado.
* Adicionado envio de arquivos para armazenamento no Cloudflare R2.
* Adicionada a ferramenta **Matriz de Risco**.
* Adicionado suporte a etiquetas nos cadernos do QuickBrick.
* O mapa de calor passou a aceitar um estado inicial, permitindo salvar e retomar o trabalho.

### Stagebook

#### Etiquetas e marcos universais

* Criado um sistema único de **etiquetas (tags)** e **marcos (milestones)** compartilhado entre Kanban, Calendário, ThinkLab, LabTest e QuickBrick.
* Adicionada a página **Etiquetas** no Dashboard, com o `LabelsManager` para criar, editar e excluir etiquetas e marcos.
* Adicionados seletores, chips e controle de cores para etiquetas e marcos.
* Calendário e Kanban passaram a exibir e filtrar etiquetas e marcos.

#### Documentos e pastas

* Adicionadas capas para documentos, com cores, gradientes e imagens (geométrico, montanhas e oceano).
* Adicionados ícones de página com emojis ou ícones vetoriais, fundos e formatos personalizáveis.
* Adicionados **embeds** no editor: cartões do Kanban, eventos do calendário, gráficos do LabTest e quadros do ThinkLab, inseridos pelo menu `/`.
* A página inicial do Stagebook passou a mostrar os documentos recentes.
* Melhorada a árvore de documentos, com dicas de contexto e arrastar e soltar mais confiável.
* Adicionadas cores de pastas para uma identidade visual consistente.
* Melhorado o explorador de pastas.

#### Equipes, permissões e ligas

* Adicionados **perfis de uso**: Competidor, Mentor técnico, Entusiasta e Organizador.
* As regras de criação de equipes passaram a depender do perfil do usuário.
* Adicionada uma matriz de permissões por cargo, com mensagens claras quando uma ação não é permitida.
* Reformulada a área de equipes, com navegação lateral, recursos da equipe, avatares e selos de cargo.
* Adicionada a página **Ligas**, que mostra as competições disponíveis e os recursos liberados em cada uma.
* Adicionado o catálogo de recursos por liga, que define o que cada competição libera dentro do Stagebook.
* Removidas as configurações de organização e o formulário antigo de criação de equipes.

#### Dashboard e configurações

* Adicionadas páginas iniciais do Dashboard adaptadas a cada perfil (competidor, mentor e explorador).
* Reorganizada a página de Configurações em seções: perfil, perfil de uso, preferências, segurança e dados.
* Adicionado o painel de uso, mostrando o consumo de dados pessoais e das equipes.
* Adicionada a limpeza de dados pessoais por categoria.
* Adicionada a preferência de recebimento de convites para equipes.

### ThinkLab

* Adicionados emojis, ícones e imagens como elementos do quadro.
* Adicionadas bibliotecas de emojis por categoria e de ícones Lucide.
* Adicionado cache de imagens para melhorar o desempenho da renderização.
* Adicionados cartões de missões com imagem e texto.
* A exportação em SVG passou a incluir os elementos de mídia.
* Adicionados novos componentes de painel para o editor.

### Roboticar

* Criada a página **Roboticar**, com iniciativas de equipes do Brasil e do mundo.
* Adicionados os números da robótica educacional brasileira, incluindo OBR, FIRST, RoboCup e outras competições.
* Adicionado o gráfico de inscrições da OBR, com visualização em gráfico e tabela.
* Adicionado o explorador de iniciativas com filtros por região e categoria.

### FLL

* Adicionados guias para equipes iniciantes da FLL Challenge e da FLL Explore.
* Adicionado o `GuideChecklist` para acompanhar os primeiros passos da equipe.

### Mapa de Empatia

* Melhorada a responsividade e a usabilidade dos componentes em telas menores.

### Páginas institucionais

* Reformulada a página **Apoie o RoboStage**, com formas de contribuir com e sem código, divulgação e espaço para o futuro apoio financeiro.
* Adicionada a lista de pessoas que contribuíram com o projeto.
* Adicionada a página de **Changelog**, que lê as releases do GitHub e usa o `CHANGELOG.md` como alternativa.
* Reformulada a página do **ShowLive**, com o histórico da ferramenta e os planos para a próxima versão.

### Interface e experiência

* Reorganizada a navegação principal, com selos para itens novos e atualizados.
* Melhorado o `MenuCard`, com número, etiqueta e ação.
* Adicionado fundo animado à página inicial.
* Removida a seção de ferramentas do Footer.
* Melhorada a tela de resultados do Recall, com taxa de acerto e mensagens de acordo com o desempenho.
* Corrigida a formatação de datas no calendário.
* Melhorias de acessibilidade e responsividade em diferentes páginas.

### Correções

* Corrigidos os links da seção de notícias, que agora codificam corretamente os identificadores das matérias.
* Corrigidas as referências de etiquetas nos filtros e na exibição.
* Ajustada a altura dos componentes do caderno do QuickBrick.

### Banco de dados e infraestrutura

* Consolidadas as migrações do Drizzle em uma nova sequência.
* Adicionadas tabelas para marcos, preferências do usuário, Labs Anatix e cadernos do QuickBrick.
* Adicionada a associação dos cadernos do QuickBrick às ligas, com os cadernos existentes vinculados à FLL Challenge.
* Adicionados scripts SQL manuais para a configuração dos novos recursos.
* A senha dos arquivos ZIP do Studio passou a ser lida de uma variável de ambiente.
* Adicionadas as dependências `three`, `@zip.js/zip.js` e `aws4fetch`.
* Atualizados Next.js para 16.4 e React para 19.3.

> **A v2026.5 leva o RoboStage além de uma única competição: OBR, FLL e Anatix passam a conviver no mesmo espaço, com dados em tempo real, cadernos do robô e uma organização de equipes pensada para cada perfil.**

---

## [2026.4] — Novas ferramentas, novas possibilidades

**Data:** 19/10/2026

A quarta atualização de 2026 amplia o ecossistema do RoboStage com novas ferramentas para competições de robótica, criação de arenas, análise de dados e organização de equipes. A versão também aprimora o Stagebook, expande os recursos de colaboração e fortalece a confiabilidade, a documentação e a experiência de uso da plataforma.

### OBR — Olimpíada Brasileira de Robótica

* Adicionado suporte à OBR na estrutura de competições do RoboStage.
* Criada uma página dedicada à apresentação das ferramentas e dos recursos da OBR.
* Adicionado um sistema de pontuação específico para a competição.
* Implementado o cálculo automático da pontuação, incluindo multiplicadores e detalhamento dos resultados.
* Criado o componente `Counter` para facilitar a entrada e o ajuste de valores.
* Atualizada a navegação para incluir a OBR.
* Adicionadas configurações específicas de metadados, ícones e apresentação visual.
* Adicionada uma rota pública para acesso à página da competição.
* Incluídos testes para validar os cálculos de pontuação.

### ArenaBuilder

* Adicionada uma nova ferramenta para criação e gerenciamento de arenas de robótica.
* Implementada a configuração e o posicionamento de elementos no ambiente.
* Adicionada detecção de colisões entre elementos.
* Implementadas funções para análise e validação de projetos.
* Adicionado suporte à configuração de áreas de resgate.
* Implementado o gerenciamento de vítimas, peças e perigos.
* Adicionadas funções para definir formatos de peças e suas interações com os elementos da arena.
* Implementada a exportação de arenas para PNG a partir de SVG.
* Melhorada a experiência de criação e edição em dispositivos móveis.
* Adicionadas interfaces específicas para facilitar a utilização da ferramenta em telas menores.

### Anatix

* Adicionada uma nova página dedicada ao Anatix.
* Integrada a ferramenta à navegação do RoboStage.
* Atualizados os links de acesso e a configuração das páginas de competição.
* Atualizados os elementos visuais e a configuração da apresentação da ferramenta.

### Stagebook

* Expandida a estrutura de organização de documentos e pastas.
* Adicionada uma página dedicada à navegação e ao gerenciamento de pastas.
* Implementadas ações para criação, renomeação e exclusão de pastas.
* Melhorada a integração entre pastas, documentos e painéis de gerenciamento.
* Adicionado suporte à criação de ThinkLabs vinculados a pastas.
* Implementadas verificações de permissões para criação e gerenciamento de ThinkLabs.
* Refatoradas as verificações de propriedade e acesso aos recursos.
* Aprimorado o editor de documentos com suporte à criação, edição e exclusão de tabelas.
* Adicionadas opções de alinhamento e manipulação de tabelas ao editor.
* Implementados recursos de seleção de blocos e arrastar e soltar.
* Adicionadas ferramentas contextuais para edição dos blocos selecionados.
* Refatorados os plugins de seleção e a barra de ferramentas para melhorar a legibilidade e a manutenção do código.

### Calendário

* Aprimorado o calendário com filtros por equipe.
* Adicionado suporte à seleção de múltiplas equipes.
* Implementada a validação de associação do usuário às equipes selecionadas.
* Adicionada uma visualização dos eventos do dia atual.
* Melhorada a apresentação e a organização dos eventos.
* Atualizados os links de acesso ao calendário no Dashboard e na navegação.

### ThinkLab

* Adicionado o ThinkLab, um espaço para organizar ideias, diagramas e evidências.
* Implementada a criação e o gerenciamento de ThinkLabs.
* Adicionado suporte à edição e exclusão de espaços.
* Implementados modais e validações para as operações de gerenciamento.
* Adicionados modelos de diagramas para diferentes atividades, incluindo Ishikawa, matriz 5W2H, mapa de empatia, fluxo de autenticação e arquitetura de microsserviços.
* Criadas funções utilitárias para organização e composição de classes CSS.
* Integrado o ThinkLab ao painel das equipes e à navegação do Stagebook.
* Adicionado suporte à organização dos ThinkLabs em pastas.
* Aprimoradas as verificações de permissões e escopos de acesso.

### Mapa de Empatia

* Adicionada uma ferramenta para criação e gerenciamento de mapas de empatia.
* Implementado o gerenciamento de mapas, incluindo criação, seleção, duplicação e exclusão.
* Adicionado gerenciamento de personas.
* Implementada a edição de informações e o envio de fotos das personas.
* Criado o componente `PersonaBar` para apresentação e busca rápida de personas.
* Adicionadas notas adesivas com edição de conteúdo, alteração de cores e votação.
* Implementada a geração de análises heurísticas.
* Adicionada exportação dos mapas para Markdown e CSV.
* Integrada a ferramenta à navegação do RoboStage.
* Criados tipos específicos para melhorar a segurança e a organização dos dados.

### LabTest

* Melhorada a apresentação dos cartões de testes.
* Aprimorado o tratamento e a exibição das imagens utilizadas nos testes.
* Atualizada a organização visual dos componentes.
* Simplificados os elementos da barra de ferramentas para uma interface mais limpa.

### FLL e carregamento de dados

* Melhorado o tratamento de erros no carregamento de `missions.json`.
* Aprimorada a identificação de respostas inválidas durante a leitura dos dados das missões.
* Melhorado o tratamento de falhas relacionadas à instabilidade das fontes de dados da FLL.
* Adicionadas informações sobre a instabilidade dos sistemas da FLL à área de notícias.

### Interface e experiência

* Atualizada a apresentação visual da página inicial.
* Adicionada uma nova imagem à seção principal.
* Melhorada a apresentação da página de exportação.
* Aprimorados os layouts e a responsividade de páginas e componentes.
* Atualizados ícones, links e elementos de navegação para as novas ferramentas.
* Melhorada a apresentação dos componentes de pontuação.
* Refinados os layouts da página inicial da OBR.
* Atualizados os textos e a organização das páginas de calendário, pastas e LabTest.
* Removida a página de projetos, simplificando a navegação da plataforma.
* Removido o `SmoothScroll` para simplificar o comportamento de rolagem.
* Melhorada a consistência visual entre as diferentes ferramentas.

### APIs, validação e confiabilidade

* Aprimorada a validação dos tipos de relacionamento entre entidades.
* Melhorado o tratamento de erros nas APIs.
* Simplificada a leitura de arquivos JSON.
* Aprimoradas as verificações de propriedade e permissões no ThinkLab.
* Melhorada a confiabilidade das operações de criação, edição e exclusão.
* Corrigidos problemas identificados durante o desenvolvimento das novas ferramentas.

### Documentação

* Ampliada a documentação técnica das páginas da plataforma.
* Adicionada documentação para utilitários e APIs.
* Reorganizados os documentos técnicos para facilitar a consulta e a manutenção.
* Melhorada a estrutura de documentação das ferramentas e dos recursos do RoboStage.

### Arquitetura e manutenção

* Refatorados componentes e plugins para melhorar a legibilidade do código.
* Melhorada a organização das funções utilitárias.
* Atualizadas dependências relacionadas ao editor de documentos.
* Expandida a estrutura de dados para suportar regras de colunas e marcos nos quadros.
* Aprimorada a organização das permissões e dos escopos de acesso.
* Melhorada a manutenção dos componentes e das funcionalidades existentes.

> **A v2026.4 expande o RoboStage com novas ferramentas para competições, criação de arenas, análise e organização de ideias, conectando o desenvolvimento de projetos robóticos a um ambiente cada vez mais completo para equipes e técnicos.**

---

## [2026.3] — Um novo espaço para suas ideias

**Data:** 02/10/2026

A terceira atualização de 2026 amplia o RoboStage para além das ferramentas de competição, introduzindo o **Stagebook**, novos recursos de colaboração, calendário, Kanban e uma nova geração do LabTest.

### Stagebook

* Adicionado o Stagebook, um novo espaço para organizar ideias, estratégias, testes e aprendizados.
* Criada uma nova página dedicada ao Stagebook.
* Adicionados links de acesso ao Stagebook no Navbar e Footer.
* Implementada estrutura de documentos e páginas para organização do conteúdo.
* Adicionado sistema de pastas e hierarquia de documentos.
* Adicionado sistema de tags para organização de documentos e cartões.
* Adicionada estrutura de permissões e escopos.
* Adicionado suporte a organizações e equipes.
* Implementado gerenciamento de membros e funções das equipes.
* Adicionadas configurações da organização.
* Adicionado painel dedicado para equipes.
* Implementado gerenciamento de convites e membros.
* Adicionada atualização em tempo real das atividades das equipes.
* Adicionadas notificações e central de notificações.

### Calendário

* Criada uma nova ferramenta de calendário no Dashboard.
* Adicionado suporte à criação de eventos.
* Adicionado suporte à edição e exclusão de eventos.
* Adicionada navegação entre meses.
* Adicionados diferentes tipos de eventos.
* Implementada vinculação de documentos aos eventos.
* Adicionada possibilidade de desvincular documentos dos eventos.
* Criadas ações de servidor para gerenciamento dos eventos.
* Adicionado suporte a eventos sem data final.
* Melhorado o tratamento de eventos que ocupam múltiplos dias.

### Kanban

* Adicionada uma nova área de gerenciamento de tarefas em formato Kanban.
* Criada estrutura de quadros e colunas.
* Adicionados cartões para organização das atividades.
* Adicionado suporte a tags e responsáveis nos cartões.
* Adicionado sistema de documentos vinculados aos cartões.
* Adicionado histórico de eventos dos cartões.
* Melhoradas as interações e a apresentação dos quadros.
* Adicionados novos controles e ícones para ações dos quadros.
* Melhorada a acessibilidade das ações do Kanban.

### LabTest

* Expandida a criação de testes.
* Adicionados novos modelos e metadados para os testes.
* Melhorada a organização do catálogo de testes.
* Ampliado o suporte aos diferentes modos de teste.
* Melhorada a execução de testes.
* Adicionado suporte a análises dos resultados.
* Adicionados novos componentes para visualização e gerenciamento dos testes.
* Melhorada a apresentação dos últimos testes realizados.
* Adicionados novos controles de filtragem e visualização.
* Melhorada a descrição dos campos dos testes.
* Aprimorado o suporte aos testes da FLL Challenge.
* Melhorado o tratamento dos resultados e execuções.

### Sharks Simulator

* Adicionada experiência mobile ao Sharks Simulator.
* Criado controle de trajetória por toque em dispositivos móveis.
* Adicionado painel mobile para configuração do robô.
* Adicionado painel mobile para gerenciamento de waypoints.
* Adicionada possibilidade de remover waypoints.
* Adicionado controle de velocidade dos waypoints.
* Melhorada a experiência de navegação e interação no simulador.
* Criadas funções para conversão de interações por toque em comandos de trajetória.

### Estratégia e Matriz SWOT

* Adicionado suporte aprimorado para utilização da Matriz SWOT em dispositivos móveis.
* Criado componente específico para experiência mobile.
* Melhorada a responsividade das ferramentas de estratégia.
* Melhorada a interação com elementos da estratégia.

### FLL e Future Edition

* Atualizada a documentação da FLL Future Edition.
* Adicionada nova página de rubricagem da Future Edition.
* Criada navegação específica para a rubricagem da Future Edition.
* Melhorada a integração da Future Edition com a estrutura de competições.
* Atualizados os dados e caminhos das missões da Future Edition.
* Melhorada a documentação das ferramentas e recursos da FLL.
* Adicionadas novas documentações relacionadas às ferramentas da plataforma.

### Autenticação e organizações

* Melhorada a integração com o Clerk.
* Atualizado o gerenciamento de autenticação.
* Adicionado suporte a funções personalizadas nas equipes.
* Melhorada a sincronização entre usuários e organizações.
* Refinado o gerenciamento de escopos e permissões.
* Melhorada a navegação entre diferentes contextos de trabalho.

### Dashboard

* Reformulada a organização do Dashboard.
* Adicionados novos links e áreas de navegação.
* Melhorada a apresentação dos conteúdos.
* Atualizada a navegação para suportar os novos recursos de colaboração.
* Melhorada a experiência de gerenciamento de equipes.

### Interface e experiência

* Melhorias gerais de responsividade.
* Melhorias na experiência mobile.
* Atualizações no Navbar e Footer.
* Melhorias em animações e transições.
* Melhorias na navegação entre páginas.
* Melhorias de acessibilidade em diferentes componentes.
* Melhorias nos estados de carregamento e feedback.
* Integração de notificações Toast para ações do usuário.
* Melhorias gerais de consistência visual.

### Sitemap e páginas públicas

* Substituído o sitemap estático por uma implementação dinâmica.
* Melhorada a geração automática do sitemap.
* Atualizada a indexação das páginas.
* Melhorada a estrutura das páginas públicas.
* Atualizadas páginas relacionadas às novas ferramentas.

### Documentação

* Adicionadas novas documentações para as ferramentas da plataforma.
* Atualizados documentos existentes.
* Ampliada a documentação relacionada à FLL.
* Adicionados conteúdos sobre o Stagebook.
* Atualizada a documentação de recursos e ferramentas.

### Arquitetura e código

* Refatorada a estrutura interna do projeto.
* Melhorada a organização de utilitários.
* Criadas funções compartilhadas para validação.
* Criadas funções compartilhadas para gerenciamento de escopos.
* Criadas funções para gerenciamento de posições em listas.
* Melhorada a organização das permissões.
* Melhorada a tipagem e organização do código TypeScript.
* Atualizadas dependências do projeto.
* Atualizada a integração com Lenis para rolagem suave.

### Correções e estabilidade

* Corrigidos diversos problemas de interface.
* Corrigidos problemas de responsividade.
* Melhorado o tratamento de erros.
* Corrigidos problemas em componentes de navegação.
* Melhorada a estabilidade das novas ferramentas.
* Corrigidos problemas identificados durante o desenvolvimento das novas funcionalidades.

> **2026.3 amplia o RoboStage para um espaço de organização, colaboração e evolução das equipes, conectando planejamento, documentação, testes e acompanhamento em um único ambiente.**

---

## [2026.2] — Fronteiras Reabertas

**Data:** 09/09/2026

A segunda atualização de 2026 marca uma nova fase do RoboStage, com novas ferramentas, o retorno do sistema de usuários, melhorias na experiência da plataforma e uma infraestrutura preparada para os próximos passos do projeto.

### Partiu Mesa!

* Adicionada uma nova ferramenta dedicada ao FLL Challenge.
* Permite realizar testes rápidos de lançamentos na arena.
* Adicionado registro dos resultados dos testes.
* Adicionado acompanhamento do desempenho.
* Adicionada possibilidade de exportar os dados obtidos.

### Confia, mas confira!

* Adicionada uma nova ferramenta de checklist personalizável.
* Permite criar itens próprios de verificação.
* Adicionada organização dos itens do checklist.
* Criada uma experiência voltada à preparação para partidas, treinos e competições.

### Guia de Missões — BIOGLOW Founders Edition

* Adicionada uma nova seção de documentação dedicada ao Guia de Missões da BIOGLOW Founders Edition.
* Disponibilizadas informações sobre os objetivos das missões.
* Adicionadas informações sobre mecanismos e funcionamento.
* Disponibilizadas informações relacionadas à pontuação.

### Sistema de Usuários

* Retornado o sistema completo de usuários.
* Adicionado novo sistema de autenticação utilizando Clerk.
* Adicionado login utilizando contas do GitHub.
* Adicionada verificação de e-mail durante a autenticação.
* Melhorado o gerenciamento de sessões.
* Criada estrutura para gerenciamento de organizações.
* Preparada a infraestrutura para futuros recursos colaborativos.

### Recall

* Flash Q&A foi transformado em Recall.
* Reformuladas as perguntas.
* Reorganizado o conteúdo.
* Ampliado o foco em revisão e recuperação de conhecimento.
* Adicionada nova categoria BIOGLOW.
* Adicionados conteúdos relacionados ao impacto do projeto.
* Adicionados conteúdos relacionados ao processo de pesquisa.
* Adicionados conteúdos relacionados à biodiversidade.
* Adicionados conteúdos para revisão dos conhecimentos adquiridos durante a temporada.

### Interface e experiência

* Melhor organização da navegação.
* Refinamento do Footer.
* Atualização da Central de Ajuda.
* Melhorias na interface da FLL Future Edition.
* Adicionada ferramenta de rubrica de avaliação.
* Correções ortográficas.
* Atualização dos conteúdos relacionados à BIOGLOW.

### QuickBrick Studio

#### Estratégias

* Adicionada ferramenta de borracha ao modo de estratégias.
* Melhorada a experiência de edição e correção dos desenhos.

#### Mapa de Calor

* Aprimorado o brush do mapa de calor.
* Tornados os traços contínuos.
* Melhorada a experiência de desenho.

#### Tabela de Missões

* Corrigidas informações relacionadas às missões exibidas na tabela.

### FLL Future Edition

* Adicionado som ao cronômetro do pontuador.
* Corrigida a responsividade em dispositivos móveis.
* Melhorada a experiência geral de utilização.

### Recursos para equipes iniciantes

* Atualizados os links da área para equipes iniciantes.
* Adicionadas novas seções.
* Reorganizados os conteúdos.
* Melhorada a estrutura para descoberta de recursos.

### Segurança

* Corrigidas vulnerabilidades relacionadas aos links das notícias.
* Reforçada a validação de rotas.
* Melhorada a navegação interna.
* Adicionada verificação de e-mail durante a autenticação.
* Melhorado o controle de acesso aos recursos da plataforma.

### Infraestrutura

* Atualizadas as dependências do projeto.
* Melhorada a indexação do sistema.
* Melhorada a estabilidade e compatibilidade.
* Otimizados processos internos de manutenção.
* Otimizada a infraestrutura de autenticação.
* Atualizados componentes relacionados ao novo sistema de usuários.
* Adicionado o `LICENCES.md`, reunindo uma visão geral das licenças utilizadas pelo projeto.

### Documentação

* Criado um novo espaço dedicado à documentação da plataforma.
* Ampliada a documentação dos recursos.
* Melhorada a explicação do funcionamento interno da plataforma.
* Criada uma estrutura para facilitar a manutenção e futuras contribuições.

> **A v2026.2 — Fronteiras Reabertas — representa a reconstrução da base do RoboStage para uma nova fase, abrindo caminho para experiências mais personalizadas e colaborativas.**

---

## [2026.1] — BIOGLOW™

**Data:** 04/08/2026

A primeira atualização do novo ciclo anual do RoboStage prepara a plataforma para a temporada **FIRST® LEGO® League Challenge BIOGLOW™ 2026/2027**, trazendo novas ferramentas, conteúdos e melhorias de experiência.

### Temporada BIOGLOW™

* Adicionado o pontuador da temporada BIOGLOW™.
* Atualizadas as ferramentas do QuickBrick Studio para o novo tapete da temporada.
* Disponibilizados documentos oficiais da temporada dentro da plataforma.
* Adicionado um novo espaço dedicado à FLL Future Edition.
* Criada uma área de conteúdos voltada para equipes iniciantes.

### QuickBrick Studio

* Novo visual para o Sharks Simulator.
* Novo layout para a ferramenta Matriz SWOT.
* Melhorias na construção de zonas e robôs da ferramenta Estratégia.
* Configurações do pincel aprimoradas na ferramenta Mapa de Calor.
* Padronização visual entre as ferramentas do QuickBrick Studio.

### Interface e experiência

* Melhor contraste e legibilidade no tema escuro.
* Novo layout e novas rotas para os temporizadores.
* Personalização da contagem regressiva do temporizador Round do Robô.
* Melhorias gerais de responsividade.
* Diversos ajustes de interface e usabilidade.

### Correções

* Corrigida a exibição das dicas no Flash Q&A.
* Corrigida a posição de inicialização do robô no Sharks Simulator.
* Atualizadas as perguntas frequentes.
* Atualizado o conteúdo do Help Desk para refletir as ferramentas atualmente disponíveis.

### Performance e segurança

* Corrigidas vulnerabilidades identificadas em dependências do projeto.
* Removidos scripts desnecessários das ferramentas do QuickBrick Studio.
* Reduzido o carregamento desnecessário da aplicação.

### Plataforma

* Melhorias de SEO e indexação das páginas relacionadas à FIRST® LEGO® League.
* Implementação de breadcrumbs dinâmicos e flexíveis.
* Ampliação da acessibilidade com novos atributos ARIA.
* Otimizações internas para melhorar estabilidade, organização e manutenção do código.

> **BIOGLOW™ marca o início do novo ciclo do RoboStage para a temporada 2026/2027.**

---

## [5.1.0] — Releases automatizadas

**Data:** 06/07/2026

A versão 5.1.0 introduziu melhorias no processo de desenvolvimento e publicação do RoboStage.

### Releases

* Adicionado workflow do GitHub Actions para automatização das releases.
* Tornado o processo de versionamento mais consistente.
* Melhorado o fluxo de desenvolvimento contínuo.
* Facilitada a distribuição de novas versões da plataforma.

### Interface

* Atualizados diversos componentes da interface.
* Refinados layouts e estruturas de páginas.
* Melhorada a consistência visual entre diferentes partes da plataforma.
* Realizados ajustes de usabilidade e apresentação.

---

## [5.0.5] — Reimagination

**Data:** 04/07/2026

A versão 5.0 representou uma grande reformulação da plataforma, abrangendo arquitetura, experiência do usuário e organização interna dos serviços.

### Plataforma

* Interface completamente redesenhada.
* Dashboard reimaginado.
* Nova navegação.
* Melhorias de UX em toda a plataforma.
* Novas páginas de erro e manutenção.

### Área do usuário

* Reformulação completa da experiência do usuário.
* Adicionadas novas funcionalidades à conta.
* Melhor organização das informações.
* Melhorias na autenticação e gerenciamento de sessão.

### ShowLive

* Nova experiência para gerenciamento de eventos.
* Expansão das funcionalidades para organizadores.
* Interface modernizada.

### Ferramentas

* Atualizações no QuickBrick.
* Adicionado o Sharks Simulator.
* Melhorias em ferramentas existentes.

### Arquitetura

* Refatoração da autenticação.
* Reorganização da estrutura interna da aplicação.
* Remoção de código legado.
* Remoção de serviços e repositórios não utilizados.
* Melhor organização dos clientes e integrações.
* Preparação da arquitetura para futuras funcionalidades.

### Plataforma institucional

* Criada uma nova central de documentos legais.
* Implementado um modelo de versionamento para documentos.
* Melhorias na landing page.
* Atualizações de SEO.
* Melhorias na estrutura de navegação.

### Correções

* Correções gerais de bugs.
* Ajustes visuais.
* Melhorias de desempenho.
* Correções relacionadas a datas, layouts e estabilidade.

---

## [3.3.4] — Melhorias e estabilidade

**Data:** 06/12/2025

### Melhorias

* Correções relacionadas à segurança do projeto.
* Melhorias na ferramenta Estratégias.
* Melhorias no SHARKS UNEARTHED Simulator.
* Melhorias no InnoLab.
* Melhorias no hub de gerenciamento de eventos do ShowLive.
* Consolidação das atualizações da série 3.0.x e 3.1.x.

---

## [3.0.0] — Documentação & Testes

**Data:** 13/09/2025

A versão 3.0 expandiu significativamente as ferramentas de treinamento, documentação e análise do RoboStage.

### LabTest

* Criação e gerenciamento de testes de missão.
* Integração com Supabase.
* Estatísticas detalhadas.
* Gráficos e tabelas de resultados.
* Diferentes modos de visualização.
* Edição e exclusão de testes existentes.

### QuickBrick Studio

* Criado o ambiente para planejamento de estratégias de mesa.
* Suporte a múltiplas temporadas e missões.
* Adicionado o QuickBrickCanvas.
* Organização visual de estratégias.
* Camadas e ferramentas de desenho.

### Matriz SWOT

* Criada ferramenta para documentação de estratégia de mesa.
* Adicionado o SWOTCanvas.
* Exportação para PNG.
* Exportação para PDF.

### Dashboard

* Novo layout de navegação.
* Novo Navbar.
* DashboardLayout responsivo.
* Roteamento baseado em hash para seções internas.
* Página de Settings para gerenciamento de conta e parâmetros.

### Interface

* Refinamento geral da UI/UX.
* Melhorias em cores.
* Suporte aprimorado aos temas claro e escuro.
* Melhorias de responsividade.
* Novos componentes de feedback visual.
* Toasts e estados de carregamento.

### Código

* Refatoração para melhorar legibilidade.
* Melhorias na tipagem TypeScript.
* Organização interna aprimorada.

### Correções

* Correções de pontuação no ShowLive e FLL Score.
* Ajustes no criador de estratégias do QuickBrick.
* Correções de tipagem nas propriedades das missões.
* Melhor tratamento de erros no AuthForm.
* Ajustes no comportamento do ModalLabTest.

---

## [2.2.0] — Estabilidade

**Data:** 30/08/2025

Última atualização da linha 2.x antes da evolução para a versão 3.0.

### Adicionado

* Melhorias gerais na plataforma.
* Preparação da arquitetura para a próxima versão principal.

### Correções

* Correções de pequenos problemas de exibição.
* Ajustes de estilos.
* Refinamentos de layout.
* Correções de inconsistências no fluxo interno.
* Melhorias de responsividade.
* Ajustes de compatibilidade com navegadores.
* Correções de problemas menores de carregamento.

### Manutenção

* Atualização geral das dependências.
* Manutenção do código.

---

## [2.0] — Usuários e Eventos

**Data:** 16/08/2025

### Plataforma

* Reformulação das estruturas relacionadas a usuários.
* Reformulação das estruturas relacionadas a eventos.
* Melhor organização dos dados.
* Melhorias na manutenção do código.

### Performance

* Redução de mais de 450 linhas de código.
* Otimização da estrutura interna.
* Redução do consumo de recursos.

### Funcionalidades

* Novos recursos para gerenciamento de usuários.
* Novos recursos para gerenciamento de eventos.
* Experiência mais robusta para usuários e organizadores.

---

## [1.3-beta] — FLL Score & QuickBrick Studio

**Data:** 13/07/2025

Esta versão marcou a introdução de ferramentas importantes para treinamento e estratégia de equipes FLL.

### FLL Score

* Criado sistema configurável de pontuação.
* Seleção de missões.
* Cálculo automático da pontuação.
* Suporte às regras da temporada.

### QuickBrick Studio

* Criada ferramenta para planejamento de estratégias.
* Desenho diretamente sobre o tapete oficial da competição.
* Ferramentas de marcação para criação de estratégias visuais.

### Eventos

* Refatoração do gerenciamento de eventos.
* Melhor organização dos dados por sala e equipe.

### Interface

* Redesenho da interface.
* Melhorias de navegação.
* Experiência mais fluida.

### Correções

* Remoção de conteúdos e scripts obsoletos.
* Correção de estados inconsistentes durante edição de dados e pontuações.

---

## [1.2-beta] — Interface & Personalização

**Data:** 20/06/2025

### Equipes

* Adicionado novo tipo de conteúdo para equipes.
* Suporte completo na interface administrativa.

### Configurações de eventos

* Criada página de configurações do evento.
* Personalização de temas.
* Seleção de cores.
* Preview visual.
* Configurações operacionais.
* Configurações de exibição.

### Interface

* Formulários de tema com preview dinâmico.
* Nova navegação lateral.
* Adicionada opção de configurações.
* Removidos controles obsoletos.
* Reorganização visual da interface.

### Experiência

* Redirecionamento automático quando uma sala não é encontrada.
* Melhorias no GlobalError.
* Feedbacks mais claros para o usuário.
* Atualizações visuais no `globals.css`.
* Maior utilização de variáveis do Tailwind CSS.

### Backend

* Nova rota de API para atualização de prêmios vinculados às salas.
* Melhor tratamento de erros nos endpoints.
* Logs aprimorados para debugging.
* Integração refinada com Supabase.

---

## [1.1-beta] — Correções e refatoração

**Data:** 01/06/2025

### Middleware

* Correção do armazenamento de cookies para visitantes.
* Correção do armazenamento de cookies para voluntários.
* Padronização da verificação de sessão.

### Hero

* Correção da exibição nas rotas `/create-room` e `/enter`.
* Correção do ícone central.
* Melhor comportamento em telas menores.
* Ajuste de largura fluida.

### Arquivos estáticos

* Correções no carregamento de arquivos da pasta `public`.
* Normalização dos caminhos para ambientes locais e de produção.

### Painel administrativo

* Corrigida a remoção de equipes.
* Corrigida a exibição do nome da equipe.
* Melhorada a persistência das atualizações.
* Adicionados alertas visuais para pontuações.
* Corrigido o campo `urlPath`.

### Visitantes

* Atualização automática ao detectar mudanças no backend.
* Reduzida a necessidade de atualização manual da página.

### Login

* Corrigido o campo de login para aceitar `Ctrl + V`.

### Voluntários

* Melhorado o controle de confirmação e desistência.
* Ajustados os formulários de seleção de salas e categorias.
* Melhorada a sincronização com o backend.

### Refatoração

* Reorganização dos arquivos.
* Remoção de componentes não utilizados.
* Padronização de nomes, props e diretórios.
* Melhor controle de estado.

---

## Histórico

O RoboStage evoluiu de uma plataforma inicialmente voltada ao gerenciamento de eventos e pontuação para um ecossistema de ferramentas para equipes, técnicos, mentores, organizadores e árbitros da robótica.

Atualmente, a plataforma reúne ferramentas como:

* **Stagebook** — documentos, pastas, equipes, etiquetas e marcos.
* **QuickBrick Studio** — planejamento estratégico, cadernos do robô e documentação técnica.
* **LabTest** — testes, calibração e análise de desempenho.
* **Anatix** — dados do robô em tempo real via USB.
* **ThinkLab** — brainstorming, pesquisa e diagramas.
* **Kanban** e **Calendário** — organização de tarefas e do tempo da equipe.
* **ArenaBuilder** — criação de arenas de robótica.
* **ShowLive** — gerenciamento de torneios e eventos.
* **Timers** — cronômetros para diferentes atividades.
* **Recall** — revisão por perguntas e flashcards (antigo Flash Q&A).

A plataforma atende à **FIRST® LEGO® League** e à **Olimpíada Brasileira de Robótica (OBR)**, com estrutura preparada para outras competições.

---

## Versionamento

A partir da versão **2026.1**, o RoboStage passa a utilizar o formato:

```text
YYYY.N
```

* `YYYY` — ano da atualização.
* `N` — ordem da atualização dentro do ano.