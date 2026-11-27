export type LevelKey = 1 | 2 | 3 | 4;

export const LEVEL_LABELS: Record<LevelKey, string> = {
  1: "Fase Inicial",
  2: "Em Desenvolvimento",
  3: "Finalizado",
  4: "Excedente",
};

export interface RubricIndicator {
  id: string;
  /** Conta em dobro para a classificação de Core Values (ícone de engrenagem no PDF oficial) */
  gear: boolean;
  /** Descrições fixas para os níveis 1, 2 e 3. O nível 4 (Excedente) é sempre um comentário livre. */
  descriptions: [string, string, string];
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
  criteria: RubricCriterion[];
}

export const RUBRIC: RubricCategory[] = [
  {
    id: "projeto",
    code: "PI",
    name: "Projeto de Inovação",
    instructions:
      'Esta rubrica deve ser preenchida de acordo com a apresentação do Projeto de Inovação. É obrigatório assinalar uma caixa em cada linha para indicar o nível alcançado pela equipe. Se a equipe tiver um desempenho EXCEDENTE, é necessário um breve comentário na coluna "excedente".',
    criteria: [
      {
        id: "pi-identificacao",
        code: "IDENTIFICAÇÃO",
        title: "Identificação",
        question: "A equipe tinha um problema claramente definido e bem pesquisado.",
        indicators: [
          {
            id: "pi-identificacao-1",
            gear: false,
            descriptions: [
              "Definição pouco clara do problema",
              "Definição parcialmente clara do problema",
              "Definição clara do problema",
            ],
          },
          {
            id: "pi-identificacao-2",
            gear: true,
            descriptions: [
              "Evidências mínimas de pesquisa",
              "Evidências parciais de pesquisa de uma ou mais fontes",
              "Pesquisa clara e detalhada de uma variedade de fontes",
            ],
          },
        ],
      },
      {
        id: "pi-design",
        code: "DESIGN",
        title: "Design",
        question:
          "A equipe trabalhou em conjunto na criação de um plano de projeto e no desenvolvimento de suas ideias.",
        indicators: [
          {
            id: "pi-design-1",
            gear: false,
            descriptions: [
              "Evidências mínimas de um plano de projeto eficaz",
              "Evidências parciais de um plano de projeto eficaz",
              "Evidências claras de um plano de projeto eficaz",
            ],
          },
          {
            id: "pi-design-2",
            gear: true,
            descriptions: [
              "Evidências mínimas de que o processo de desenvolvimento envolveu todos os membros da equipe",
              "Evidências parciais de que o processo de desenvolvimento envolveu todos os membros da equipe",
              "Evidências claras de que o processo de desenvolvimento envolveu todos os membros da equipe",
            ],
          },
        ],
      },
      {
        id: "pi-criacao",
        code: "CRIAÇÃO",
        title: "Criação",
        question:
          "A equipe desenvolveu uma ideia original ou baseou-se em uma ideia existente com um protótipo/desenho para representar sua solução.",
        indicators: [
          {
            id: "pi-criacao-1",
            gear: true,
            descriptions: [
              "Explicação mínima com relação à inovação na solução",
              "Explicação simples com relação à inovação na solução",
              "Explicação detalhada com relação à inovação na solução",
            ],
          },
          {
            id: "pi-criacao-2",
            gear: false,
            descriptions: [
              "Protótipo/desenho pouco claro para representar a solução",
              "Protótipo/desenho simples para representar a solução",
              "Protótipo/desenho detalhado para representar a solução",
            ],
          },
        ],
      },
      {
        id: "pi-iteracao",
        code: "ITERAÇÃO",
        title: "Iteração",
        question: "A equipe compartilhou suas ideias, coletou feedback e incluiu melhorias em sua solução.",
        indicators: [
          {
            id: "pi-iteracao-1",
            gear: false,
            descriptions: [
              "Compartilhamento mínimo da solução com outras pessoas",
              "Solução compartilhada com pelo menos uma pessoa/grupo",
              "Solução compartilhada com várias pessoas/grupos",
            ],
          },
          {
            id: "pi-iteracao-2",
            gear: false,
            descriptions: [
              "Evidências mínimas de melhorias com base em feedbacks",
              "Evidências parciais de melhorias com base em feedbacks",
              "Evidências claras de melhorias com base em feedbacks",
            ],
          },
        ],
      },
      {
        id: "pi-comunicacao",
        code: "COMUNICAÇÃO",
        title: "Comunicação",
        question:
          "Os alunos fizeram uma apresentação eficaz de sua solução, seu impacto sobre outras pessoas e comemoraram o progresso da equipe.",
        indicators: [
          {
            id: "pi-comunicacao-1",
            gear: true,
            descriptions: [
              "Explicação pouco clara da solução e seu impacto potencial sobre outras pessoas",
              "Explicação parcialmente clara da solução e seu impacto potencial sobre outras pessoas",
              "Explicação clara da solução e seu impacto potencial sobre outras pessoas",
            ],
          },
          {
            id: "pi-comunicacao-2",
            gear: true,
            descriptions: [
              "A apresentação demonstra orgulho ou entusiasmo mínimo com o trabalho da equipe",
              "A apresentação demonstra orgulho ou entusiasmo parcial com o trabalho da equipe",
              "A apresentação claramente demonstra orgulho ou entusiasmo com o trabalho da equipe",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "robo",
    code: "DR",
    name: "Design do Robô",
    instructions:
      'Esta rubrica deve ser preenchida de acordo com a explicação do Design do Robô. É obrigatório assinalar uma caixa em cada linha para indicar o nível alcançado pela equipe. Se a equipe tiver um desempenho EXCEDENTE, é necessário um breve comentário na coluna "excedente".',
    criteria: [
      {
        id: "dr-identificacao",
        code: "IDENTIFICAÇÃO",
        title: "Identificação",
        question:
          "A equipe definiu quais missões iria tentar realizar, explorou recursos de construção e codificação e buscou orientação conforme necessário.",
        indicators: [
          {
            id: "dr-identificacao-1",
            gear: false,
            descriptions: [
              "Evidências mínimas de estratégia de missão",
              "Evidências parciais de estratégia de missão",
              "Evidências claras de estratégia de missão",
            ],
          },
          {
            id: "dr-identificacao-2",
            gear: true,
            descriptions: [
              "Uso mínimo de recursos de construção ou codificação",
              "Uso de alguns recursos de construção ou codificação",
              "Uso claro de recursos de construção ou codificação para apoiar na estratégia de missão",
            ],
          },
        ],
      },
      {
        id: "dr-design",
        code: "DESIGN",
        title: "Design",
        question:
          "Os membros da equipe trabalharam colaborativamente em seus designs e desenvolveram as habilidades de construção e codificação necessárias.",
        indicators: [
          {
            id: "dr-design-1",
            gear: true,
            descriptions: [
              "Evidências mínimas de que todos os membros da equipe contribuíram com ideias",
              "Evidências parciais de que todos os membros da equipe contribuíram com ideias",
              "Evidências claras de que todos os membros da equipe contribuíram com ideias",
            ],
          },
          {
            id: "dr-design-2",
            gear: false,
            descriptions: [
              "Evidências mínimas de habilidades de construção e codificação em todos os membros da equipe",
              "Evidências parciais de habilidades de construção e codificação em todos os membros da equipe",
              "Evidências claras de habilidades de construção e codificação em todos os membros da equipe",
            ],
          },
        ],
      },
      {
        id: "dr-criacao",
        code: "CRIAÇÃO",
        title: "Criação",
        question:
          "A equipe desenvolveu designs originais ou melhorou os existentes de acordo com sua estratégia de missão.",
        indicators: [
          {
            id: "dr-criacao-1",
            gear: false,
            descriptions: [
              "Explicação pouco clara dos acessórios e de seu propósito",
              "Explicação simples dos acessórios e de seu propósito",
              "Explicação clara de acessórios inovadores e de seu propósito",
            ],
          },
          {
            id: "dr-criacao-2",
            gear: false,
            descriptions: [
              "Explicação pouco clara do uso de códigos e/ou sensores",
              "Explicação simples do uso de códigos e/ou sensores",
              "Explicação clara do uso inovador de códigos e/ou sensores",
            ],
          },
        ],
      },
      {
        id: "dr-iteracao",
        code: "ITERAÇÃO",
        title: "Iteração",
        question:
          "A equipe testou seus robôs e códigos repetidamente para identificar áreas de melhoria e incorporou as descobertas em suas soluções.",
        indicators: [
          {
            id: "dr-iteracao-1",
            gear: false,
            descriptions: [
              "Evidências mínimas de testes do robô e do código",
              "Evidências parciais de testes do robô e do código",
              "Evidências claras de testes repetidos do robô e do código",
            ],
          },
          {
            id: "dr-iteracao-2",
            gear: true,
            descriptions: [
              "Evidências mínimas de melhorias com base em testes",
              "Evidências parciais de melhorias com base em testes",
              "Evidências claras de melhorias com base em testes",
            ],
          },
        ],
      },
      {
        id: "dr-comunicacao",
        code: "COMUNICAÇÃO",
        title: "Comunicação",
        question:
          "A equipe explicou de forma eficaz o que aprendeu com o processo de design do robô e comemorou seu progresso.",
        indicators: [
          {
            id: "dr-comunicacao-1",
            gear: true,
            descriptions: [
              "Explicação pouco clara do processo e lições aprendidas",
              "Explicação simples do processo e lições aprendidas",
              "Explicação detalhada do processo e lições aprendidas",
            ],
          },
          {
            id: "dr-comunicacao-2",
            gear: true,
            descriptions: [
              "A equipe demonstra orgulho ou entusiasmo mínimo pelo seu trabalho",
              "A equipe demonstra orgulho ou entusiasmo parcial pelo seu trabalho",
              "A equipe claramente demonstra orgulho ou entusiasmo pelo seu trabalho",
            ],
          },
        ],
      },
    ],
  },
];

export const LEVEL_THRESHOLDS: {
  min: number;
  label: string;
  hint: string;
  tone: "error" | "warning" | "info" | "success";
}[] = [
  { min: 0, label: "Fase Inicial", hint: "Reforce pesquisa, colaboração e evidências concretas antes da próxima etapa.", tone: "error" },
  { min: 1.75, label: "Em Desenvolvimento", hint: "Fundamentos presentes; faltam profundidade e consistência entre os indicadores.", tone: "warning" },
  { min: 2.5, label: "Finalizado", hint: "Desempenho sólido e consistente na maioria dos indicadores avaliados.", tone: "info" },
  { min: 3.25, label: "Excedente", hint: "Desempenho notável, com evidências claras acima do esperado.", tone: "success" },
];

/** Perguntas-guia e categorias usadas na folha de Feedback da Sessão de Avaliação */
export interface FeedbackSection {
  id: string;
  title: string;
  question: string;
}

export const FEEDBACK_SECTIONS: FeedbackSection[] = [
  {
    id: "core-values",
    title: "Core Values",
    question:
      "De que maneira os alunos demonstraram trabalho em equipe, descoberta, inclusão, inovação, impacto e diversão em seu trabalho?",
  },
  {
    id: "projeto",
    title: "Projeto de Inovação",
    question: "Como a equipe identificou e abordou a solução de um problema relacionado ao tema da temporada?",
  },
  {
    id: "robo",
    title: "Design do Robô",
    question:
      "Como a equipe abordou a solução para as missões do desafio do robô usando construção e codificação?",
  },
];

export interface AwardOption {
  id: string;
  name: string;
  description: string;
}

export const AWARD_OPTIONS: AwardOption[] = [
  {
    id: "revelacao",
    name: "Prêmio Revelação",
    description:
      "Equipe que teve um progresso significativo em sua confiança e capacidade em, pelo menos, uma das áreas centrais da FIRST LEGO League.",
  },
  {
    id: "estrela-em-ascensao",
    name: "Prêmio Estrela em Ascensão",
    description: "Equipe na qual os juízes veem potencial para alcançar grandes resultados no futuro.",
  },
  {
    id: "motivacao",
    name: "Prêmio Motivação",
    description:
      "Equipe que incorpora a cultura da FIRST LEGO League através de team-building, espírito de equipe e entusiasmo.",
  },
];
