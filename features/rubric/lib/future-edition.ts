// Rubricas FIRST LEGO League — Future Edition
// Fonte: Rubrica do Projeto + Rubrica de Design de Engenharia (©2026 FIRST e o Grupo LEGO)
//
// Cada indicador tem `descriptions: [nível1, nível2, nível3]` (Fase Inicial / Em Desenvolvimento /
// Finalizado). O texto de nível 3 vem literalmente do PDF oficial; os textos de nível 1 e 2 foram
// escritos por mim, seguindo o mesmo padrão de gradação (mínimo → parcial → claro) usado na
// rubrica oficial anterior, já que o PDF novo só traz o enunciado "Finalizado" por linha na
// extração de texto. Vale revisar esses dois níveis contra o PDF visual, se possível.
// Nível 4 (Excedente) não tem texto fixo — é tratado via campo de comentário no IndicatorRow.
//
// `gear` (ícone de engrenagem = conta também para Core Values) também é uma estimativa baseada
// no conteúdo (linhas sobre trabalho em equipe, colaboração e coopetição) — confira visualmente
// no PDF antes de usar em produção.

export type LevelKey = 1 | 2 | 3 | 4;

export const LEVEL_LABELS: Record<LevelKey, string> = {
  1: "Fase Inicial",
  2: "Em Desenvolvimento",
  3: "Finalizado",
  4: "Excedente",
};

export const LEVEL_POINTS: Record<LevelKey, number> = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
};

export interface RubricIndicator {
  id: string;
  gear: boolean; // conta também para a classificação de Core Values
  descriptions: [string, string, string]; // [Fase Inicial, Em Desenvolvimento, Finalizado]
}

export interface RubricCriterion {
  id: string;
  code: string;
  title: string;
  question: string;
  indicators: RubricIndicator[];
}

export interface RubricCategory {
  id: string;
  code: string;
  name: string;
  instructions: string;
  coreValuesNote: string;
  criteria: RubricCriterion[];
}

