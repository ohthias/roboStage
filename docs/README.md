# RoboStage

> Documentação técnica do ecossistema RoboStage — arquitetura, funcionalidades, APIs e desenvolvimento.

[**Acessar plataforma**](https://www.robostage.com.br/) · [**Repositório GitHub**](https://github.com/ohthias/roboStage) · [**Releases**](https://github.com/ohthias/roboStage/releases) · [**Reportar problema**](https://github.com/ohthias/roboStage/issues)

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-App_Router-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## Visão geral

O **RoboStage** é uma plataforma web de código aberto voltada à organização, ao desenvolvimento e à evolução de equipes de robótica educacional.

O projeto integra ferramentas de planejamento estratégico, documentação técnica, testes de robôs, análise de dados, gestão de tarefas e preparação para competições em um único ecossistema.

Seu desenvolvimento é orientado principalmente às necessidades de equipes participantes da **FIRST® LEGO® League Challenge (FLLC)**, com uma arquitetura que permite a evolução contínua de ferramentas e integrações.

Esta documentação descreve como o projeto é organizado, como seus componentes funcionam e como desenvolver, integrar ou contribuir com novas funcionalidades.

## Navegação técnica

| Documentação | Descrição |
| --- | --- |
| [Arquitetura](architecture.md) | Organização da aplicação, componentes e fluxo de dados. |
| [Funcionalidades](features.md) | Visão técnica dos módulos e seus recursos. |
| [Referência das APIs](API.md) | Endpoints, parâmetros, respostas e códigos de erro. |
| [Banco de dados](database.md) | Modelagem, tabelas, relacionamentos e migrações. |
| [Autenticação e autorização](authentication.md) | Autenticação, permissões e controle de acesso. |
| [Instalação e configuração](development/setup.md) | Ambiente local, dependências e variáveis de ambiente. |
| [Estrutura do projeto](development/project-structure.md) | Diretórios, responsabilidades e convenções. |
| [Contribuição](https://github.com/ohthias/roboStage/blob/main/.github/CONTRIBUTING.md) | Fluxo de contribuição, issues e pull requests. |
| [Changelog](https://github.com/ohthias/roboStage/blob/main/.github/CHANGELOG.md) | Histórico de alterações. |

> Algumas páginas técnicas podem estar em desenvolvimento. Consulte o repositório para verificar os arquivos e recursos já disponíveis.

---

## Ecossistema

O RoboStage é composto por módulos especializados que atendem diferentes etapas do trabalho de uma equipe.

### Stagebook

Ambiente de organização e documentação. Centraliza documentos, pastas, tags, ideias, aprendizados e informações compartilhadas entre os integrantes da equipe.

### QuickBrick Studio

Ferramentas para planejamento estratégico, análise de missões, organização de runs e preparação de estratégias para o robô.

### LabTest

Ambiente de experimentação e registro de testes. Permite configurar execuções, armazenar resultados e analisar o desempenho e a consistência do robô.

### ThinkLab

Ferramentas para estruturar processos de pesquisa e desenvolvimento, incluindo organização de ideias, diagramas, evidências e atividades relacionadas ao Projeto de Inovação.

### Kanban e Calendário

Recursos de organização do trabalho, acompanhamento de tarefas, distribuição de responsabilidades e planejamento de eventos da equipe.

### ShowLive e ferramentas complementares

O ecossistema também reúne ferramentas voltadas à gestão de eventos, cronômetros, revisão de conteúdo e simulação de estratégias.

Consulte a [documentação das funcionalidades](features.md) para obter detalhes sobre cada módulo.

---

## Arquitetura e tecnologias

O RoboStage utiliza uma stack moderna de desenvolvimento web, com organização baseada no Next.js App Router.

| Tecnologia | Responsabilidade |
| --- | --- |
| Next.js | Aplicação web, roteamento e recursos de servidor. |
| React 19 | Construção de interfaces por componentes. |
| TypeScript | Tipagem estática e segurança durante o desenvolvimento. |
| Tailwind CSS 4 | Estilização e composição de interfaces. |
| daisyUI | Componentes e temas visuais. |
| Drizzle ORM | Acesso tipado ao banco de dados. |
| Clerk | Autenticação e recursos relacionados à identidade. |
| Recharts | Visualização de dados e gráficos. |
| Framer Motion | Animações de interface. |
| Lenis | Comportamento de rolagem. |

A arquitetura separa responsabilidades de interface, lógica de aplicação, persistência de dados e utilitários compartilhados.

Para entender a organização real dos módulos, os fluxos de execução e as integrações, consulte a [documentação da arquitetura](architecture.md).

---

## APIs e integrações

As APIs permitem que diferentes partes da aplicação troquem dados e executem operações de domínio.

A referência técnica deve documentar, para cada endpoint:

- **Método HTTP e rota:** endereço e operação suportada.
- **Autenticação:** requisitos de identidade e permissões.
- **Parâmetros:** dados de rota, query string e corpo da requisição.
- **Respostas:** estrutura dos dados retornados e códigos HTTP.
- **Erros:** situações de falha e respectivos formatos de resposta.
- **Exemplos:** requisições e respostas representativas.

A documentação das APIs deve refletir a implementação real do projeto, incluindo as regras de validação, autorização e persistência.

**Consulte:** [Referência das APIs](API.md).

---

## Modelo de desenvolvimento

O desenvolvimento do RoboStage segue o fluxo habitual de um projeto colaborativo hospedado no GitHub.

1. **Interface:** componentes React e páginas da aplicação.
2. **Lógica de aplicação:** validação, regras de negócio e operações de servidor.
3. **Persistência:** modelos e operações de banco de dados.
4. **Integrações:** serviços externos e fontes de dados utilizadas pelos módulos.
5. **Entrega:** alterações versionadas, revisão por pull request e publicação de versões.

Os detalhes de cada camada, bem como os padrões e as convenções efetivamente utilizados, devem ser consultados na [documentação da arquitetura](architecture.md) e no [guia de desenvolvimento](development/setup.md).

---

## Executar localmente

Para contribuir com o código, comece obtendo o repositório:

```bash
git clone https://github.com/ohthias/roboStage.git
cd roboStage
npm install
```

Em seguida, configure as variáveis de ambiente exigidas pelo projeto e execute os scripts disponíveis no `package.json`.

```bash
npm run dev
```

Por padrão, aplicações Next.js iniciadas por esse comando ficam disponíveis em `http://localhost:3000`, salvo configuração diferente.

> **Importante:** `npm install` e `npm run dev` são os passos iniciais. A configuração de autenticação, banco de dados e outros serviços depende das variáveis e dos recursos exigidos pela versão atual do projeto.

Consulte [Instalação e configuração](development/setup.md) antes de iniciar o ambiente completo.

---

## Contribuir com o projeto

O RoboStage é um projeto independente, desenvolvido a partir de necessidades reais da comunidade de robótica.

Você pode contribuir por meio de:

- Correção de erros e melhorias de desempenho.
- Desenvolvimento de funcionalidades.
- Melhorias de acessibilidade e experiência de uso.
- Documentação técnica e exemplos de integração.
- Testes, sugestões e relatos de problemas.

Antes de enviar alterações, consulte o [Guia de Contribuição](https://github.com/ohthias/roboStage/blob/main/.github/CONTRIBUTING.md) e o [Código de Conduta](https://github.com/ohthias/roboStage/blob/main/.github/CODE-OF-CONDUCT.md).

---

## Projeto em evolução

O RoboStage evolui continuamente conforme as necessidades das equipes, os resultados dos testes e as contribuições da comunidade.

- [Código-fonte](https://github.com/ohthias/roboStage)
- [Issues abertas](https://github.com/ohthias/roboStage/issues)
- [Pull requests](https://github.com/ohthias/roboStage/pulls)
- [Versões publicadas](https://github.com/ohthias/roboStage/releases)
- [Histórico de alterações](https://github.com/ohthias/roboStage/blob/main/.github/CHANGELOG.md)

---

<div align="center">

**RoboStage**

Documentação técnica do ecossistema.

[robostage.com.br](https://www.robostage.com.br/) · [GitHub](https://github.com/ohthias/roboStage)

</div>
