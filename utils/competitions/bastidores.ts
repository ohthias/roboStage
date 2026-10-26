// Materiais da página /obr/bastidores.
// Para incluir um material, adicione um item em `materials` com link conferido.

export type Topic = "Lógica" | "Programação" | "Arduino" | "OBR";
export type Kind = "Livro" | "Vídeo" | "Curso" | "Site" | "Ferramenta";

export type Material = {
  title: string;
  kind: Kind;
  topics: Topic[];
  by: string;
  description: string;
  url: string;
  lang: "PT" | "EN";
  free?: boolean;
  meta?: string; // editora, ano, nº de vídeos etc.
};

export const materials: Material[] = [
  // ------------------------------------------------------------ Livros
  {
    title: "Lógica de Programação",
    kind: "Livro",
    topics: ["Lógica", "Programação"],
    by: "André Forbellone e Henri Eberspächer",
    description:
      "Clássico das faculdades brasileiras: construção de algoritmos e estruturas de dados, com aplicações em Python na 4ª edição.",
    url: "https://www.martinsfontespaulista.com.br/logica-de-programacao-985497/p",
    lang: "PT",
    meta: "Bookman · 4ª ed. · 2022",
  },
  {
    title: "Lógica de programação com Portugol",
    kind: "Livro",
    topics: ["Lógica"],
    by: "Joice Barbosa Mendes e Rafael da Silva Muniz",
    description:
      "Mais de 80 exemplos e 55 exercícios com gabarito em Portugol, com vídeos complementares em cada capítulo.",
    url: "https://casadocodigo.com.br/products/livro-portugol",
    lang: "PT",
    meta: "Casa do Código · 2022",
  },
  {
    title: "Primeiros Passos com o Arduino",
    kind: "Livro",
    topics: ["Arduino"],
    by: "Massimo Banzi e Michael Shiloh",
    description:
      "Escrito por um dos criadores do Arduino. Uma introdução curta à placa, aos circuitos e aos primeiros sketches.",
    url: "https://www.skoob.com.br/book/521084",
    lang: "PT",
    meta: "Novatec · 2ª ed. · 2015",
  },
  {
    title: "Arduino Básico",
    kind: "Livro",
    topics: ["Arduino", "Programação"],
    by: "Michael McRoberts",
    description:
      "Projetos guiados do LED piscando a motores e sensores, explicando o código e o circuito de cada um.",
    url: "https://www.skoob.com.br/book/521086",
    lang: "PT",
    meta: "Novatec · 2ª ed. · 2015",
  },
  {
    title: "Programação com Arduino: começando com sketches",
    kind: "Livro",
    topics: ["Arduino", "Programação"],
    by: "Simon Monk",
    description:
      "Foca na linguagem: variáveis, funções, vetores e bibliotecas, com exemplos curtos para rodar na placa.",
    url: "https://books.google.com/books?vid=ISBN9788582604465",
    lang: "PT",
    meta: "Bookman · 2ª ed. · 2017",
  },
  {
    title: "Arduino: guia para colocar suas ideias em prática",
    kind: "Livro",
    topics: ["Arduino"],
    by: "Fernando Bryan Frizzarin",
    description:
      "LEDs, botões, sensores de luz, comunicação serial, servos e motores DC, em montagens pequenas e código simples.",
    url: "https://www.casadocodigo.com.br/products/livro-arduino",
    lang: "PT",
    meta: "Casa do Código",
  },

  // ------------------------------------------------------- Vídeos e cursos
  {
    title: "Curso de Algoritmos e Lógica de Programação",
    kind: "Vídeo",
    topics: ["Lógica"],
    by: "Gustavo Guanabara · Curso em Vídeo",
    description:
      "Playlist gratuita para quem nunca programou: algoritmos, variáveis, condições e repetições, passo a passo.",
    url: "https://www.youtube.com/playlist?list=PLHz_AreHm4dmSj0MHol_aoNYCSGFqvfXV",
    lang: "PT",
    free: true,
    meta: "17 vídeos",
  },
  {
    title: "Arduino Lessons",
    kind: "Vídeo",
    topics: ["Arduino", "Programação"],
    by: "Paul McWhorter",
    description:
      "Série longa de aulas de Arduino para iniciantes, com circuito e código explicados em cada lição.",
    url: "https://toptechboy.com/",
    lang: "EN",
    free: true,
  },
  {
    title: "CC50",
    kind: "Curso",
    topics: ["Programação", "Lógica"],
    by: "Harvard CS50 · tradução da Fundação Estudar",
    description:
      "Versão em português do curso de introdução à ciência da computação de Harvard, com exercícios e fórum.",
    url: "https://materiais.estudarfora.org.br/cc50/",
    lang: "PT",
    free: true,
  },

  // ------------------------------------------------- Sites e ferramentas
  {
    title: "Arduino Docs",
    kind: "Site",
    topics: ["Arduino", "Programação"],
    by: "Arduino (oficial)",
    description:
      "Referência da linguagem, bibliotecas, exemplos prontos e tutoriais oficiais para todas as placas.",
    url: "https://docs.arduino.cc/",
    lang: "EN",
    free: true,
  },
  {
    title: "Arduino Project Hub",
    kind: "Site",
    topics: ["Arduino"],
    by: "Comunidade Arduino",
    description:
      "Projetos publicados pela comunidade com tutoriais, lista de peças e código para estudar e adaptar.",
    url: "https://projecthub.arduino.cc/",
    lang: "EN",
    free: true,
  },
  {
    title: "Wokwi",
    kind: "Ferramenta",
    topics: ["Arduino", "Programação"],
    by: "Simulador online",
    description:
      "Simule Arduino Uno, Mega, Nano e ESP32 com sensores, displays e motores direto no navegador.",
    url: "https://wokwi.com/",
    lang: "EN",
  },
  {
    title: "Tinkercad Circuits",
    kind: "Ferramenta",
    topics: ["Arduino", "Lógica"],
    by: "Autodesk",
    description:
      "Monte circuitos e programe um Arduino virtual por blocos ou texto antes de mexer na placa de verdade.",
    url: "https://www.tinkercad.com/circuits",
    lang: "PT",
    free: true,
  },
  {
    title: "Portugol Studio",
    kind: "Ferramenta",
    topics: ["Lógica"],
    by: "LITE · UNIVALI",
    description:
      "Ambiente para escrever e executar algoritmos em português. Software livre, licença GNU 3.",
    url: "https://univali-lite.github.io/Portugol-Studio/",
    lang: "PT",
    free: true,
  },
  {
    title: "Guia de estudos da OBR Teórica",
    kind: "Site",
    topics: ["OBR", "Lógica"],
    by: "NOIC",
    description:
      "Conteúdo por nível, cronogramas de estudo, provas anteriores e técnicas de resolução para a modalidade teórica.",
    url: "https://noic.com.br/wp-content/uploads/2025/06/Guia-Completo-de-Estudos-OBR-Modalidade-Teorica-1.pdf",
    lang: "PT",
    free: true,
    meta: "PDF",
  },
  {
    title: "Documentos e manuais da OBR",
    kind: "Site",
    topics: ["OBR"],
    by: "OBR (oficial)",
    description:
      "Regras e manuais de cada modalidade. Leia antes de montar a estratégia do robô.",
    url: "https://obr.robocup.org.br/documentos-e-manuais/",
    lang: "PT",
    free: true,
  },
];

// Trilha sugerida: um primeiro material para cada etapa.
export const path = [
  {
    step: "Lógica",
    title: "Pense como o robô",
    text: "Antes da placa, aprenda a quebrar um problema em passos: condições, repetições e variáveis.",
    pick: "Curso de Algoritmos e Lógica de Programação",
  },
  {
    step: "Programação",
    title: "Escreva o código",
    text: "Passe do português para C/C++ do Arduino: funções, vetores e organização do código.",
    pick: "Programação com Arduino: começando com sketches",
  },
  {
    step: "Arduino",
    title: "Leve para a pista",
    text: "Sensores, motores e testes. Simule antes, depois monte e meça com o Anatix.",
    pick: "Wokwi",
  },
] as const;

export const SUGGEST_MATERIAL_URL =
  "https://github.com/ohthias/roboStage/issues/new?title=Bastidores%3A%20sugest%C3%A3o%20de%20material";
