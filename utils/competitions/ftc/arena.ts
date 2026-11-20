/**
 * Elementos da arena BIOBUZZ, em português, para a página /ftc/arena.
 * Medidas e regras: Competition Manual, seções 9 e 10 (ftc.game/cm-html).
 */
import { POINTS } from "./biobuzz";

export type ArenaElementKind = "estrutura" | "zona" | "peca";

export type ArenaElement = {
  id: string;
  name: string;
  /** como chamar em português na conversa da equipe */
  alias: string;
  kind: ArenaElementKind;
  summary: string;
  details: string[];
  measures?: string;
  /** como pontuar com este elemento */
  scoring: { label: string; points: string; when: "AUTO" | "TELEOP" | "AUTO e TELEOP" | "Fim da partida" }[];
  rules: { code: string; text: string }[];
};

export const ARENA_ELEMENTS: ArenaElement[] = [
  {
    id: "hive",
    name: "HIVE",
    alias: "Colmeia",
    kind: "estrutura",
    summary:
      "Estrutura no centro do campo com duas colmeias, uma por aliança. Cada HIVE tem duas CELLS e fica sempre em um de dois estados: uma CELL para cima, outra para baixo.",
    details: [
      "A HIVE é biestável: segura a posição até receber POLLEN ou NECTAR suficiente na CELL voltada para cima.",
      "Quando o peso vira a HIVE, a CELL de baixo passa a ser a de cima e o amortecedor que estava solto encosta na estrutura. Isso é um TIP.",
      "Ao virar, os elementos da CELL que desce são despejados no campo: viram munição para o próximo ciclo.",
      "Lançar na CELL que está descendo durante um TIP pode impedir que ele se complete.",
    ],
    measures: "Estrutura de 125,7 × 99 cm, eixo a 111,7 cm do piso. Cada CELL: abertura de 50,8 × 35,6 cm e 30,5 cm de profundidade.",
    scoring: [
      { label: "Cada TIP da sua HIVE", points: `${POINTS.auto.tip} pts`, when: "AUTO e TELEOP" },
      { label: "POLLEN/NECTAR na CELL voltada para cima", points: `${POINTS.teleop.cell} pts cada`, when: "Fim da partida" },
    ],
    rules: [
      { code: "G417", text: "O único jeito de mexer na HIVE é LANÇAR elementos na CELL voltada para cima. Empurrar, puxar ou lançar nas laterais conta como falta." },
      { code: "G409", text: "Não pode pegar ou desviar elementos que caem de uma HIVE virando antes que eles toquem outra coisa." },
    ],
  },
  {
    id: "cell",
    name: "CELL",
    alias: "Alvéolo",
    kind: "estrutura",
    summary:
      "Os dois compartimentos de cada HIVE. A CELL voltada para cima é o alvo dos lançamentos; a de baixo guarda o que caiu no último TIP.",
    details: [
      "No início da partida, cada CELL voltada para cima já tem 3 NECTAR da aliança.",
      "AprilTags (família 36h11, IDs 30 a 45) ficam no fundo das CELLS: servem para o robô mirar no AUTO.",
      "O que sobrar na CELL de cima quando a partida termina vale pontos — não deixe a HIVE vazia nos últimos segundos.",
    ],
    measures: "Abertura de 50,8 cm de largura × 35,6 cm de altura; as duas CELLS ficam a 47,8 cm uma da outra.",
    scoring: [
      { label: "Elemento na CELL de cima", points: `${POINTS.teleop.cell} pts cada`, when: "Fim da partida" },
    ],
    rules: [
      { code: "G417", text: "Lançar na lateral, no fundo ou no topo da CELL tende a ser considerado estratégico (falta grave)." },
    ],
  },
  {
    id: "flower",
    name: "FLOWER",
    alias: "Flor",
    kind: "estrutura",
    summary:
      "Quatro tubos na parede do campo. Elementos entram só por cima. A aliança dona do NECTAR mais alto da sua cor é a dona da FLOWER — e leva os pontos de tudo que está dentro.",
    details: [
      "Começa com 4 POLLEN em cada FLOWER (16 no total). O POLLEN pode ser retirado só pela abertura de baixo: é uma fonte de munição durante a partida.",
      "NECTAR só pode entrar na FLOWER com 1:00 ou menos no relógio.",
      "Dono da FLOWER: quem tem o NECTAR mais alto da sua cor. Os pontos valem mesmo para elementos que o adversário colocou.",
      "Bônus de NECTAR mais baixo: a aliança com o NECTAR mais baixo da sua cor dentro da FLOWER ganha 5 pts.",
    ],
    measures: "Abertura superior de ~10 cm de diâmetro, a 54,6 cm do piso. Saída de baixo com 9 × 9,1 cm.",
    scoring: [
      { label: "Cada POLLEN/NECTAR em FLOWER possuída", points: `${POINTS.teleop.flower} pts`, when: "Fim da partida" },
      { label: "NECTAR mais baixo da sua cor", points: `${POINTS.teleop.bottomNectar} pts por FLOWER`, when: "Fim da partida" },
    ],
    rules: [
      { code: "G410", text: "Robôs só podem colocar NECTAR na FLOWER no último minuto da partida (o relógio do campo é a referência)." },
      { code: "G418", text: "Elementos entram só pelo topo; só POLLEN pode sair, e só por baixo. Forçar NECTAR para fora é falta." },
    ],
  },
  {
    id: "garden",
    name: "GARDEN",
    alias: "Jardim",
    kind: "zona",
    summary:
      "Faixa estreita em cada canto oposto do campo, uma vermelha e uma azul. Tudo que estiver nela pontua para a aliança da cor do GARDEN.",
    details: [
      "Começa com 4 POLLEN em cada GARDEN.",
      "Basta o elemento estar parcialmente dentro da faixa.",
      "Vale para quem é dono da cor, não para quem colocou: cuidado ao empurrar elementos para o GARDEN do adversário.",
    ],
    measures: "58,4 × 5,1 cm.",
    scoring: [{ label: "Cada POLLEN/NECTAR no seu GARDEN", points: `${POINTS.teleop.garden} pt`, when: "Fim da partida" }],
    rules: [],
  },
  {
    id: "loading",
    name: "LOADING ZONE",
    alias: "Zona de carga",
    kind: "zona",
    summary:
      "Área junto à ALLIANCE AREA onde a equipe de piloto coloca NECTAR em campo — e onde o robô estaciona para o PARK.",
    details: [
      "Robô parcialmente dentro do LOADING ZONE ao fim do AUTO ou da partida ganha PARK.",
      "NECTAR entra pela mão da equipe de piloto, sem ferramenta, e precisa tocar o piso do LOADING ZONE antes de qualquer robô.",
      "PARK no AUTO + PARK no fim + LEAVE das duas equipes somam os 16 pts do RP SWARM.",
    ],
    measures: "58,4 × 27,9 cm, um por aliança.",
    scoring: [
      { label: "PARK (por robô)", points: `${POINTS.auto.park} pts`, when: "AUTO e TELEOP" },
    ],
    rules: [
      { code: "G427", text: "NECTAR colocado fora das regras do LOADING ZONE é falta leve por NECTAR." },
      { code: "G426", text: "A equipe só coloca 1 NECTAR a mais por TIP da sua HIVE, ou todo o NECTAR restante com 1:00 ou menos." },
    ],
  },
  {
    id: "alliance",
    name: "ALLIANCE AREA",
    alias: "Área da aliança",
    kind: "zona",
    summary:
      "Onde ficam os pilotos, o técnico e o operador humano de cada aliança. Guarda os 5 NECTAR que entram em campo a cada TIP.",
    details: [
      "Cada aliança começa com 5 NECTAR na ALLIANCE AREA (e 3 na CELL de cima da sua HIVE).",
      "Depois que a partida começa, a equipe de piloto não sai da ALLIANCE AREA.",
      "O técnico (drive coach) não segura controle nem toca em elementos, exceto por segurança.",
    ],
    measures: "246,4 × 137,2 cm.",
    scoring: [],
    rules: [
      { code: "G422", text: "A equipe de piloto fica na ALLIANCE AREA durante toda a partida." },
      { code: "G425", text: "Não tocar robôs, elementos em contato com robô/piso nem os elementos de campo." },
    ],
  },
  {
    id: "pollen",
    name: "POLLEN",
    alias: "Pólen",
    kind: "peca",
    summary: "Bola amarela de ~7 cm. São 40 por partida e servem para as duas alianças — é a munição principal para virar a HIVE.",
    details: [
      "Posição inicial: 4 em cada FLOWER (16), 4 em cada GARDEN (8) e 4 pré-carregados em cada robô (16).",
      "Cada robô precisa começar a partida encostado nos seus 4 POLLEN.",
      "POLLEN que sai do campo volta pelas mãos da equipe de campo, não da equipe de piloto.",
    ],
    measures: "Ø ~7,1 cm.",
    scoring: [
      { label: "Lançado na CELL (provoca TIP)", points: `${POINTS.teleop.tip} pts por TIP`, when: "AUTO e TELEOP" },
      { label: "Em FLOWER possuída", points: `${POINTS.teleop.flower} pts`, when: "Fim da partida" },
      { label: "No seu GARDEN", points: `${POINTS.teleop.garden} pt`, when: "Fim da partida" },
    ],
    rules: [{ code: "G407", text: "Cada robô controla no máximo 4 elementos ao mesmo tempo." }],
  },
  {
    id: "nectar",
    name: "NECTAR",
    alias: "Néctar",
    kind: "peca",
    summary:
      "Bola maior (~9 cm), vermelha ou azul: 8 de cada cor por partida. É o NECTAR que decide quem é dono de cada FLOWER no último minuto.",
    details: [
      "Posição inicial: 3 na CELL de cima de cada HIVE e 5 na ALLIANCE AREA de cada aliança.",
      "Cada TIP da sua HIVE libera mais 1 NECTAR da ALLIANCE AREA; com 1:00 restante, entram todos.",
      "Robôs não podem controlar o NECTAR do adversário.",
    ],
    measures: "Ø ~9,1 cm.",
    scoring: [
      { label: "NECTAR mais alto da sua cor → dona da FLOWER", points: `${POINTS.teleop.flower} pts por elemento dentro`, when: "Fim da partida" },
      { label: "NECTAR mais baixo da sua cor", points: `${POINTS.teleop.bottomNectar} pts`, when: "Fim da partida" },
      { label: "Na CELL de cima", points: `${POINTS.teleop.cell} pts`, when: "Fim da partida" },
    ],
    rules: [
      { code: "G408", text: "Robôs não podem controlar NECTAR da aliança adversária." },
      { code: "G410", text: "NECTAR na FLOWER só no último minuto." },
    ],
  },
];

/** Regras que mais geram falta, em linguagem direta. */
export const KEY_RULES = [
  { code: "G401", title: "AUTO sem mãos", text: "Nos primeiros 30 segundos os pilotos não dão nenhum comando ao robô." },
  { code: "G407", title: "Máximo de 4", text: "Robô controla até 4 elementos ao mesmo tempo. Carregar 6 ou mais até a área de pontuação tende a ser falta grave." },
  { code: "G408", title: "NECTAR alheio", text: "Não controle o NECTAR da outra aliança." },
  { code: "G410", title: "Último minuto", text: "NECTAR entra na FLOWER só com 1:00 ou menos." },
  { code: "G411", title: "Sem bloqueio de elementos", text: "Não impeça o adversário de acessar mais de 8 elementos que ele poderia usar." },
  { code: "G417", title: "HIVE só por lançamento", text: "TIP só vale lançando na CELL de cima. Nada de empurrar a HIVE." },
  { code: "G418", title: "FLOWER pelo topo", text: "Entra por cima, só POLLEN sai, e só por baixo." },
  { code: "G426", title: "NECTAR por TIP", text: "1 NECTAR novo por TIP da sua HIVE, ou todos com 1:00 restante." },
] as const;
