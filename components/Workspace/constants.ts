import { Template, DocumentMap } from "./types";

/* =========================
 * DOCUMENTOS INICIAIS
 * ========================= */
export const INITIAL_DOCUMENTS: DocumentMap = {
  "root-robostage": {
    id: "root-robostage",
    title: "Workspace RoboStage",
    icon: "🤖",
    tags: ["robótica", "engenharia"],
    parentId: null,
    isExpanded: true,
    createdAt: Date.now(),
    content:
      "# RoboStage\n\nEste é o seu espaço de engenharia.\n\nAqui você pode:\n- Documentar decisões técnicas\n- Registrar testes e melhorias\n- Planejar estratégias de robô\n- Evoluir projetos continuamente\n\nUse os **templates** para padronizar sua documentação."
  },
  "child-engineering": {
    id: "child-engineering",
    title: "Caderno de Engenharia",
    icon: "📘",
    tags: ["log", "engenharia"],
    parentId: "root-robostage",
    isExpanded: false,
    createdAt: Date.now() + 1000,
    content:
      "## Engineering Log\n\nUse este espaço para registrar decisões importantes do robô."
  }
};

/* =========================
 * TEMPLATES DO ROBOStage
 * ========================= */
export const TEMPLATES: Template[] = [
  {
    id: "tpl-engineering-log",
    title: "Engineering Log",
    icon: "📘",
    tags: ["engenharia", "decisões"],
    content:
      "# Engineering Log\n\n**Data:** " +
      new Date().toLocaleDateString() +
      "\n**Responsáveis:** @nome\n\n## Problema\nDescreva o desafio técnico identificado.\n\n## Solução Proposta\nExplique a solução adotada.\n\n## Justificativa Técnica\nPor que essa solução foi escolhida?\n\n## Resultado\nFuncionou? O que pode melhorar?\n\n## Próximos Passos\n- [ ] Ajuste A\n- [ ] Teste B"
  },

  {
    id: "tpl-robot-design",
    title: "Robot Design",
    icon: "🛠️",
    tags: ["design", "mecânica"],
    content:
      "# Robot Design\n\n## Objetivo do Módulo\nQual a função deste subsistema?\n\n## Componentes Utilizados\n- Motor:\n- Sensor:\n- Estrutura:\n\n## Esquema / Observações\n(Adicione imagens ou diagramas)\n\n## Pontos Fortes\n- \n\n## Limitações\n- \n\n## Ideias de Evolução\n- "
  },

  {
    id: "tpl-programming-log",
    title: "Programming Log",
    icon: "💻",
    tags: ["programação", "software"],
    content:
      "# Programming Log\n\n**Data:** " +
      new Date().toLocaleDateString() +
      "\n**Linguagem:** (ex: Python / Java / Blocks)\n\n## Objetivo do Código\nO que este código faz?\n\n## Lógica Utilizada\nExplique o raciocínio.\n\n## Trecho Importante\n```ts\n// código relevante aqui\n```\n\n## Bugs Encontrados\n- \n\n## Melhorias Futuras\n- "
  },

  {
    id: "tpl-test-report",
    title: "Test Report",
    icon: "🧪",
    tags: ["testes", "validação"],
    content:
      "# Test Report\n\n**Data:** " +
      new Date().toLocaleDateString() +
      "\n**Local do Teste:**\n\n## Objetivo do Teste\nO que será validado?\n\n## Condições\n- Superfície:\n- Iluminação:\n- Bateria:\n\n## Resultados\n| Tentativa | Resultado | Observações |\n|----------|-----------|-------------|\n| 1 | | |\n| 2 | | |\n\n## Conclusão\nO teste foi satisfatório?\n\n## Ajustes Necessários\n- "
  },

  {
    id: "tpl-strategy-planning",
    title: "Strategy Planning",
    icon: "🎯",
    tags: ["estratégia", "planejamento"],
    content:
      "# Strategy Planning\n\n## Objetivo Estratégico\nO que queremos alcançar?\n\n## Missões / Ações Prioritárias\n1. \n2. \n3. \n\n## Riscos\n- \n\n## Plano B\nCaso algo falhe, o que fazer?\n\n## Métricas de Sucesso\nComo saber se deu certo?"
  },

  {
    id: "tpl-retrospective",
    title: "Retrospective",
    icon: "🔄",
    tags: ["aprendizado", "melhoria contínua"],
    content:
      "# Retrospective\n\n## O que funcionou bem?\n- \n\n## O que não funcionou?\n- \n\n## O que aprendemos?\n- \n\n## O que faremos diferente na próxima vez?\n- "
  }
];
