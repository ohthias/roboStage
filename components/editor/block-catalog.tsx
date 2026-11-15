"use client";

import type { ReactNode } from "react";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import {
  $createParagraphNode,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  type LexicalEditor,
  type LexicalNode,
} from "lexical";
import {
  AlertTriangle,
  CalendarDays,
  Camera,
  ChevronRightSquare,
  Code2,
  Columns2,
  Columns3,
  Columns4,
  Milestone,
  AtSign,
  Bot,
  ClipboardCheck,
  Gavel,
  History,
  PanelTop,
  RefreshCcw,
  Route,
  FlaskConical,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Info,
  KanbanSquare,
  List,
  ListChecks,
  ListOrdered,
  ListTree,
  Map as MapIcon,
  Minus,
  Pilcrow,
  Quote,
  Shapes,
  Sigma,
  Smile,
  SquareCheckBig,
  SquareFunction,
  Table2,
} from "lucide-react";
import { $insertLayout } from "./nodes/layout-nodes";
import { OPEN_EMBED_PICKER_COMMAND } from "./plugins/embed-plugin";
import { OPEN_EMOJI_PICKER_COMMAND } from "./plugins/emoji-plugin";
import type { EmbedKind } from "./embeds/embed-types";
import { $insertTemplateAt, TEMPLATES } from "./templates";
import { DocIcon } from "./doc-icon";
import { $getTopLevelBlock, $transformBlock, type BlockType } from "./block-utils";
import { $insertCollapsible, type ToggleLevel } from "./nodes/collapsible-nodes";
import { $insertCallout, type CalloutVariant } from "./nodes/callout-node";
import { $createEquationNode } from "./nodes/equation-node";
import { $createTocNode } from "./nodes/toc-node";
import { $insertTimeline } from "./nodes/timeline-nodes";
import { $insertTabs } from "./nodes/tabs-nodes";
import { localDateISO } from "./local-date";
import { $createSmartBlockNode, type SmartBlockKind, type SmartBlockData } from "./nodes/smart-block-node";
import { OPEN_SYNCED_PICKER_COMMAND } from "./plugins/synced-blocks-plugin";

export type BlockCommand = {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  keywords: string[];
  group: string;
  /** Atalho markdown mostrado no menu. */
  hint?: string;
  run: () => void;
};

function $currentBlock(): LexicalNode | null {
  const selection = $getSelection();
  return $isRangeSelection(selection) ? $getTopLevelBlock(selection.anchor.getNode()) : null;
}

function $isEmptyParagraph(node: LexicalNode | null) {
  return !!node && node.getType() === "paragraph" && $isElementNode(node) && node.getTextContentSize() === 0;
}

/** Insere um bloco "atômico" no lugar do parágrafo vazio ou abaixo do bloco atual. */
function $placeBlock(node: LexicalNode) {
  const top = $currentBlock();
  if (top && $isEmptyParagraph(top)) top.replace(node);
  else if (top) top.insertAfter(node);
  else return;
  if (!node.getNextSibling()) node.insertAfter($createParagraphNode());
  const next = node.getNextSibling();
  if ($isElementNode(next)) next.selectStart();
}

/**
 * Todos os blocos que podem ser inseridos/convertidos. Usado pelo menu "/"
 * e pela paleta de comandos.
 */
