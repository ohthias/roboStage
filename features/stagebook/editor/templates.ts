/**
 * Layouts (modelos) prontos. Cada modelo monta nós do Lexical e pode ser:
 *  - aplicado a uma página vazia (galeria "Comece com um modelo");
 *  - inserido em qualquer ponto pelo menu "/".
 * Chame sempre dentro de editor.update().
 */
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  type ElementNode,
  type LexicalNode,
} from "lexical";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $createListItemNode, $createListNode } from "@lexical/list";
import { $createCodeNode } from "@lexical/code";
import {
  $createTableCellNode,
  $createTableNode,
  $createTableRowNode,
  TableCellHeaderStates,
} from "@lexical/table";
import {
  $createLayoutContainerNode,
  $createLayoutItemNode,
} from "./nodes/layout-nodes";
import { $createDividerNode, type DividerStyle } from "./nodes/divider-node";
import { bgVar, textVar } from "./editor-colors";

/* ---------- helpers de construção ---------- */
const p = (text = "", style?: string) => {
  const node = $createParagraphNode();
  if (text) {
    const t = $createTextNode(text);
    if (style) t.setStyle(style);
    node.append(t);
  }
  return node;
};
const h = (tag: "h1" | "h2" | "h3", text: string) => {
  const n = $createHeadingNode(tag);
  n.append($createTextNode(text));
  return n;
};
const quote = (text: string) => {
  const q = $createQuoteNode();
  q.append($createTextNode(text));
  return q;
};
const list = (type: "bullet" | "number" | "check", items: string[]) => {
  const l = $createListNode(type);
  items.forEach((text) => {
    const li = $createListItemNode(type === "check" ? false : undefined);
    li.append($createTextNode(text));
    l.append(li);
  });
  return l;
};
const divider = (style: DividerStyle = "solid", color?: string) => $createDividerNode(style, color);
const code = (lang: string, text: string) => {
  const c = $createCodeNode(lang);
  c.append($createTextNode(text));
  return c;
};
const highlight = (text: string, hue: string) =>
  p(text, `color: ${textVar(hue)}; background-color: ${bgVar(hue)}`);

const columns = (template: string, cols: LexicalNode[][]) => {
  const c = $createLayoutContainerNode(template);
  cols.forEach((nodes) => {
    const item = $createLayoutItemNode();
    nodes.forEach((n) => item.append(n));
    c.append(item);
  });
  return c;
};

const table = (rows: string[][]) => {
  const t = $createTableNode();
  rows.forEach((row, ri) => {
    const r = $createTableRowNode();
    row.forEach((text) => {
      const cell = $createTableCellNode(ri === 0 ? TableCellHeaderStates.ROW : TableCellHeaderStates.NO_STATUS);
      cell.append(p(text));
      r.append(cell);
    });
    t.append(r);
  });
  return t;
};

/* ---------- modelos ---------- */
export type DocTemplate = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  accent: string; // id da paleta para o cartão
  build: () => LexicalNode[];
};

