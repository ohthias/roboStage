<div align="center">

<img src="https://www.robostage.com.br/images/logos/Icone.png" width="90" alt="RoboStage" />

# RoboStage

**O palco onde a robótica acontece.**
Plataforma para gestão de competições de robótica — equipes, torneios, rankings, transmissões ao vivo e temporadas educacionais.

[🌐 Acessar a plataforma](https://www.robostage.com.br/) • [📦 Releases](https://github.com/ohthias/roboStage/releases) • [🐞 Reportar problema](https://github.com/ohthias/roboStage/issues) • [📰 Changelog](https://www.robostage.com.br/changelog)

![Status](https://img.shields.io/badge/status-active-brightgreen.svg)
![Version](https://img.shields.io/badge/version-v5.1.0-informational)
![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS_4-38B2AC?logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

</div>

## Sobre o projeto

O RoboStage nasceu de uma necessidade real dentro de uma equipe de robótica: um lugar único para documentar testes, organizar estratégias e acompanhar o progresso ao longo da temporada. O que começou como o **ShowLive**, um hub para microeventos da FLL. Ele cresceu até se tornar um ecossistema completo, mantido por uma única pessoa com apoio ativo da comunidade de robótica.

Hoje a plataforma cobre toda a jornada de uma equipe: do planejamento inicial da temporada no QuickBrick Studio até a análise de resultados no LabTest — e a gestão de torneios inteiros no ShowLive.

A plataforma é **gratuita**, com todas as funcionalidades liberadas sem custo, e é focada atualmente na **FIRST LEGO League Challenge (FLLC)**, com suporte a **FIRST Tech Challenge (FTC)** e à **Olimpíada Brasileira de Robótica (OBR)** planejado para o futuro.

> [!IMPORTANT]
> A plataforma está passando por modernização, e parte dos recursos está temporariamente desativada.

## Para quem é o RoboStage

| Perfil | O que encontra na plataforma |
|---|---|
| 🧩 **Equipes iniciantes** | Aprendem estratégia de missões e documentação sem se perder |
| 🧑‍🏫 **Técnicos e mentores** | Centralizam treinos, testes e análises de desempenho da equipe |
| 🏆 **Equipes avançadas** | Validam consistência de pontuação e evoluem estratégias com dados |
| 🎤 **Organizadores e árbitros** | Criam e gerenciam torneios completos, com rankings e transmissões, em minutos |

## Ecossistema de ferramentas

Cada ferramenta cobre um pilar diferente da temporada, do técnico ao administrativo.

### ⚙️ QuickBrick Studio
Workspace estratégico para análise de missões, criação de matrizes táticas, planejamento de runs e documentação técnica do robô desde as primeiras ideias.

### 🧪 LabTest
Ambiente de testes e validação de estratégias, com registro de tentativas de missão, análise de desempenho, feedback visual e acompanhamento da evolução da equipe nos treinos.

### 💡 InnoLab
Hub colaborativo para o Projeto de Inovação: brainstorming, pesquisa, diagramas (5W2H, Ishikawa, fluxogramas), organização de evidências e preparação de apresentações.

### 🎥 ShowLive
Central de gerenciamento de torneios e festivais: controle de rodadas, rankings em tempo real, chamada de equipes e experiências visuais inspiradas em grandes eventos de robótica.

### 🎨 styleLab
Laboratório criativo para identidades visuais, interfaces e painéis personalizados para equipes, torneios e projetos dentro da RoboStage.

### ⏱️ Timers
Cronômetros inteligentes para treinos, apresentações e desafios, com modos dedicados para mesa, pit, inovação e dinâmicas de equipe.

### 🎓 Flash Q&A
Sistema gamificado de flashcards e perguntas estratégicas para treinar entrevistas técnicas e fortalecer o domínio do conteúdo da temporada.

## Temporadas FIRST® LEGO® League suportadas

- BIOGLOW (26/27) - Em breve
- UNEARTHED (25/26)
- SUBMERGED (24/25)
- MASTERPIECE (23/24)

## Como começar

1. Acesse [robostage.com.br](https://www.robostage.com.br/)
2. Escolha sua competição (atualmente **FLL**)
3. Explore as ferramentas da temporada em [robostage.com.br/fll](https://www.robostage.com.br/fll)

Não é necessário instalar nada — o RoboStage é 100% web.

## Stack técnica

- **[Next.js](https://nextjs.org/)** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS 4** + **DaisyUI** para estilo e componentes
- **Recharts** para gráficos de desempenho (LabTest, dashboards)
- **jsPDF** / **jspdf-autotable** / **html2canvas-pro** para exportação de relatórios e documentação em PDF
- **next-mdx-remote** + **react-markdown** + **gray-matter** para conteúdo em MDX (guias, notícias, changelog)
- **Framer Motion** para animações de interface
- **Vercel Analytics** e **Speed Insights** para monitoramento

## Perguntas frequentes

**O RoboStage é gratuito?**
Sim, totalmente gratuito, com todas as funcionalidades disponíveis sem custo.

**Funciona com outras competições além da FLL?**
Hoje o foco é a FLL, mas a expansão para outras competições de robótica (como FTC e OBR) está nos planos.

**Como funciona o LabTest?**
Você cria testes personalizados para avaliar o robô nas missões da temporada, lança os resultados em tempo real e acompanha progresso, taxa de sucesso e missões mais realizadas.

**O InnoLab serve só para diagramas?**
Não. Além de diagramas (5W2H, Ishikawa, fluxogramas), o InnoLab organiza ideias, pesquisas e estratégias para toda a fase de Projeto de Inovação.

Mais dúvidas? Veja o [FAQ completo](https://www.robostage.com.br/fll/help).

## Contribuindo

Sugestões, ideias e feedbacks são bem-vindos — o RoboStage evolui com a experiência real de equipes, técnicos e organizadores da comunidade FLL.

- Abra uma [issue](https://github.com/ohthias/roboStage/issues) para bugs ou sugestões
- Envie um e-mail para **robostage.dev@gmail.com**

## Créditos

- **Desenvolvimento:** [Matheus Gabriel (@ohthias)](https://github.com/ohthias) — fundador e desenvolvedor
- **Ícones:** Flaticon / Freepik
- **Ilustrações:** Freepik / Storyset
- **Imagens:** Unsplash / FIRST Inspire
- **UI:** DaisyUI
- Comunidade FLL (incluindo equipes como VMRT e Sharks FLL) que contribui com feedback contínuo

## Suporte

- 🌐 Site: [robostage.com.br](https://www.robostage.com.br/)
- 💻 GitHub: [github.com/ohthias/roboStage](https://github.com/ohthias/roboStage)
- 🐞 Issues: [github.com/ohthias/roboStage/issues](https://github.com/ohthias/roboStage/issues)
- 📸 Instagram: [@robo.stage](https://www.instagram.com/robo.stage)
- ✉️ E-mail: robostage.dev@gmail.com

---

<div align="center">
<sub>Feito para a comunidade de robótica 🤖</sub>
</div>