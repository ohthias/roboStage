// Conteúdo dos guias para iniciantes da FLL (/fll/begins e /fll/explore).
import {
  BadgeInfo,
  Blocks,
  BookCopy,
  BookOpen,
  CalendarDays,
  Clock,
  Cuboid,
  Gamepad2,
  Globe2,
  Lightbulb,
  Megaphone,
  MessageSquare,
  NotebookPen,
  NotepadText,
  PlayCircle,
  Presentation,
  School2,
  Sparkles,
  Trophy,
  Wrench,
  Youtube,
} from "lucide-react";
import type { BeginnerGuideData } from "@/components/competicoes/FLL/guides/BeginnerGuide";

const FIRST_TEXT =
  "A FIRST® é uma organização internacional sem fins lucrativos dedicada a preparar jovens para o futuro por meio de programas de robótica em equipe. A FLL é um dos programas mantidos por ela, ao lado da FIRST Tech Challenge e da FIRST Robotics Competition.";

const YT_CHANNEL = {
  icon: Youtube,
  title: "Canal oficial da FIRST LEGO League",
  text: "Reúne vídeos, teasers e materiais publicados diretamente pela FIRST ao longo da temporada.",
  href: "https://www.youtube.com/@FIRSTLEGOLeagueofficial",
  badge: "Canal",
};

const VIDEOS_NOTE =
  "Os materiais em vídeo podem variar por temporada. A página oficial \"Game & Season\" da FIRST concentra os conteúdos mais recentes para equipes iniciantes.";

/* ============================================================ CHALLENGE */

