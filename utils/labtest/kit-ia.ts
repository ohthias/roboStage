// ---------------------------------------------------------------------------
// Testes prontos do CalibraBot para o kit LEGO Education Ciência da Computação
// e IA — usado pela FLL Future Edition (temporada 2026/27).
//
// Só entram componentes que a LEGO documenta publicamente para o kit: motor
// duplo, motor simples, sensor de cor, controle e a programação pelo Coding
// Canvas (inclui os sistemas de IA que os alunos montam e testam). Os campos
// são MEDIÇÕES DA EQUIPE (o kit não exporta esses números sozinho) — a equipe
// anota o que observou em cada execução e o LabTest compara ao longo do tempo.
// ---------------------------------------------------------------------------

export const KIT_IA_ID = "lego-education-cs-ai";

export type KitParamType = "number" | "duration" | "boolean" | "text" | "select";

export interface KitParam {
  nome: string;
  rotulo: string;
  descricao: string;
  tipo: KitParamType;
  unidade?: string;
  opcoes?: string[];
  /** Valor-alvo opcional (aparece como referência no formulário). */
  meta?: number;
  /** Já vem marcado ao escolher o preset. */
  padrao: boolean;
}

export interface KitPreset {
  id: string;
  label: string;
  componente: string;
  resumo: string;
  /** Papel(éis) do Future Edition em que o teste costuma ajudar. */
  relevantePara: string;
  params: KitParam[];
}

