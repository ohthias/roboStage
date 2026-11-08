<div align="center">

# 🤖 RoboStage

**Plataforma web gratuita para equipes de robótica da FIRST® LEGO® League (FLL) e da Olimpíada Brasileira de Robótica (OBR).**

Planeje estratégias, registre testes, colete telemetria do robô, documente a temporada e organize a equipe em um só lugar.

*Free, open-source web platform for FIRST® LEGO® League and OBR robotics teams: strategy, testing, live robot telemetry, documentation and team management.*

[**🌐 Acessar a plataforma**](https://www.robostage.com.br/) · [Documentação](https://www.docs.robostage.com.br/) · [Changelog](.github/CHANGELOG.md) · [Reportar bug](https://github.com/ohthias/roboStage/issues) · [Contribuir](.github/CONTRIBUTING.md)

![Version](https://img.shields.io/badge/version-v2026.8-informational)
![License](https://img.shields.io/badge/license-MIT-blue)
![GitHub stars](https://img.shields.io/github/stars/ohthias/roboStage?style=social)
![Last commit](https://img.shields.io/github/last-commit/ohthias/roboStage)
![Next.js](https://img.shields.io/badge/Next.js_16-000000?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)

<!-- Adicione aqui um print ou GIF da plataforma, ex.: ![RoboStage](.github/assets/preview.png) -->

</div>


## Por que o RoboStage?

Equipes de robótica costumam espalhar o trabalho da temporada entre planilhas, cadernos, grupos de mensagem e a memória de quem estava no treino. O RoboStage junta tudo:

- **Testes viram dados** — cada execução fica registrada, com gráficos, médias e comparação entre treinos.
- **O robô fala com o navegador** — telemetria ao vivo de Arduino e LEGO (Pybricks), sem instalar nada.
- **A equipe se organiza** — documentos, tarefas, calendário, escalas e sessões de treino conectados.

100% web, gratuito e de código aberto. Nasceu dentro de uma equipe de robótica e é construído com a comunidade.

## Ferramentas

| Ferramenta | Para que serve |
| --- | --- |
| 📖 **Stagebook** | Documentos, pastas, equipes, permissões, histórico de versões |
| 🧪 **LabTest** | Registro de runs, rounds da FLL e da OBR Resgate, calibração (PID, giroscópio) e painel de análise com exportação CSV |
| 📡 **Anatix** | Telemetria em tempo real de sensores, motores e PID via USB ou Bluetooth ([lib Arduino](https://github.com/ohthias/Anatix_C) · [lib Pybricks](https://www.robostage.com.br/fll/anatix)) |
| 🏁 **Treinos e Escala** | Sessões com presença, resumo automático e escala de quem pilota, faz estratégia e apresenta |
| ⚙️ **QuickBrick Studio** | Caderno do robô, visualização 3D (BrickLink Studio), estratégias de mesa, mapas de calor, SWOT |
| 📋 **Kanban** e 📅 **Calendário** | Tarefas, prazos, treinos e competições com etiquetas e marcos compartilhados |
| 💡 **ThinkLab**| Projeto de Inovação: brainstorming, Ishikawa, 5W2H, personas |
| 🏗️ **ArenaBuilder** | Montagem de arenas da OBR com mais de 30 tipos de ladrilho |
| 🦈 **Sharks Simulator** | Simulação de trajetórias com waypoints e missões no tapete |
| 🎥 **ShowLive** | Gestão de torneios: rodadas, rankings e exibição de resultados |
| 🎓 **Recall**, ⏱️ **Timers**, ✅ **Checklists**, 📰 **NECTA** | Revisão com flashcards, cronômetros, checklists de partida e conteúdo da comunidade |

## Competições suportadas

- **FIRST® LEGO® League** — Challenge, Future Edition e Explore. Temporadas BIOGLOW™ (2026/27), UNEARTHED™, SUBMERGED℠ e MASTERPIECE℠.
- **Olimpíada Brasileira de Robótica** — pontuador, Round OBR, OBR Resgate, ArenaBuilder e a biblioteca **Bastidores**.

A arquitetura de ligas permite adicionar novas competições.

## Novidades da v2026.8

- **Sessões de treino** com presença, testes vinculados e resumo comparado à sessão anterior
- **Escala de funções** por rodada, com notificação aos escalados
- **Anatix para LEGO** com Pybricks (SPIKE Prime, SPIKE Essential, Robot Inventor, Powered Up)
- **Painel do LabTest** personalizável, com análise da FLL missão a missão
- **Feed de atividade**, histórico de versões e lixeira nas páginas

[Ver o changelog completo →](.github/CHANGELOG.md)

## Como usar

1. Acesse [robostage.com.br](https://www.robostage.com.br/)
2. Escolha [FLL](https://www.robostage.com.br/fll) ou [OBR](https://www.robostage.com.br/obr)
3. Crie sua conta e escolha o perfil: Competidor, Mentor técnico, Entusiasta ou Organizador

Para o Anatix, use um navegador com Web Serial, Web Bluetooth e WebUSB (Chrome ou Edge).

## Rodando localmente

```bash
git clone https://github.com/ohthias/roboStage.git
cd roboStage
npm install
npm run db:migrate
npm run dev
```

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 4 + DaisyUI · Drizzle ORM · Clerk · Cloudflare R2 · Lexical · Recharts · three.js · Supabase · Vitest + PGlite

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Ambiente de desenvolvimento |
| `npm test` | Testes (Vitest + PGlite) |
| `npm run db:migrate` | Migrações do banco (Drizzle) |
| `npm run data:mission-images` | Regenera imagens das missões após editar `missions.json` |
| `npm run perf:first-load` | Mede o JS de primeira carga (build local) |
| `npm run perf:lighthouse` | Mediana das métricas do Lighthouse (build local) |

<details>
<summary>Variáveis de ambiente do NECTA (opcionais)</summary>

| Variável | Uso |
| --- | --- |
| `NEWS_SUPABASE_URL` | URL do projeto Supabase com a tabela `news` |
| `NEWS_SUPABASE_ANON_KEY` | Chave pública para leitura das notícias |
| `NEWS_REVALIDATE_SECRET` | Autoriza o NECTA a atualizar o cache do site |

Sem as duas primeiras, o site funciona normalmente, mas sem as publicações do NECTA.

</details>

## Contribuindo

Toda ajuda é bem-vinda: relatar bugs, sugerir funcionalidades, melhorar textos e acessibilidade, testar ou enviar código.

- [Guia de Contribuição](.github/CONTRIBUTING.md) · [Código de Conduta](.github/CODE-OF-CONDUCT.md) · [Issues](https://github.com/ohthias/roboStage/issues) · [Pull Requests](https://github.com/ohthias/roboStage/pulls)

**Se o RoboStage ajuda sua equipe, deixe uma ⭐ no repositório e apresente o projeto para outras equipes.** Isso ajuda mais gente a encontrá-lo.

## Créditos

Desenvolvido por [Matheus Gabriel (@ohthias)](https://github.com/ohthias), com feedback e testes da comunidade de robótica.

Ícones: Flaticon, Freepik, Lucide · Ilustrações: Freepik, Storyset · Imagens: Unsplash, FIRST Inspire · Peças 3D: LDraw Parts Library · Interface: DaisyUI · [Licenças de terceiros](.github/LICENSES.md)

## Contato

[robostage.com.br](https://www.robostage.com.br/) · [Instagram @robo.stage](https://www.instagram.com/robo.stage) · [robostage.dev@gmail.com](mailto:robostage.dev@gmail.com)

---

<div align="center">

Licença [MIT](LICENSE) · FIRST® e LEGO® são marcas registradas de seus respectivos proprietários; o RoboStage é um projeto independente.

</div>