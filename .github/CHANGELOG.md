# Changelog

Todas as mudanças relevantes do **RoboStage** são documentadas neste arquivo.

O RoboStage utiliza o versionamento **`YYYY.N`**, em que:

* `YYYY` representa o ano da atualização;
* `N` representa a ordem da atualização dentro daquele ano.

Exemplo: `2026.1` corresponde à primeira atualização oficial de 2026.

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

* **QuickBrick Studio** — planejamento estratégico e documentação técnica.
* **LabTest** — testes e análise de desempenho.
* **InnoLab** — brainstorming, pesquisa e diagramas.
* **ShowLive** — gerenciamento de torneios e eventos.
* **styleLab** — criação e personalização visual.
* **Timers** — cronômetros para diferentes atividades.
* **Flash Q&A** — treinamento por perguntas e flashcards.

O foco atual é a **FIRST® LEGO® League Challenge**, com suporte futuro planejado para outras competições de robótica.

---

## Versionamento

A partir da versão **2026.1**, o RoboStage passa a utilizar o formato:

```text
YYYY.N