export const KIT_PRESETS: KitPreset[] = [
  {
    id: "sensor-cor",
    label: "Sensor de cor",
    componente: "Sensor de cor",
    resumo: "Repetibilidade e acerto da leitura de cor em diferentes condições de luz e distância.",
    relevantePara: "Technicians (ferramentas programadas)",
    params: [
      { nome: "amostras", rotulo: "Leituras realizadas", descricao: "Quantas leituras foram feitas na execução.", tipo: "number", padrao: true },
      { nome: "acertos", rotulo: "Leituras corretas", descricao: "Quantas leituras identificaram a cor-alvo.", tipo: "number", padrao: true },
      { nome: "falsos_positivos", rotulo: "Falsos positivos", descricao: "Leituras que indicaram a cor-alvo sem ela estar lá.", tipo: "number", padrao: true },
      { nome: "tempo_leitura", rotulo: "Tempo até a leitura", descricao: "Tempo médio para o sensor responder.", tipo: "number", unidade: "ms", padrao: true },
      { nome: "distancia", rotulo: "Distância do sensor", descricao: "Distância entre o sensor e a superfície.", tipo: "number", unidade: "mm", padrao: true },
      { nome: "iluminacao", rotulo: "Iluminação", descricao: "Condição de luz no teste.", tipo: "select", opcoes: ["Baixa", "Média", "Alta", "Luz direta"], padrao: true },
      { nome: "cor_alvo", rotulo: "Cor-alvo", descricao: "Cor que o sensor devia identificar.", tipo: "text", padrao: false },
    ],
  },
  {
    id: "motor-duplo",
    label: "Motor duplo",
    componente: "Motor duplo",
    resumo: "Deslocamento em linha reta: precisão de distância e desvio de direção.",
    relevantePara: "Movimento do robô / Drivers",
    params: [
      { nome: "potencia", rotulo: "Potência", descricao: "Potência configurada no programa.", tipo: "number", unidade: "%", padrao: true },
      { nome: "distancia_real", rotulo: "Distância percorrida", descricao: "Distância medida no campo.", tipo: "number", unidade: "cm", padrao: true },
      { nome: "desvio_lateral", rotulo: "Desvio lateral", descricao: "Quanto o robô saiu da linha reta.", tipo: "number", unidade: "cm", padrao: true },
      { nome: "angulo_final", rotulo: "Ângulo final", descricao: "Diferença de direção ao parar.", tipo: "number", unidade: "°", padrao: true },
      { nome: "tempo", rotulo: "Tempo de percurso", descricao: "Tempo para completar o trajeto.", tipo: "duration", unidade: "s", padrao: true },
      { nome: "superficie", rotulo: "Superfície", descricao: "Onde o teste foi feito.", tipo: "select", opcoes: ["Mesa lisa", "Tapete do campo", "Piso"], padrao: false },
    ],
  },
  {
    id: "motor-simples",
    label: "Motor simples",
    componente: "Motor simples",
    resumo: "Ferramenta acionada por um motor: ciclos, tempo por ciclo e travamentos sob carga.",
    relevantePara: "Operators / ferramentas robóticas",
    params: [
      { nome: "potencia", rotulo: "Potência", descricao: "Potência configurada no programa.", tipo: "number", unidade: "%", padrao: true },
      { nome: "ciclos", rotulo: "Ciclos concluídos", descricao: "Ciclos completos sem intervenção.", tipo: "number", padrao: true },
      { nome: "tempo_ciclo", rotulo: "Tempo por ciclo", descricao: "Tempo médio de cada ciclo.", tipo: "duration", unidade: "s", padrao: true },
      { nome: "travamentos", rotulo: "Travamentos", descricao: "Vezes que o mecanismo travou.", tipo: "number", padrao: true },
      { nome: "carga", rotulo: "Carga", descricao: "Peso/resistência durante o teste.", tipo: "select", opcoes: ["Sem carga", "Leve", "Pesada"], padrao: true },
      { nome: "posicao_final_ok", rotulo: "Terminou na posição certa", descricao: "O mecanismo parou onde devia.", tipo: "boolean", padrao: false },
    ],
  },
  {
    id: "controle",
    label: "Controle",
    componente: "Controle",
    resumo: "Resposta do controle: comandos entregues, falhas de conexão e consumo de bateria.",
    relevantePara: "Drivers",
    params: [
      { nome: "distancia", rotulo: "Distância do robô", descricao: "Distância entre controle e robô.", tipo: "number", unidade: "m", padrao: true },
      { nome: "comandos_enviados", rotulo: "Comandos enviados", descricao: "Comandos feitos no teste.", tipo: "number", padrao: true },
      { nome: "comandos_executados", rotulo: "Comandos executados", descricao: "Comandos que o robô executou.", tipo: "number", padrao: true },
      { nome: "falhas_conexao", rotulo: "Falhas de conexão", descricao: "Quedas ou travamentos de conexão.", tipo: "number", padrao: true },
      { nome: "tempo_resposta", rotulo: "Tempo de resposta percebido", descricao: "Atraso entre o comando e o movimento.", tipo: "number", unidade: "ms", padrao: true },
      { nome: "bateria_inicio", rotulo: "Bateria no início", descricao: "Carga do controle antes do teste.", tipo: "number", unidade: "%", padrao: false },
      { nome: "bateria_fim", rotulo: "Bateria no fim", descricao: "Carga do controle depois do teste.", tipo: "number", unidade: "%", padrao: false },
    ],
  },
  {
    id: "ia",
    label: "Sistema de IA",
    componente: "Coding Canvas · IA",
    resumo: "Qualidade de um sistema de IA montado e treinado pela equipe: acerto, erros e dados usados.",
    relevantePara: "Technicians / Specialists",
    params: [
      { nome: "exemplos_treino", rotulo: "Exemplos de treino", descricao: "Quantidade de exemplos usados para treinar.", tipo: "number", padrao: true },
      { nome: "acuracia", rotulo: "Acerto nos testes", descricao: "Porcentagem de respostas corretas.", tipo: "number", unidade: "%", padrao: true },
      { nome: "falsos_positivos", rotulo: "Falsos positivos", descricao: "Reconheceu algo que não estava lá.", tipo: "number", padrao: true },
      { nome: "falsos_negativos", rotulo: "Falsos negativos", descricao: "Não reconheceu algo que estava lá.", tipo: "number", padrao: true },
      { nome: "tempo_treino", rotulo: "Tempo de treino", descricao: "Tempo gasto treinando/ajustando.", tipo: "number", unidade: "min", padrao: false },
      { nome: "ambiente", rotulo: "Ambiente do teste", descricao: "Condição em que o sistema foi testado.", tipo: "select", opcoes: ["Sala", "Campo de jogo", "Luz forte", "Pouca luz"], padrao: false },
      { nome: "versao_programa", rotulo: "Versão do programa", descricao: "Identificação da versão no Coding Canvas.", tipo: "text", padrao: false },
    ],
  },
  {
    id: "rotina",
    label: "Rotina no Coding Canvas",
    componente: "Coding Canvas",
    resumo: "Confiabilidade de uma rotina programada: tempo, objetivos cumpridos e reinícios.",
    relevantePara: "Technicians / Specialists",
    params: [
      { nome: "tempo_total", rotulo: "Tempo total", descricao: "Duração da rotina do início ao fim.", tipo: "duration", unidade: "s", padrao: true },
      { nome: "objetivos_concluidos", rotulo: "Objetivos concluídos", descricao: "Quantos objetivos a rotina cumpriu.", tipo: "number", padrao: true },
      { nome: "reinicios", rotulo: "Reinícios necessários", descricao: "Vezes que foi preciso reiniciar.", tipo: "number", padrao: true },
      { nome: "concluiu", rotulo: "Rotina completa", descricao: "Terminou sem intervenção da equipe.", tipo: "boolean", padrao: true },
      { nome: "versao_programa", rotulo: "Versão do programa", descricao: "Identificação da versão no Coding Canvas.", tipo: "text", padrao: false },
    ],
  },
];

export function getKitPreset(id: string | undefined | null): KitPreset | undefined {
  return KIT_PRESETS.find((preset) => preset.id === id);
}