export function buildBlockCommands(editor: LexicalEditor): BlockCommand[] {
  const transform = (type: BlockType) => () =>
    editor.update(() => {
      const top = $currentBlock();
      if (top) $transformBlock(top.getKey(), type);
    });

  const insertColumns = (n: 2 | 3 | 4) => () =>
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) $insertLayout(n, selection.anchor.getNode());
    });

  const insertToggle = (level: ToggleLevel) => () =>
    editor.update(() => {
      const top = $currentBlock();
      if (top && !$isEmptyParagraph(top) && (top.getType() === "paragraph" || top.getType() === "heading")) {
        $transformBlock(top.getKey(), "toggle");
        return;
      }
      $insertCollapsible(top, level);
    });

  const insertCallout = (variant: CalloutVariant) => () =>
    editor.update(() => {
      $insertCallout($currentBlock(), variant);
    });

  // Abre o seletor de itens (card, evento, gráfico, quadro). Guarda o bloco
  // atual: o foco sai do editor enquanto o diálogo está aberto.
  const openEmbedPicker = (kind: EmbedKind) => () =>
    editor.update(() => {
      const top = $currentBlock();
      editor.dispatchCommand(OPEN_EMBED_PICKER_COMMAND, { kind, anchorKey: top?.getKey() ?? null });
    });

  const basics: BlockCommand[] = [
    { id: "paragraph", title: "Texto", description: "Parágrafo de texto simples", icon: <Pilcrow size={18} />, keywords: ["paragrafo", "texto", "text", "p"], group: "Blocos básicos", run: transform("paragraph") },
    { id: "h1", title: "Título 1", description: "Título grande de seção", icon: <Heading1 size={18} />, keywords: ["h1", "heading", "titulo", "cabecalho"], group: "Blocos básicos", hint: "#", run: transform("h1") },
    { id: "h2", title: "Título 2", description: "Título médio", icon: <Heading2 size={18} />, keywords: ["h2", "heading", "titulo", "subtitulo"], group: "Blocos básicos", hint: "##", run: transform("h2") },
    { id: "h3", title: "Título 3", description: "Título pequeno", icon: <Heading3 size={18} />, keywords: ["h3", "heading", "titulo"], group: "Blocos básicos", hint: "###", run: transform("h3") },
    { id: "h4", title: "Título 4", description: "Subtítulo de seção", icon: <Heading4 size={18} />, keywords: ["h4", "heading", "titulo", "subtitulo"], group: "Blocos básicos", hint: "####", run: transform("h4") },
    { id: "h5", title: "Título 5", description: "Subtítulo menor", icon: <Heading5 size={18} />, keywords: ["h5", "heading", "titulo"], group: "Blocos básicos", hint: "#####", run: transform("h5") },
    { id: "h6", title: "Título 6", description: "Rótulo de seção em caixa alta", icon: <Heading6 size={18} />, keywords: ["h6", "heading", "titulo", "rotulo"], group: "Blocos básicos", hint: "######", run: transform("h6") },
    { id: "bullet", title: "Lista com marcadores", description: "Lista simples com bolinhas", icon: <List size={18} />, keywords: ["bullet", "ul", "lista", "marcadores", "unordered"], group: "Blocos básicos", hint: "-", run: transform("bullet") },
    { id: "number", title: "Lista numerada", description: "Lista ordenada 1, 2, 3...", icon: <ListOrdered size={18} />, keywords: ["number", "ol", "lista", "numerada", "ordered"], group: "Blocos básicos", hint: "1.", run: transform("number") },
    { id: "check", title: "Lista de tarefas", description: "Acompanhe tarefas com checkbox", icon: <ListChecks size={18} />, keywords: ["todo", "check", "tarefa", "checklist", "task"], group: "Blocos básicos", hint: "[]", run: transform("check") },
    { id: "toggle", title: "Bloco recolhível", description: "Esconda conteúdo dentro de uma seta", icon: <ChevronRightSquare size={18} />, keywords: ["toggle", "recolhivel", "colapsar", "expandir", "sanfona", "details", "alternar"], group: "Blocos básicos", hint: ">", run: insertToggle("p") },
    { id: "quote", title: "Citação", description: "Destaque uma citação", icon: <Quote size={18} />, keywords: ["quote", "citacao", "blockquote"], group: "Blocos básicos", hint: '"', run: transform("quote") },
    { id: "code", title: "Código", description: "Bloco de código", icon: <Code2 size={18} />, keywords: ["code", "codigo", "snippet", "pre"], group: "Blocos básicos", hint: "```", run: transform("code") },
    { id: "columns-2", title: "2 colunas", description: "Seção com duas colunas lado a lado", icon: <Columns2 size={18} />, keywords: ["colunas", "coluna", "columns", "duas", "2", "layout", "secao"], group: "Blocos básicos", run: insertColumns(2) },
    { id: "columns-3", title: "3 colunas", description: "Seção com três colunas lado a lado", icon: <Columns3 size={18} />, keywords: ["colunas", "coluna", "columns", "tres", "3", "layout", "secao"], group: "Blocos básicos", run: insertColumns(3) },
    { id: "columns-4", title: "4 colunas", description: "Seção com quatro colunas lado a lado", icon: <Columns4 size={18} />, keywords: ["colunas", "coluna", "columns", "quatro", "4", "layout", "secao", "grade"], group: "Blocos básicos", run: insertColumns(4) },
    { id: "timeline", title: "Linha do tempo", description: "Etapas numeradas com status e blocos dentro", icon: <Milestone size={18} />, keywords: ["linha do tempo", "timeline", "etapas", "passos", "stepper", "cronograma", "roadmap", "processo", "fases"], group: "Blocos básicos", run: () => editor.update(() => $insertTimeline($currentBlock(), 3)) },
    { id: "tabs", title: "Abas", description: "Conteúdo separado em abas clicáveis", icon: <PanelTop size={18} />, keywords: ["abas", "tabs", "guias", "separar", "alternar", "tab"], group: "Blocos básicos", run: () => editor.update(() => $insertTabs($currentBlock())) },
    { id: "divider", title: "Divisor", description: "Linha horizontal separadora", icon: <Minus size={18} />, keywords: ["divider", "hr", "linha", "separador", "divisor"], group: "Blocos básicos", hint: "---", run: () => editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined) },
    { id: "table", title: "Tabela", description: "Tabela 3×3", icon: <Table2 size={18} />, keywords: ["table", "tabela", "grid", "grade"], group: "Blocos básicos", run: () => editor.dispatchCommand(INSERT_TABLE_COMMAND, { columns: "3", rows: "3", includeHeaders: { rows: true, columns: false } }) },
  ];

  const toggles: BlockCommand[] = (["h1", "h2", "h3"] as const).map((level, i) => ({
    id: `toggle-${level}`,
    title: `Título recolhível ${i + 1}`,
    description: `Título ${i + 1} que esconde o conteúdo abaixo`,
    icon: [<Heading1 key="1" size={18} />, <Heading2 key="2" size={18} />, <Heading3 key="3" size={18} />][i],
    keywords: ["toggle", "recolhivel", "titulo", "heading", level, "colapsar", "expandir"],
    group: "Recolhíveis",
    hint: `> em ${level.toUpperCase()}`,
    run: insertToggle(level),
  }));

  const callouts: BlockCommand[] = [
    { id: "callout-info", title: "Info", description: "Nota ou dica em destaque", icon: <Info size={18} />, keywords: ["callout", "destaque", "info", "nota", "dica", "observacao", "aviso"], group: "Destaques", run: insertCallout("info") },
    { id: "callout-alerta", title: "Alerta", description: "Cuidado, risco ou aviso importante", icon: <AlertTriangle size={18} />, keywords: ["callout", "destaque", "alerta", "atencao", "cuidado", "warning", "perigo", "risco"], group: "Destaques", run: insertCallout("alerta") },
    { id: "callout-fazer", title: "Fazer", description: "Ação, próximo passo ou tarefa", icon: <SquareCheckBig size={18} />, keywords: ["callout", "destaque", "fazer", "acao", "todo", "tarefa", "proximo passo", "do"], group: "Destaques", run: insertCallout("fazer") },
  ];

  const advanced: BlockCommand[] = [
    { id: "toc", title: "Sumário", description: "Índice com os títulos da página", icon: <ListTree size={18} />, keywords: ["sumario", "indice", "toc", "table of contents", "conteudo", "navegacao"], group: "Avançado", run: () => editor.update(() => $placeBlock($createTocNode())) },
    { id: "equation", title: "Equação", description: "Fórmula em bloco (LaTeX)", icon: <SquareFunction size={18} />, keywords: ["equacao", "formula", "math", "matematica", "latex", "katex", "tex"], group: "Avançado", hint: "$$", run: () => editor.update(() => $placeBlock($createEquationNode("", false))) },
    {
      id: "equation-inline",
      title: "Equação na linha",
      description: "Fórmula no meio do texto",
      icon: <Sigma size={18} />,
      keywords: ["equacao", "formula", "math", "inline", "latex", "katex"],
      group: "Avançado",
      hint: "$x$",
      run: () =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) selection.insertNodes([$createEquationNode("", true)]);
        }),
    },
    { id: "emoji", title: "Emoji", description: "Escolha um emoji para o texto", icon: <Smile size={18} />, keywords: ["emoji", "emoticon", "carinha", "icone", "smile"], group: "Avançado", hint: ":", run: () => editor.dispatchCommand(OPEN_EMOJI_PICKER_COMMAND, undefined) },
  ];

  const smart = (kind: SmartBlockKind, data: SmartBlockData = {}) => () =>
    editor.update(() => $placeBlock($createSmartBlockNode(kind, data)));

  const reuse: BlockCommand[] = [
    { id: "mention", title: "Mencionar página", description: "Link para outra página (gera backlink)", icon: <AtSign size={18} />, keywords: ["mencionar", "mencao", "link", "pagina", "backlink", "@", "referencia"], group: "Conectar e reutilizar", hint: "@", run: () => editor.update(() => { const s = $getSelection(); if ($isRangeSelection(s)) s.insertText("@"); }) },
    {
      id: "synced",
      title: "Bloco sincronizado",
      description: "Mesmo conteúdo em várias páginas, sempre igual",
      icon: <RefreshCcw size={18} />,
      keywords: ["sincronizado", "synced", "reutilizar", "reusar", "personalizado", "bloco salvo", "compartilhado", "template"],
      group: "Conectar e reutilizar",
      run: () =>
        editor.update(() => {
          const top = $currentBlock();
          editor.dispatchCommand(OPEN_SYNCED_PICKER_COMMAND, { anchorKey: top?.getKey() ?? null });
        }),
    },
  ];

  const smartBlocks: BlockCommand[] = [
    { id: "robot-sheet", title: "Ficha do robô", description: "Foto, versões e especificações do caderno QuickBrick", icon: <Bot size={18} />, keywords: ["ficha", "robo", "robot", "quickbrick", "especificacoes", "specs", "caderno"], group: "Blocos inteligentes", run: smart("robot-sheet") },
    { id: "competition-checklist", title: "Checklist de competição", description: "Confia, mas confere — modelos do ConfereAí", icon: <ClipboardCheck size={18} />, keywords: ["checklist", "competicao", "torneio", "confere", "conferir", "lista", "campeonato", "pre"], group: "Blocos inteligentes", run: smart("competition-checklist") },
    { id: "programming-strategy", title: "Estratégia de programação", description: "Missão, abordagem, passos, parâmetros e taxa de acerto", icon: <Route size={18} />, keywords: ["estrategia", "programacao", "missao", "codigo", "pid", "giroscopio", "pybricks", "rota"], group: "Blocos inteligentes", run: smart("programming-strategy", { status: "ideia", steps: [], params: [] }) },
    { id: "decision", title: "Registro de decisão", description: "O que, por quê, quem, alternativas e resultado", icon: <Gavel size={18} />, keywords: ["decisao", "decidir", "adr", "historico", "conhecimento", "registro", "porque"], group: "Conhecimento da equipe", run: smart("decision", { date: localDateISO(), status: "decidida" }) },
    { id: "decision-log", title: "Histórico de decisões", description: "Todas as decisões registradas no espaço", icon: <History size={18} />, keywords: ["historico", "decisoes", "indice", "log", "conhecimento", "linha do tempo"], group: "Conhecimento da equipe", run: smart("decision-log") },
  ];

  const integrations: BlockCommand[] = [
    { id: "embed-kanban", title: "Card do Kanban", description: "Mostra um card de qualquer board, sempre atualizado", icon: <KanbanSquare size={18} />, keywords: ["card", "cartao", "kanban", "tarefa", "board", "quadro", "task"], group: "Integrações", run: openEmbedPicker("kanban-card") },
    { id: "embed-calendar", title: "Evento do calendário", description: "Mostra um evento com data, horário e local", icon: <CalendarDays size={18} />, keywords: ["evento", "calendario", "agenda", "data", "reuniao", "prazo", "event"], group: "Integrações", run: openEmbedPicker("calendar-event") },
    { id: "embed-labtest", title: "Gráfico do LabTest", description: "Gráfico dos resultados de um teste do LabTest", icon: <FlaskConical size={18} />, keywords: ["grafico", "labtest", "teste", "resultado", "chart", "runs", "calibrabot"], group: "Integrações", run: openEmbedPicker("labtest-chart") },
    { id: "embed-thinklab", title: "Quadro do ThinkLab", description: "Miniatura de um quadro do ThinkLab", icon: <Shapes size={18} />, keywords: ["thinklab", "quadro", "miniatura", "diagrama", "whiteboard", "board", "ideia"], group: "Integrações", run: openEmbedPicker("thinklab-board") },
    { id: "embed-photo", title: "Foto do robô", description: "Imagem de uma versão do robô do caderno QuickBrick", icon: <Camera size={18} />, keywords: ["foto", "imagem", "robo", "robot", "quickbrick", "versao", "caderno", "image"], group: "Integrações", run: openEmbedPicker("quickbrick-photo") },
    { id: "embed-diagram", title: "Diagrama do QuickBrick", description: "Estratégia, SWOT, riscos, missões ou mapa de calor como imagem", icon: <MapIcon size={18} />, keywords: ["diagrama", "quickbrick", "estrategia", "swot", "risco", "missoes", "heatmap", "calor", "imagem", "mesa"], group: "Integrações", run: openEmbedPicker("quickbrick-diagram") },
  ];

  const layouts: BlockCommand[] = TEMPLATES.map((tpl) => ({
    id: `template-${tpl.id}`,
    title: tpl.title,
    description: tpl.description,
    icon: <DocIcon value={tpl.emoji} size={20} fallback={null} />,
    keywords: ["layout", "modelo", "template", "pronto", tpl.id],
    group: "Layouts prontos",
    run: () =>
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) $insertTemplateAt(tpl, selection.anchor.getNode());
      }),
  }));

  return [...basics, ...toggles, ...callouts, ...smartBlocks, ...reuse, ...advanced, ...integrations, ...layouts];
}

export function normalizeQuery(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/** Filtro por palavras: todas precisam aparecer no título ou nas palavras-chave. */
export function filterCommands<T extends { title: string; keywords: string[] }>(items: T[], query: string | null): T[] {
  if (!query) return items;
  const q = normalizeQuery(query).trim();
  const tokens = q.split(/\s+/).filter(Boolean);
  // Título que começa com o termo vem antes; depois título que contém tudo;
  // por último quem só casou pelas palavras-chave. Empate mantém a ordem.
  const score = (o: T) => {
    const title = normalizeQuery(o.title);
    if (title.startsWith(q)) return 0;
    if (tokens.every((t) => title.includes(t))) return 1;
    return 2;
  };
  return items
    .filter((o) => {
      const haystack = normalizeQuery([o.title, ...o.keywords].join(" "));
      return tokens.every((t) => haystack.includes(t));
    })
    .map((o, i) => ({ o, i, s: score(o) }))
    .sort((a, b) => a.s - b.s || a.i - b.i)
    .map((x) => x.o);
}