export const challengeGuide: BeginnerGuideData = {
  slug: "begins",
  program: "FLL Challenge",
  title: "Guia para equipes",
  highlight: "estreantes.",
  intro:
    "A FIRST® LEGO® League Challenge é o torneio de robótica educacional da FIRST® para estudantes de 9 a 15/16 anos, com robôs LEGO® e tecnologia LEGO® Education. No Brasil, o programa é operado pelo SESI. Este guia reúne o essencial para começar a temporada com organização e confiança.",
  notice:
    "Esta página é um guia independente, produzido com base em materiais públicos da FIRST, da FLL Brasil e do SESI. Consulte sempre os documentos e regras da temporada vigente para confirmar detalhes atualizados.",
  facts: [
    { label: "Idade", value: "9 a 15/16 anos", detail: "a faixa pode variar por país" },
    { label: "Equipe", value: "2 a 10", detail: "competidores, com 2 técnicos adultos" },
    { label: "Robô", value: "3 × 2:30", detail: "rounds no tapete, vale a melhor" },
    { label: "No Brasil", value: "SESI", detail: "torneios regionais e nacional" },
  ],
  pillarsTitle: {
    title: "Quatro frentes",
    highlight: "avaliadas.",
    description: "No torneio, a equipe é avaliada dentro e fora do tapete.",
  },
  pillars: [
    { icon: Gamepad2, title: "Desafio do Robô", text: "Executar missões autônomas em um tapete, em 3 rounds de 2 minutos e meio, valendo a melhor pontuação.", tone: "primary" },
    { icon: Wrench, title: "Design do Robô", text: "Apresentar aos juízes, em 5 minutos, o processo de engenharia por trás da construção e da programação do robô.", tone: "secondary" },
    { icon: Lightbulb, title: "Projeto de Inovação", text: "Pesquisar um problema real ligado ao tema da temporada e propor uma solução bem documentada.", tone: "accent" },
    { icon: Sparkles, title: "Core Values", text: "Demonstrar descoberta, inovação, impacto, inclusão, trabalho em equipe e diversão durante todo o torneio.", tone: "primary" },
  ],
  needs: [
    { title: "Time completo", text: "De 2 a 10 competidores (o ideal é ter ao menos 4), liderados por 2 técnicos adultos." },
    { title: "Documentação", text: "Engineering Notebook atualizado com testes, falhas, ideias e decisões da equipe." },
    { title: "Materiais da temporada", text: "Tapete oficial, kit de missões e o robô programável (SPIKE Prime, na temporada atual)." },
    { title: "Comunicação", text: "A equipe precisa saber explicar decisões com clareza nas sessões de 5 minutos com os juízes." },
  ],
  concepts: [
    { icon: Globe2, title: "O que é a FIRST", text: FIRST_TEXT },
    {
      icon: School2,
      title: "O que é a FLL Challenge",
      text: "A trilha da FIRST LEGO League voltada a estudantes de 9 a 15/16 anos. As equipes constroem e programam robôs LEGO®, pesquisam um problema real e apresentam tudo a juízes seguindo os Core Values do programa.",
    },
    {
      icon: Megaphone,
      title: "O que são as temporadas",
      text: "Cada temporada traz um tema novo, missões inéditas no tapete e um novo desafio de pesquisa para o Projeto de Inovação. No Brasil, os torneios regionais costumam acontecer entre outubro e fevereiro.",
    },
  ],
  prep: {
    title: "Como pensar",
    highlight: "para a competição.",
    description: "O foco inicial deve ser consistência e evolução.",
    items: [
      { title: "No tapete (Desafio do Robô)", text: "Treine repetição e priorização das missões mais viáveis: só a melhor pontuação entre os 3 rounds conta." },
      { title: "Na entrevista", text: "Fale com objetividade, mostre o processo de engenharia e destaque o aprendizado da equipe em 5 minutos." },
      { title: "No Projeto de Inovação", text: "Explique o problema real escolhido, a pesquisa feita e por que a solução proposta faz sentido." },
      { title: "Nos Core Values", text: "Cooperação, inclusão e competição amigável são avaliadas em todos os momentos do torneio, não só na apresentação." },
    ],
  },
  videos: [
    { icon: PlayCircle, title: "Vídeo de abertura da temporada", text: "Apresenta o tema do ano e ajuda a equipe a entender a proposta do desafio antes de começar a construir.", href: "https://youtu.be/MPKxFy3qV2M?si=juq26un0qs3NUJiq", badge: "Oficial" },
    { icon: Gamepad2, title: "Missões do Desafio do Robô", text: "Explica o tapete, as missões e a lógica de pontuação usada nos 3 rounds de 2 minutos e meio.", href: "https://youtu.be/uhZZ8O1StiQ?si=rcSIQigmdcpuArnp", badge: "Vídeo" },
    { icon: Trophy, title: "Preparação para o torneio", text: "Para entender a rotina do dia de competição e as sessões com os juízes.", href: "https://youtu.be/9TMFtLKYT6o?si=ItD8kVLK4X-Pjrhs", badge: "Vídeo" },
    YT_CHANNEL,
  ],
  videosNote: VIDEOS_NOTE,
  channels: [
    { icon: Globe2, title: "SESI: operador da FLL Challenge", text: "Responsável pela operação nacional da FLL Challenge, incluindo inscrições, torneios regionais e o Festival SESI de Robótica.", href: "https://www.sesi.portaldaindustria.com.br/para-voce/robotica/first-lego-league-challenge" },
    { icon: BookOpen, title: "Portal brasileiro da FLL", text: "Informações dos três programas da FLL no Brasil (Discover, Explore e Challenge), materiais e contatos.", href: "https://www.firstlegoleague.com.br/first-lego-league-challenge" },
    { icon: CalendarDays, title: "Calendário de eventos", text: "Datas dos torneios regionais, nacionais e demais eventos da operação brasileira.", href: "https://www.firstlegoleague.com.br/calend%C3%A1rio" },
  ],
  checklist: [
    "Montar a equipe (2 a 10 competidores, com pelo menos 2 técnicos adultos).",
    "Adquirir o tapete e os materiais oficiais da temporada.",
    "Ler os documentos e regras da temporada vigente.",
    "Primeiros testes no tapete e nas missões do robô.",
    "Registro contínuo do processo no Engineering Notebook.",
    "Definir o problema real do Projeto de Inovação.",
    "Treinar a apresentação de 5 minutos para os juízes.",
    "Inscrever a equipe em um torneio regional.",
  ],
  links: [
    { label: "FIRST LEGO League Challenge no Brasil (SESI)", href: "https://www.sesi.portaldaindustria.com.br/para-voce/robotica/first-lego-league-challenge" },
    { label: "Portal brasileiro da FLL", href: "https://www.firstlegoleague.com.br/first-lego-league-challenge" },
    { label: "Programa oficial FIRST LEGO League (EUA)", href: "https://www.firstinspires.org/programs/fll/" },
    { label: "Como começar uma equipe", href: "https://www.firstinspires.org/programs/fll/get-started" },
    { label: "Jogo e temporada oficiais", href: "https://www.firstinspires.org/programs/fll/game-and-season" },
  ],
  tools: [
    { icon: Trophy, tag: "PONTUAÇÃO", title: "Pontuador", description: "Simule rounds de 2:30 e veja quanto cada missão vale.", href: "/fll/score/bioglow", tone: "primary" },
    { icon: BookCopy, tag: "MISSÕES", title: "Guia de Missões", description: "As missões da temporada explicadas uma a uma, com dicas e mecanismos.", href: "/fll/docs/missions-guide", tone: "secondary" },
    { icon: Cuboid, tag: "ESTRATÉGIA", title: "QuickBrick Studio", description: "Desenhe trajetórias no tapete e organize as saídas do robô.", href: "/fll/quickbrick", tone: "accent" },
    { icon: MessageSquare, tag: "ENTREVISTA", title: "Recall", description: "Treine as perguntas dos juízes com tempo cronometrado.", href: "/fll/recall", tone: "secondary" },
    { icon: NotepadText, tag: "AVALIAÇÃO", title: "Rubricas", description: "Veja como a equipe será avaliada e faça uma autoavaliação.", href: "/fll/rubric", tone: "primary" },
    { icon: Clock, tag: "TEMPO", title: "Timers", description: "Round do Robô e Sala de Avaliação com os tempos oficiais.", href: "/fll/timers", tone: "accent" },
  ],
  faq: [
    { q: "Quem pode participar da FIRST LEGO League Challenge?", a: "Equipes com estudantes de 9 a 15/16 anos (a faixa pode variar por país), formadas por 2 a 10 competidores (o recomendado é ter ao menos 4) e lideradas por 2 técnicos adultos. Cada competidor só pode integrar uma equipe da FLLC por temporada." },
    { q: "Quais são as categorias avaliadas no torneio?", a: "São quatro: Desafio do Robô (missões autônomas no tapete), Design do Robô (processo de engenharia por trás da construção e programação), Projeto de Inovação (solução para um problema real ligado ao tema) e Core Values (colaboração, inclusão e espírito esportivo em todos os momentos)." },
    { q: "Qual é o primeiro passo para uma equipe iniciante?", a: "Montar a equipe, adquirir o tapete e os materiais da temporada e ler com atenção os documentos oficiais. Depois disso, partir para os primeiros testes do robô e para a escolha do tema do Projeto de Inovação." },
    { q: "A equipe precisa dominar tudo antes de competir?", a: "Não. O programa foi pensado para equipes evoluírem ao longo da temporada. Times novos costumam crescer mais rápido quando começam simples, registram os aprendizados no notebook e melhoram por ciclos de teste." },
    { q: "Como funciona a apresentação para os juízes?", a: "O Design do Robô e o Projeto de Inovação são apresentados em sessões de 5 minutos cada. Já o Desafio do Robô acontece em 3 rounds de 2 minutos e meio no tapete, valendo a melhor pontuação entre as tentativas." },
    { q: "Como avançar para o nacional e o mundial?", a: "A equipe se inscreve em um torneio regional. As melhores colocadas de cada regional avançam para a etapa nacional e, a partir dela, as melhores podem representar o país em competições internacionais." },
  ],
  next: {
    kicker: "TEM CRIANÇAS MAIS NOVAS?",
    title: "Conheça também a FLL Explore.",
    text: "Para crianças de 6 a 10 anos, sem competição: a temporada termina em um evento de celebração.",
    href: "/fll/explore",
    label: "Guia da Explore",
  },
};