export const TEMPLATES: DocTemplate[] = [
  {
    id: "meeting",
    title: "Anotações de reunião",
    description: "Pauta, decisões e próximos passos",
    emoji: "🗓️",
    accent: "blue",
    build: () => [
      h("h1", "Reunião — título"),
      p("Data: ____   ·   Participantes: ____"),
      divider("solid"),
      columns("2fr 1fr", [
        [h("h2", "Pauta"), list("check", ["Item 1", "Item 2", "Item 3"]), h("h2", "Anotações"), p("Escreva aqui os pontos discutidos…")],
        [h("h2", "Decisões"), list("bullet", ["Decisão 1", "Decisão 2"]), highlight("Lembrete: envie a ata até o fim do dia.", "yellow")],
      ]),
      h("h2", "Próximos passos"),
      table([["Ação", "Responsável", "Prazo"], ["", "", ""], ["", "", ""]]),
    ],
  },
  {
    id: "project",
    title: "Briefing de projeto",
    description: "Objetivo, escopo e cronograma",
    emoji: "🚀",
    accent: "purple",
    build: () => [
      h("h1", "Nome do projeto"),
      highlight("Resumo em uma frase: o que estamos construindo e por quê.", "purple"),
      divider("brush", textVar("purple")),
      columns("1fr 1fr", [
        [h("h2", "Objetivo"), p("Descreva o problema e o resultado esperado."), h("h3", "Métricas de sucesso"), list("bullet", ["Métrica 1", "Métrica 2"])],
        [h("h2", "Escopo"), list("bullet", ["Dentro do escopo", "Dentro do escopo"]), h("h3", "Fora do escopo"), list("bullet", ["Fora do escopo"])],
      ]),
      h("h2", "Cronograma"),
      table([["Fase", "Início", "Entrega", "Status"], ["Descoberta", "", "", ""], ["Execução", "", "", ""], ["Lançamento", "", "", ""]]),
    ],
  },
  {
    id: "board",
    title: "Quadro semanal",
    description: "A fazer, em andamento e concluído",
    emoji: "✅",
    accent: "green",
    build: () => [
      h("h1", "Semana de __/__"),
      p("Mova tarefas entre as colunas recortando e colando, e marque as concluídas."),
      columns("1fr 1fr 1fr", [
        [highlight("A fazer", "red"), list("check", ["Tarefa", "Tarefa", "Tarefa"])],
        [highlight("Em andamento", "yellow"), list("check", ["Tarefa"])],
        [highlight("Concluído", "green"), list("check", ["Tarefa"])],
      ]),
    ],
  },
  {
    id: "retro",
    title: "Retrospectiva",
    description: "Manter, parar e começar",
    emoji: "🔁",
    accent: "orange",
    build: () => [
      h("h1", "Retrospectiva da sprint"),
      divider("dotted", textVar("orange")),
      columns("1fr 1fr 1fr", [
        [h("h2", "👍 Manter"), list("bullet", ["…"])],
        [h("h2", "🛑 Parar"), list("bullet", ["…"])],
        [h("h2", "🌱 Começar"), list("bullet", ["…"])],
      ]),
      h("h2", "Ações combinadas"),
      list("check", ["Ação 1 — responsável", "Ação 2 — responsável"]),
    ],
  },
  {
    id: "spec",
    title: "Especificação técnica",
    description: "Contexto, requisitos e exemplo de código",
    emoji: "🧩",
    accent: "teal",
    build: () => [
      h("h1", "Especificação — título"),
      quote("Contexto: por que esta mudança é necessária?"),
      h("h2", "Requisitos"),
      table([["ID", "Requisito", "Prioridade"], ["R1", "", "Alta"], ["R2", "", "Média"]]),
      h("h2", "Proposta"),
      columns("1fr 1fr", [
        [h("h3", "Prós"), list("bullet", ["…"])],
        [h("h3", "Contras"), list("bullet", ["…"])],
      ]),
      h("h2", "Exemplo"),
      code("typescript", "export function exemplo(input: string) {\n  return input.trim();\n}"),
    ],
  },
  {
    id: "guide",
    title: "Guia passo a passo",
    description: "Tutorial com etapas numeradas",
    emoji: "📚",
    accent: "pink",
    build: () => [
      h("h1", "Como fazer…"),
      p("Introdução curta explicando o que será feito e quanto tempo leva."),
      divider("serrated", textVar("pink")),
      h("h2", "Antes de começar"),
      list("check", ["Pré-requisito 1", "Pré-requisito 2"]),
      h("h2", "Passo a passo"),
      list("number", ["Primeiro passo", "Segundo passo", "Terceiro passo"]),
      highlight("Dica: use / para inserir blocos, tabelas e colunas.", "pink"),
    ],
  },
];

/* ---------- aplicação ---------- */

/** Substitui o conteúdo inteiro da página (usado na página vazia). */
export function $applyTemplateToDocument(tpl: DocTemplate) {
  const root = $getRoot();
  root.clear();
  tpl.build().forEach((n) => root.append(n));
  root.append($createParagraphNode());
  (root.getFirstChild() as ElementNode | null)?.selectStart();
}

/** Insere o modelo abaixo do bloco atual (ou no lugar dele, se vazio). */
export function $insertTemplateAt(tpl: DocTemplate, anchor: LexicalNode) {
  let top: LexicalNode = anchor;
  while (top.getParent() && top.getParent() !== $getRoot()) top = top.getParent() as LexicalNode;

  const nodes = tpl.build();
  const isEmpty =
    top.getType() === "paragraph" && (top as ElementNode).getTextContentSize() === 0;

  let cursor: LexicalNode = top;
  nodes.forEach((n) => {
    cursor.insertAfter(n);
    cursor = n;
  });
  if (!cursor.getNextSibling()) cursor.insertAfter($createParagraphNode());
  if (isEmpty) top.remove();
  (nodes[0] as ElementNode | undefined)?.selectStart?.();
}