export const RUBRIC: RubricCategory[] = [
  {
    id: "projeto",
    code: "PI",
    name: "Projeto",
    instructions:
      "As equipes devem preparar uma apresentação de 5 minutos para comunicar o trabalho do seu projeto. Após a apresentação, os avaliadores farão perguntas de esclarecimento. Os avaliadores devem buscar evidências durante a apresentação e nas respostas às perguntas para pontuar a equipe na rubrica. Os avaliadores marcarão uma caixa em cada linha para indicar o nível alcançado pela equipe. Se a equipe for EXCEDENTE em qualquer área, um comentário deve ser escrito no espaço fornecido para aquela linha.",
    coreValuesNote:
      "Os critérios desta página com este estilo de caixa de seleção contam simultaneamente para as classificações dos prêmios Projeto e Core Values. Os Core Values representam 25% da pontuação do Champion's Award da equipe e devem ser demonstrados em todo o seu trabalho e na experiência do evento.",
    criteria: [
      {
        id: "pi-explorar",
        code: "EXPLORAR",
        title: "Explorar",
        question: "Como a equipe pesquisa a trilha do seu projeto?",
        indicators: [
          {
            id: "pi-explorar-1",
            gear: false,
            descriptions: [
              "A equipe explica de forma pouco clara como a pesquisa orientada influenciou a direção do seu projeto",
              "A equipe explica parcialmente como a pesquisa orientada influenciou a direção do seu projeto",
              "A equipe explica claramente como a pesquisa orientada influenciou a direção do seu projeto",
            ],
          },
          {
            id: "pi-explorar-2",
            gear: false,
            descriptions: [
              "A equipe usa poucas ou nenhuma fonte relevante para aprender sobre o tema que selecionou",
              "A equipe usa algumas fontes relevantes para aprender sobre o tema que selecionou",
              "A equipe usa múltiplas fontes relevantes para aprender sobre o tema que selecionou",
            ],
          },
        ],
      },
      {
        id: "pi-idealizar",
        code: "IDEALIZAR",
        title: "Idealizar",
        question: "Quais ideias a equipe gera com base em sua pesquisa?",
        indicators: [
          {
            id: "pi-idealizar-1",
            gear: false,
            descriptions: [
              "A equipe explorou poucas ideias e explica de forma pouco clara o raciocínio da escolha",
              "A equipe explorou algumas ideias e explica parcialmente o raciocínio da escolha",
              "A equipe explorou múltiplas ideias e explica claramente o raciocínio da escolha",
            ],
          },
          {
            id: "pi-idealizar-2",
            gear: false,
            descriptions: [
              "A equipe apresenta evidências mínimas de um processo iterativo para desenvolver e melhorar sua ideia com base em pesquisa ou feedback",
              "A equipe explica parcialmente o processo iterativo para desenvolver e melhorar sua ideia com base em pesquisa ou feedback",
              "A equipe explica claramente o processo iterativo para desenvolver e melhorar sua ideia com base em pesquisa ou feedback",
            ],
          },
          {
            id: "pi-idealizar-3",
            gear: true,
            descriptions: [
              "A equipe apresenta evidências mínimas de abordagem inovadora ou pensamento original em sua ideia de projeto",
              "A equipe explica parcialmente a abordagem inovadora ou o pensamento original em sua ideia de projeto",
              "A equipe explica claramente a abordagem inovadora ou o pensamento original em sua ideia de projeto",
            ],
          },
        ],
      },
      {
        id: "pi-implementar",
        code: "IMPLEMENTAR",
        title: "Implementar",
        question: "Como a ideia da equipe gera um impacto positivo?",
        indicators: [
          {
            id: "pi-implementar-1",
            gear: true,
            descriptions: [
              "A equipe identifica de forma pouco clara os usuários reais e o impacto potencial de sua ideia",
              "A equipe identifica parcialmente os usuários reais e o impacto potencial de sua ideia",
              "A equipe identifica claramente os usuários reais e o impacto potencial de sua ideia",
            ],
          },
          {
            id: "pi-implementar-2",
            gear: false,
            descriptions: [
              "A equipe identifica de forma pouco clara as etapas necessárias para implementar sua ideia",
              "A equipe identifica parcialmente as etapas necessárias para implementar sua ideia",
              "A equipe identifica claramente as etapas necessárias para implementar sua ideia",
            ],
          },
          {
            id: "pi-implementar-3",
            gear: false,
            descriptions: [
              "A equipe considera de forma mínima a viabilidade de sua ideia, incluindo desafios ou compensações",
              "A equipe considera parcialmente a viabilidade de sua ideia, incluindo desafios ou compensações",
              "A equipe considera a viabilidade de sua ideia, incluindo desafios ou compensações",
            ],
          },
        ],
      },
      {
        id: "pi-comunicar",
        code: "COMUNICAR",
        title: "Comunicar",
        question: "Como a equipe comunica o trabalho do seu projeto?",
        indicators: [
          {
            id: "pi-comunicar-1",
            gear: false,
            descriptions: [
              "A equipe fornece recursos visuais, modelos ou protótipos pouco claros para apoiar a apresentação do projeto",
              "A equipe fornece recursos visuais, modelos ou protótipos parcialmente claros para apoiar a apresentação do projeto",
              "A equipe fornece recursos visuais, modelos ou protótipos claros para apoiar a apresentação do projeto",
            ],
          },
          {
            id: "pi-comunicar-2",
            gear: true,
            descriptions: [
              "A equipe explica de forma pouco clara como os membros contribuem para o desenvolvimento do projeto",
              "A equipe explica como alguns membros contribuem de forma significativa para o desenvolvimento do projeto",
              "A equipe explica como todos os membros contribuem de forma significativa para o desenvolvimento do projeto",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "robo",
    code: "DR",
    name: "Design de Engenharia",
    instructions:
      "As equipes devem preparar uma apresentação de 5 minutos para comunicar seu processo de design de engenharia e sua estratégia de jogo. Após a apresentação, os avaliadores farão perguntas de esclarecimento. Os avaliadores devem buscar evidências durante a apresentação e nas respostas às perguntas para pontuar a equipe na rubrica. Os avaliadores marcarão uma caixa em cada linha para indicar o nível alcançado pela equipe. Se a equipe for EXCEDENTE em qualquer área, um comentário deve ser escrito no espaço fornecido para aquela linha.",
    coreValuesNote:
      "Os critérios desta página com este estilo de caixa de seleção contam simultaneamente para as classificações dos prêmios Design de Engenharia e Core Values. Os Core Values representam 25% da pontuação do Champion's Award da equipe e devem ser demonstrados em todo o seu trabalho e na experiência do evento.",
    criteria: [
      {
        id: "dr-identificar",
        code: "IDENTIFICAR",
        title: "Identificar",
        question: "Como a equipe pratica e identifica áreas de melhoria?",
        indicators: [
          {
            id: "dr-identificar-1",
            gear: false,
            descriptions: [
              "A equipe explica de forma pouco clara o uso das missões orientadas e dos recursos de construção e programação",
              "A equipe explica parcialmente o uso das missões orientadas e dos recursos de construção e programação",
              "A equipe explica o uso das missões orientadas e dos recursos de construção e programação",
            ],
          },
          {
            id: "dr-identificar-2",
            gear: true,
            descriptions: [
              "A equipe identifica de forma mínima áreas de melhoria nas ferramentas fornecidas para embasar os requisitos de design",
              "A equipe identifica parcialmente áreas de melhoria nas ferramentas fornecidas para embasar os requisitos de design",
              "A equipe identifica áreas de melhoria nas ferramentas fornecidas para embasar os requisitos de design",
            ],
          },
        ],
      },
      {
        id: "dr-projetar-criar",
        code: "PROJETAR E CRIAR",
        title: "Projetar e Criar",
        question:
          "Quais ideias a equipe gera para melhorar suas ferramentas e estratégia?",
        indicators: [
          {
            id: "dr-identificar-1",
            gear: false,
            descriptions: [
              "A equipe desenvolve uma estratégia de missão pouco clara que orienta as decisões de design",
              "A equipe desenvolve uma estratégia de missão parcialmente clara que orienta as decisões de design",
              "A equipe desenvolve uma estratégia de missão clara que orienta as decisões de design",
            ],
          },
          {
            id: "dr-projetar-criar-2",
            gear: false,
            descriptions: [
              "As soluções da equipe incluem poucas ou nenhuma construção mecânica personalizada que apoie sua estratégia de missão",
              "As soluções da equipe incluem algumas construções mecânicas personalizadas que apoiam sua estratégia de missão",
              "As soluções da equipe incluem construções mecânicas personalizadas que apoiam sua estratégia de missão",
            ],
          },
          {
            id: "dr-projetar-criar-3",
            gear: false,
            descriptions: [
              "As soluções da equipe incluem pouca ou nenhuma programação personalizada que apoie sua estratégia de missão",
              "As soluções da equipe incluem programação parcialmente personalizada que apoia sua estratégia de missão",
              "As soluções da equipe incluem programação personalizada que apoia sua estratégia de missão",
            ],
          }
        ],
      },
      {
        id: "dr-iterar",
        code: "ITERAR",
        title: "Iterar",
        question: "Como a equipe testa e melhora seus designs?",
        indicators: [
          {
            id: "dr-iterar-1",
            gear: false,
            descriptions: [
              "A equipe explora poucas opções de design para cada ferramenta de função antes de escolher uma para testar",
              "A equipe explora algumas opções de design para cada ferramenta de função antes de escolher uma para testar",
              "A equipe explora múltiplas opções de design para cada ferramenta de função antes de escolher uma para testar",
            ],
          },
          {
            id: "dr-iterar-2",
            gear: false,
            descriptions: [
              "A equipe segue um processo de teste pouco claro e documenta minimamente os resultados",
              "A equipe segue um processo de teste parcialmente claro e documenta parcialmente os resultados",
              "A equipe segue um processo de teste claro e documenta os resultados",
            ],
          },
          {
            id: "dr-iterar-3",
            gear: true,
            descriptions: [
              "A equipe usa minimamente os resultados dos testes para melhorar seus designs",
              "A equipe usa parcialmente os resultados dos testes para melhorar seus designs",
              "A equipe usa os resultados dos testes para melhorar seus designs",
            ],
          },
        ],
      },
      {
        id: "dr-comunicar",
        code: "COMUNICAR",
        title: "Comunicar",
        question:
          "Como a equipe apresenta seu processo de design e sua estratégia?",
        indicators: [
          {
            id: "dr-comunicar-1",
            gear: true,
            descriptions: [
              "A equipe explica de forma pouco clara a estratégia cooperativa de jogo entre as funções dos jogadores e com outra equipe",
              "A equipe explica parcialmente a estratégia cooperativa de jogo entre as funções dos jogadores e com outra equipe",
              "A equipe explica claramente a estratégia cooperativa de jogo entre as funções dos jogadores e com outra equipe",
            ],
          },
          {
            id: "dr-comunicar-2",
            gear: true,
            descriptions: [
              "A equipe explica de forma pouco clara como os membros contribuem para o processo de design de engenharia",
              "A equipe explica como alguns membros contribuem de forma significativa para o processo de design de engenharia",
              "A equipe explica como todos os membros contribuem de forma significativa para o processo de design de engenharia",
            ],
          },
        ],
      },
    ],
  },
];
