// ---------------------------------------------------------------------------
// Testes prontos do CalibraBot para a OBR Resgate. Mesmo formato dos presets
// do kit Ciência e IA (`kit-ia.ts`), com campos calculados (`calc`).
// Os campos são MEDIÇÕES DA EQUIPE em cada execução.
// ---------------------------------------------------------------------------

import type { KitPreset } from "./kit-ia";

export const OBR_LEAGUE = "obr";

const COLORS = ["preto", "branco", "verde", "prata", "vermelho"] as const;
const COLOR_LABEL: Record<(typeof COLORS)[number], string> = {
  preto: "Preto",
  branco: "Branco",
  verde: "Verde",
  prata: "Prata (fita)",
  vermelho: "Vermelho",
};

export const OBR_PRESETS: KitPreset[] = [
  {
    id: "obr-cor",
    label: "Sensores de cor e refletância",
    componente: "Sensor de cor / refletância",
    resumo: "Leitura de cada cor do tapete sob a luz do teste e a margem que separa as cores.",
    relevantePara: "Seguir linha · verde · prata · vermelho",
    params: [
      { nome: "luz", rotulo: "Iluminação", descricao: "Condição de luz no teste.", tipo: "select", opcoes: ["Ambiente", "Forte", "Fraca", "Luz direta", "Sombra"], padrao: true },
      { nome: "sensor", rotulo: "Sensor", descricao: "Qual sensor foi medido (ex.: esquerdo).", tipo: "text", padrao: false },
      ...COLORS.map((c) => ({
        nome: `leitura_${c}`,
        rotulo: `Leitura no ${COLOR_LABEL[c].toLowerCase()}`,
        descricao: `Valor médio lido sobre o ${COLOR_LABEL[c].toLowerCase()}.`,
        tipo: "number" as const,
        padrao: true,
      })),
      {
        nome: "margem_cores",
        rotulo: "Margem entre cores",
        descricao: "Menor diferença entre as leituras das cores. Quanto maior, mais seguro separar.",
        tipo: "number",
        padrao: true,
        calc: `mingap:${COLORS.map((c) => `leitura_${c}`).join(",")}`,
      },
      { nome: "confusoes", rotulo: "Leituras confundidas", descricao: "Vezes em que uma cor foi lida como outra.", tipo: "number", padrao: true },
    ],
  },
  {
    id: "obr-seguidor",
    label: "Seguidor de linha",
    componente: "Controle PID",
    resumo: "Oscilação, velocidade e saídas de linha por curva para comparar valores de Kp, Ki e Kd.",
    relevantePara: "Percurso · curvas · interseções",
    params: [
      { nome: "kp", rotulo: "Kp", descricao: "Ganho proporcional usado.", tipo: "number", padrao: true },
      { nome: "ki", rotulo: "Ki", descricao: "Ganho integral usado.", tipo: "number", padrao: true },
      { nome: "kd", rotulo: "Kd", descricao: "Ganho derivativo usado.", tipo: "number", padrao: true },
      { nome: "velocidade", rotulo: "Velocidade base", descricao: "Potência ou velocidade base dos motores.", tipo: "number", unidade: "%", padrao: true },
      { nome: "oscilacao", rotulo: "Oscilação", descricao: "Quanto o robô balança em volta da linha (amplitude).", tipo: "number", unidade: "mm", padrao: true },
      { nome: "tempo_volta", rotulo: "Tempo do trecho", descricao: "Tempo para percorrer o trecho de teste.", tipo: "duration", unidade: "s", padrao: true },
      { nome: "curvas", rotulo: "Curvas no trecho", descricao: "Quantas curvas o trecho tem.", tipo: "number", padrao: true },
      { nome: "saidas_linha", rotulo: "Saídas de linha", descricao: "Vezes em que perdeu a linha.", tipo: "number", padrao: true },
      { nome: "saidas_por_curva", rotulo: "Saídas por curva", descricao: "Saídas de linha ÷ curvas.", tipo: "number", padrao: true, calc: "per:saidas_linha/curvas" },
    ],
  },
  {
    id: "obr-verde",
    label: "Detecção de verde nas interseções",
    componente: "Sensor de cor",
    resumo: "Taxa de acerto da decisão em cada tipo de interseção.",
    relevantePara: "Interseções · becos sem saída",
    params: [
      ...(
        [
          ["t", "em T com verde"],
          ["cruz", "em cruz (+) com verde"],
          ["sem", "sem verde (seguir reto)"],
          ["beco", "beco sem saída (verde duplo)"],
        ] as const
      ).flatMap(([id, label]) => [
        { nome: `tent_${id}`, rotulo: `Tentativas · ${label}`, descricao: `Vezes que o robô passou por interseção ${label}.`, tipo: "number" as const, padrao: true },
        { nome: `acerto_${id}`, rotulo: `Acertos · ${label}`, descricao: "Vezes em que tomou a decisão certa.", tipo: "number" as const, padrao: true },
        { nome: `taxa_${id}`, rotulo: `Taxa · ${label}`, descricao: "Acertos ÷ tentativas.", tipo: "number" as const, unidade: "%", padrao: true, calc: `ratio:acerto_${id}/tent_${id}` },
      ]),
    ],
  },
  {
    id: "obr-rampa",
    label: "Rampa e gangorra",
    componente: "Giroscópio / acelerômetro",
    resumo: "Inclinação medida e se o robô escorrega, trava ou passa direto.",
    relevantePara: "Rampas · gangorras",
    params: [
      { nome: "obstaculo", rotulo: "Obstáculo", descricao: "O que foi testado.", tipo: "select", opcoes: ["Rampa (subida)", "Rampa (descida)", "Gangorra"], padrao: true },
      { nome: "pitch_max", rotulo: "Inclinação máxima (pitch)", descricao: "Maior inclinação lida.", tipo: "number", unidade: "°", padrao: true },
      { nome: "velocidade", rotulo: "Velocidade", descricao: "Potência usada no trecho.", tipo: "number", unidade: "%", padrao: true },
      { nome: "tempo", rotulo: "Tempo no obstáculo", descricao: "Tempo para vencer o obstáculo.", tipo: "duration", unidade: "s", padrao: true },
      { nome: "escorregou", rotulo: "Escorregou", descricao: "Perdeu tração ou voltou.", tipo: "boolean", padrao: true },
      { nome: "travou", rotulo: "Travou", descricao: "Ficou preso e precisou de ajuda.", tipo: "boolean", padrao: true },
      { nome: "passou", rotulo: "Passou", descricao: "Venceu o obstáculo sem intervenção.", tipo: "boolean", padrao: true },
    ],
  },
  {
    id: "obr-vitimas",
    label: "Detecção de vítimas",
    componente: "Sensor de distância / câmera",
    resumo: "Alcance e taxa de acerto do sensor ou da câmera que procura as vítimas.",
    relevantePara: "Sala de resgate",
    params: [
      { nome: "sensor", rotulo: "Sensor", descricao: "Tipo usado na busca.", tipo: "select", opcoes: ["Ultrassom", "Infravermelho", "Câmera", "Laser (ToF)", "Outro"], padrao: true },
      { nome: "vitima", rotulo: "Vítima procurada", descricao: "Que vítima estava na sala.", tipo: "select", opcoes: ["Viva (prata)", "Morta (preta)", "Ambas"], padrao: true },
      { nome: "alcance", rotulo: "Alcance de detecção", descricao: "Maior distância em que detectou.", tipo: "number", unidade: "cm", padrao: true },
      { nome: "tentativas", rotulo: "Tentativas", descricao: "Buscas feitas no teste.", tipo: "number", padrao: true },
      { nome: "deteccoes", rotulo: "Detecções corretas", descricao: "Achou a vítima certa.", tipo: "number", padrao: true },
      { nome: "falsos_positivos", rotulo: "Falsos positivos", descricao: "Apontou vítima onde não havia.", tipo: "number", padrao: true },
      { nome: "taxa", rotulo: "Taxa de acerto", descricao: "Detecções ÷ tentativas.", tipo: "number", unidade: "%", padrao: true, calc: "ratio:deteccoes/tentativas" },
    ],
  },
];

export function getObrPreset(id: string | undefined | null): KitPreset | undefined {
  return OBR_PRESETS.find((preset) => preset.id === id);
}