/* ============================================================== EXPLORE */

export const exploreGuide: BeginnerGuideData = {
  slug: "explore",
  program: "FLL Explore",
  title: "Guia para",
  highlight: "exploradores.",
  intro:
    "A FIRST® LEGO® League Explore é o programa de robótica educacional da FIRST® para crianças de 6 a 10 anos, com peças LEGO® e o kit LEGO® Education SPIKE Essential. Diferente do Challenge, o Explore é não competitivo: a temporada termina em um evento de celebração, não em um ranking. No Brasil, é operado pela Educacional.",
  notice:
    "Esta página é um guia independente, produzido com base em materiais públicos da FIRST e da FLL Brasil. Consulte sempre os documentos e o Guia de Encontro de Equipes da temporada vigente para confirmar detalhes atualizados.",
  facts: [
    { label: "Idade", value: "6 a 10 anos", detail: "não precisam ter a mesma idade" },
    { label: "Equipe", value: "até 6", detail: "crianças, com um adulto responsável" },
    { label: "Temporada", value: "12 sessões", detail: "guiadas pelo Caderno de Engenharia" },
    { label: "Formato", value: "Celebração", detail: "sem pontuação nem ranking" },
  ],
  pillarsTitle: {
    title: "O que a equipe",
    highlight: "produz.",
    description: "Construir, registrar, mostrar e conviver: as quatro partes da temporada.",
  },
  pillars: [
    { icon: Blocks, title: "Modelo de Exploração", text: "Construir e motorizar um modelo com peças LEGO® e o kit SPIKE Essential, inspirado no tema da temporada.", tone: "primary" },
    { icon: NotebookPen, title: "Caderno de Engenharia", text: "Registrar o processo em 12 sessões guiadas, do primeiro rascunho até a versão final do modelo.", tone: "secondary" },
    { icon: Presentation, title: "Show Me Poster", text: "Montar um cartaz que conta a jornada da equipe para compartilhar no evento de celebração.", tone: "accent" },
    { icon: Sparkles, title: "Core Values", text: "Praticar descoberta, inovação, impacto, inclusão, trabalho em equipe e diversão em cada encontro.", tone: "primary" },
  ],
  needs: [
    { title: "Time completo", text: "Até 6 crianças de 6 a 10 anos, guiadas por um adulto responsável. Não precisam ter a mesma idade." },
    { title: "Documentação", text: "Caderno de Engenharia preenchido a cada sessão, com desenhos, ideias e o passo a passo do modelo." },
    { title: "Materiais da temporada", text: "Conjunto LEGO® Explore da temporada e o kit LEGO® Education SPIKE Essential para motorizar o modelo." },
    { title: "Guia do adulto responsável", text: "O Guia de Encontro de Equipes traz o roteiro de cada uma das 12 sessões, sem exigir experiência prévia em robótica." },
  ],
  concepts: [
    { icon: Globe2, title: "O que é a FIRST", text: FIRST_TEXT },
    {
      icon: School2,
      title: "O que é a FLL Explore",
      text: "A trilha de entrada da FLL, para crianças de 6 a 10 anos. As equipes constroem um modelo com peças LEGO®, aprendem noções básicas de engenharia e programação e compartilham o que aprenderam em um evento de celebração, sem competição.",
    },
    {
      icon: Megaphone,
      title: "O que são as temporadas",
      text: "O Explore segue o mesmo tema anual do Challenge, em versão mais simples: a equipe explora uma parte do assunto e constrói um modelo que representa suas descobertas, em vez de missões pontuadas.",
    },
  ],
  prep: {
    title: "Como se preparar para",
    highlight: "a celebração.",
    description: "Não é uma disputa: é uma conversa sobre o que a equipe aprendeu.",
    items: [
      { title: "No modelo", text: "Cada criança deve saber explicar uma parte do modelo. Não precisa ser só o adulto falando." },
      { title: "No Show Me Poster", text: "Mostre o processo, não só o resultado: rascunhos, tentativas e o que mudou pelo caminho valem muito." },
      { title: "Na conversa com avaliadores", text: "Treine respostas curtas e à vontade. O objetivo é compartilhar a experiência, não decorar um discurso." },
      { title: "Nos Core Values", text: "Cooperação, respeito e diversão são celebrados durante todo o evento, do início ao fim." },
    ],
  },
  videos: [
    { icon: PlayCircle, title: "Vídeo de abertura da temporada", text: "Apresenta o tema do ano para as crianças e ajuda a turma a entender por onde começar a explorar.", href: "https://www.firstinspires.org/programs/fll/game-and-season", badge: "Oficial" },
    { icon: Blocks, title: "Como montar o Modelo de Exploração", text: "Referência para entender a lógica de construir e motorizar o modelo com o SPIKE Essential.", href: "https://education.lego.com/en-us/products/lego-education-spike-essential-set/45345", badge: "Kit" },
    { icon: BadgeInfo, title: "Como funciona um evento de celebração", text: "Como é a conversa da equipe com os avaliadores: sem pontuação, sem eliminação, só compartilhar o que aprenderam.", href: "https://www.firstinspires.org/programs/fll/get-started", badge: "Dica" },
    YT_CHANNEL,
  ],
  videosNote: VIDEOS_NOTE,
  channels: [
    { icon: Globe2, title: "Educacional: operador do Explore", text: "A Educacional (Positivo Tecnologia) opera a FLL Explore e a Discover no Brasil, incluindo materiais e inscrições.", href: "https://www.firstlegoleague.com.br/first-lego-league-explore" },
    { icon: BookOpen, title: "Portal brasileiro da FLL", text: "Informações dos três programas da FLL no Brasil (Discover, Explore e Challenge), materiais e contatos.", href: "https://www.firstlegoleague.com.br" },
    { icon: CalendarDays, title: "Calendário de eventos", text: "Datas de eventos locais, regionais e nacionais da operação brasileira.", href: "https://www.firstlegoleague.com.br/calend%C3%A1rio" },
  ],
  checklist: [
    "Montar a equipe (até 6 alunos de 6 a 10 anos) e o adulto responsável.",
    "Adquirir o conjunto LEGO® da temporada e o kit SPIKE Essential.",
    "Ler o Guia de Encontro de Equipes com o professor/treinador.",
    "Iniciar as 12 sessões do Caderno de Engenharia.",
    "Construir e motorizar o Modelo de Exploração.",
    "Montar o Show Me Poster com o registro da jornada.",
    "Treinar a conversa com os avaliadores para o evento.",
    "Inscrever a equipe em um evento de celebração.",
  ],
  links: [
    { label: "FIRST LEGO League Explore no Brasil", href: "https://www.firstlegoleague.com.br/first-lego-league-explore" },
    { label: "Inscrições Explore", href: "https://www.firstlegoleague.com.br/inscri%C3%A7%C3%B5es-explore" },
    { label: "Materiais da temporada", href: "https://www.firstlegoleague.com.br/materiais" },
    { label: "Como começar (FIRST, em inglês)", href: "https://www.firstinspires.org/programs/fll/get-started" },
  ],
  tools: [
    { icon: Clock, tag: "ENCONTROS", title: "Timers", description: "Timer ajustável para organizar o tempo de cada sessão da equipe.", href: "/fll/timers", tone: "primary" },
    { icon: BookOpen, tag: "DOCUMENTOS", title: "Documentações", description: "Documentos das temporadas da liga reunidos em um só lugar.", href: "/fll/docs", tone: "secondary" },
    { icon: Globe2, tag: "COMUNIDADE", title: "Roboticar", description: "Iniciativas de outras equipes e dados da robótica no Brasil.", href: "/roboticar", tone: "accent" },
  ],
  faq: [
    { q: "Quem pode participar da FIRST LEGO League Explore?", a: "Crianças de 6 a 10 anos, em equipes de até 6 integrantes, guiadas por um adulto responsável (professor, treinador ou familiar). A equipe pode nascer em uma escola, em atividades extracurriculares ou como um grupo independente de amigos." },
    { q: "O Explore é uma competição?", a: "Não. O Explore é um programa não competitivo: não há pontuação, ranking ou eliminação. A temporada termina em um evento de celebração, onde avaliadores conversam com cada equipe sobre o modelo e o Show Me Poster, e todas as equipes são reconhecidas." },
    { q: "O que a equipe precisa produzir na temporada?", a: "Um Modelo de Exploração feito com peças LEGO® e motorizado com o kit SPIKE Essential, além de um Show Me Poster, cartaz onde a equipe registra o processo, as descobertas e o aprendizado ao longo da temporada." },
    { q: "Quanto tempo dura a temporada?", a: "O programa é organizado em 12 sessões guiadas pelo Caderno de Engenharia e pelo Guia de Encontro de Equipes. A maioria dos grupos se reúne uma vez por semana, mas o ritmo é flexível e definido pela própria equipe." },
    { q: "Como funciona a conversa com os avaliadores?", a: "É uma conversa, não uma apresentação formal: a equipe mostra o modelo, o Show Me Poster e conta o que pesquisou e aprendeu. O objetivo é celebrar o processo, não julgar quem foi melhor." },
    { q: "Qual a diferença entre Explore e Challenge?", a: "O Explore (6 a 10 anos) é não competitivo e foca em construir um modelo e documentar o aprendizado. O Challenge (9 a 15/16 anos) é competitivo, com robôs autônomos programados para cumprir missões pontuadas em um tapete." },
  ],
  next: {
    kicker: "PRÓXIMO PASSO",
    title: "Quando crescer, vem a FLL Challenge.",
    text: "Robôs autônomos, missões no tapete e torneios: veja o guia para equipes estreantes do Challenge.",
    href: "/fll/begins",
    label: "Guia da Challenge",
  },
};
