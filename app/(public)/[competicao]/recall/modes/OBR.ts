import { Category, FlashQAMode, Question } from "@/types/FlashQATypes";

/**
 * Perguntas do RECALL para a OBR (modalidade prática — Resgate).
 * Foco: a equipe explicar o próprio robô — como foi construído,
 * como ele percebe a pista, como decide e como a equipe joga o round.
 */
export const OBR_QUESTIONS: Question[] = [
  /* ================= MECÂNICA E ESTRUTURA ================= */
  {
    id: "obr-mec-1",
    category: Category.OBR_MECHANICS,
    text: "Por que vocês escolheram esse tipo de tração (rodas, esteiras, quantidade de motores)?",
    hint: "Fale de aderência, curvas fechadas, rampa e obstáculos.",
  },
  {
    id: "obr-mec-2",
    category: Category.OBR_MECHANICS,
    text: "Onde fica o centro de massa do robô e como isso afeta a subida da rampa e a gangorra?",
    hint: "Peso baixo e centralizado evita tombar e empinar.",
  },
  {
    id: "obr-mec-3",
    category: Category.OBR_MECHANICS,
    text: "Como funciona o mecanismo que pega e entrega as vítimas?",
    hint: "Explique cada etapa: alinhar, capturar, segurar, soltar.",
  },
  {
    id: "obr-mec-4",
    category: Category.OBR_MECHANICS,
    text: "Qual foi a mudança mecânica que mais melhorou o desempenho do robô?",
    hint: "Diga o problema antes, a mudança e o resultado nos testes.",
  },
  {
    id: "obr-mec-5",
    category: Category.OBR_MECHANICS,
    text: "Como o robô passa por lombadas e redutores sem perder a linha?",
    hint: "Altura do chassi, suspensão, posição dos sensores, velocidade.",
  },
  {
    id: "obr-mec-6",
    category: Category.OBR_MECHANICS,
    text: "Como vocês garantem que o robô aguenta batidas e transporte sem soltar peças?",
    hint: "Fixação, travas, cabos presos, checklist antes do round.",
  },
  {
    id: "obr-mec-7",
    category: Category.OBR_MECHANICS,
    text: "Se precisassem trocar uma peça no meio da etapa, quanto tempo levaria? Como planejaram isso?",
    hint: "Manutenção fácil, peças reserva e quem faz o quê.",
  },
  {
    id: "obr-mec-8",
    category: Category.OBR_MECHANICS,
    text: "Por que o robô tem esse tamanho e formato?",
    hint: "Limites do regulamento, curvas, passagens e área de resgate.",
  },

  /* ================= SENSORES ================= */
  {
    id: "obr-sen-1",
    category: Category.OBR_SENSORS,
    text: "Quais sensores o robô usa e qual a função de cada um?",
    hint: "Cor/refletância, distância, giroscópio, toque, encoder…",
  },
  {
    id: "obr-sen-2",
    category: Category.OBR_SENSORS,
    text: "Como vocês calibram os sensores de linha nos 2 minutos antes do round?",
    hint: "Leituras de branco, preto e verde; luz do local; valores salvos.",
  },
  {
    id: "obr-sen-3",
    category: Category.OBR_SENSORS,
    text: "Por que os sensores de linha estão nessa altura e nessa distância entre si?",
    hint: "Leitura estável, detecção de curva e de marcação verde.",
  },
  {
    id: "obr-sen-4",
    category: Category.OBR_SENSORS,
    text: "Como o robô diferencia o verde da marcação do preto da linha?",
    hint: "Canais RGB, limiares, leitura em dois sensores.",
  },
  {
    id: "obr-sen-5",
    category: Category.OBR_SENSORS,
    text: "Como o robô percebe que entrou na área de resgate?",
    hint: "Faixa prateada/refletiva, mudança de leitura, confirmação dupla.",
  },
  {
    id: "obr-sen-6",
    category: Category.OBR_SENSORS,
    text: "Como a luz ambiente pode atrapalhar os sensores e o que fizeram para evitar?",
    hint: "Saia/proteção nos sensores, calibração local, LED próprio.",
  },
  {
    id: "obr-sen-7",
    category: Category.OBR_SENSORS,
    text: "Como o robô identifica uma vítima viva e uma vítima morta?",
    hint: "Prata x preto: refletância, cor ou outro sensor.",
  },
  {
    id: "obr-sen-8",
    category: Category.OBR_SENSORS,
    text: "O que acontece se um sensor dá uma leitura errada? Como o código se protege disso?",
    hint: "Filtros, média de leituras, confirmar antes de agir.",
  },

  /* ================= PROGRAMAÇÃO ================= */
  {
    id: "obr-prog-1",
    category: Category.OBR_PROGRAMMING,
    text: "Expliquem a lógica do seguidor de linha do robô.",
    hint: "Liga/desliga, proporcional ou PID; o que é o erro.",
  },
  {
    id: "obr-prog-2",
    category: Category.OBR_PROGRAMMING,
    text: "Se usam PID, como chegaram nos valores de Kp, Ki e Kd?",
    hint: "Método de ajuste, testes e o que cada termo corrige.",
  },
  {
    id: "obr-prog-3",
    category: Category.OBR_PROGRAMMING,
    text: "Como o código está organizado? Mostrem as partes principais.",
    hint: "Funções, estados, arquivo de configuração, comentários.",
  },
  {
    id: "obr-prog-4",
    category: Category.OBR_PROGRAMMING,
    text: "Como o robô decide para onde virar em uma interseção?",
    hint: "Ler marcações verdes antes da linha preta; meia-volta com dois verdes.",
  },
  {
    id: "obr-prog-5",
    category: Category.OBR_PROGRAMMING,
    text: "O robô usa máquina de estados? Quais são os estados e como ele troca entre eles?",
    hint: "Seguir linha, interseção, obstáculo, resgate, saída.",
  },
  {
    id: "obr-prog-6",
    category: Category.OBR_PROGRAMMING,
    text: "Como vocês testam uma mudança no código antes de levar para a pista inteira?",
    hint: "Teste por trecho, registro de resultados, versão anterior salva.",
  },
  {
    id: "obr-prog-7",
    category: Category.OBR_PROGRAMMING,
    text: "Como a equipe controla as versões do programa?",
    hint: "Git, pastas datadas, backup no pen drive.",
  },
  {
    id: "obr-prog-8",
    category: Category.OBR_PROGRAMMING,
    text: "Qual foi o bug mais difícil que encontraram e como resolveram?",
    hint: "Sintoma, investigação, causa real e correção.",
  },

  /* ================= DESAFIOS DA PISTA ================= */
  {
    id: "obr-pista-1",
    category: Category.OBR_TRACK,
    text: "O que o robô faz quando a linha some em um gap?",
    hint: "Seguir reto por tempo/distância, manter direção com giroscópio.",
  },
  {
    id: "obr-pista-2",
    category: Category.OBR_TRACK,
    text: "Como o robô desvia do obstáculo e volta para a linha?",
    hint: "Detectar, contornar por um lado, procurar a linha de novo.",
  },
  {
    id: "obr-pista-3",
    category: Category.OBR_TRACK,
    text: "Como o robô sobe e desce a rampa sem escorregar ou perder a linha?",
    hint: "Velocidade, torque, peso e leitura na inclinação.",
  },
  {
    id: "obr-pista-4",
    category: Category.OBR_TRACK,
    text: "Como o robô atravessa a gangorra com segurança?",
    hint: "Reduzir velocidade no ponto de virada; centro de massa.",
  },
  {
    id: "obr-pista-5",
    category: Category.OBR_TRACK,
    text: "O que o robô faz em um beco sem saída?",
    hint: "Reconhecer duas marcações verdes e fazer meia-volta.",
  },
  {
    id: "obr-pista-6",
    category: Category.OBR_TRACK,
    text: "Qual desafio da pista o robô mais erra hoje? Qual o plano para melhorar?",
    hint: "Seja honesto: dado do teste, hipótese e próxima ação.",
  },
  {
    id: "obr-pista-7",
    category: Category.OBR_TRACK,
    text: "Como vocês medem a taxa de acerto do robô em cada desafio?",
    hint: "Número de tentativas, acertos e registro (ex.: LabTest).",
  },

  /* ================= ÁREA DE RESGATE ================= */
  {
    id: "obr-res-1",
    category: Category.OBR_RESCUE,
    text: "Qual estratégia o robô usa para procurar vítimas dentro da área de resgate?",
    hint: "Varredura, giro no centro, seguir parede, uso de sensores.",
  },
  {
    id: "obr-res-2",
    category: Category.OBR_RESCUE,
    text: "Como o robô encontra a área de evacuação certa (verde ou vermelha)?",
    hint: "Leitura de cor, posição nos cantos, ordem de busca.",
  },
  {
    id: "obr-res-3",
    category: Category.OBR_RESCUE,
    text: "Em que ordem o robô resgata as vítimas e por quê?",
    hint: "Vivas antes da morta? Pontos, multiplicadores e risco.",
  },
  {
    id: "obr-res-4",
    category: Category.OBR_RESCUE,
    text: "Como o robô sabe que já pegou a vítima e não perdeu no caminho?",
    hint: "Sensor no mecanismo, contagem, confirmação antes de entregar.",
  },
  {
    id: "obr-res-5",
    category: Category.OBR_RESCUE,
    text: "Como o robô encontra a saída da área de resgate depois de entregar as vítimas?",
    hint: "Faixa de saída, seguir parede, memória da entrada.",
  },
  {
    id: "obr-res-6",
    category: Category.OBR_RESCUE,
    text: "O que o robô faz se ficar preso em um canto ou em uma vítima?",
    hint: "Detectar travamento, dar ré, mudar ângulo, tempo limite.",
  },

  /* ================= ESTRATÉGIA DE PROVA ================= */
  {
    id: "obr-est-1",
    category: Category.OBR_STRATEGY,
    text: "Em que situação vocês decidem desistir de um checkpoint?",
    hint: "Custa 1min do round: compare com o risco de novas falhas.",
  },
  {
    id: "obr-est-2",
    category: Category.OBR_STRATEGY,
    text: "O que a equipe faz quando acontece uma falha de progresso?",
    hint: "Quem chama, onde reposicionar, o que checar no robô.",
  },
  {
    id: "obr-est-3",
    category: Category.OBR_STRATEGY,
    text: "Quais partes da pista dão mais pontos para o robô de vocês? Onde focam o treino?",
    hint: "Checkpoints, desafios, resgate e multiplicadores.",
  },
  {
    id: "obr-est-4",
    category: Category.OBR_STRATEGY,
    text: "Como vocês usam os 2 minutos de calibração?",
    hint: "Ordem das tarefas, quem faz cada uma, o que testar na pista.",
  },
  {
    id: "obr-est-5",
    category: Category.OBR_STRATEGY,
    text: "Qual é o papel de cada membro durante o round?",
    hint: "Operador, quem acompanha tempo, quem anota a súmula.",
  },
  {
    id: "obr-est-6",
    category: Category.OBR_STRATEGY,
    text: "O que vocês mudam entre um round e outro?",
    hint: "Ajustes pequenos e testados; nunca mudar tudo de uma vez.",
  },
  {
    id: "obr-est-7",
    category: Category.OBR_STRATEGY,
    text: "Se o robô falhar logo no começo, qual é o plano B?",
    hint: "Programa reserva, pular trecho, priorizar pontos garantidos.",
  },
];

export const OBR_MODE: FlashQAMode = {
  name: "OBR",
  highlight: "Flashcards OBR",
  description:
    "Treine sua equipe para explicar o robô: mecânica, sensores, programação, desafios da pista, resgate e estratégia de prova.",
  sampleQuestion: "Como o robô decide para onde virar em uma interseção?",
  questions: OBR_QUESTIONS,
  categories: [
    Category.ALL,
    Category.OBR_MECHANICS,
    Category.OBR_SENSORS,
    Category.OBR_PROGRAMMING,
    Category.OBR_TRACK,
    Category.OBR_RESCUE,
    Category.OBR_STRATEGY,
  ],
  defaultSettings: {
    category: Category.ALL,
    count: 10,
    timePerCard: 60,
  },
};
