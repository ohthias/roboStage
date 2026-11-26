import { describe, expect, it } from "vitest";
import { $createParagraphNode, $createTextNode, $getRoot, createEditor, type LexicalEditor } from "lexical";
import { $createHeadingNode, $isHeadingNode } from "@lexical/rich-text";
import { $createListItemNode, $createListNode, $isListNode, type ListNode } from "@lexical/list";
import { EDITOR_NODES } from "@/features/stagebook/editor/editor-nodes";
import { $transformBlock, $getBlockType } from "@/features/stagebook/editor/block-utils";
import {
  $isCollapsibleContainerNode,
  type CollapsibleContainerNode,
} from "@/features/stagebook/editor/nodes/collapsible-nodes";
import { $createCalloutNode } from "@/features/stagebook/editor/nodes/callout-node";
import { $createEquationNode } from "@/features/stagebook/editor/nodes/equation-node";
import { $createTocNode } from "@/features/stagebook/editor/nodes/toc-node";
import { $getListMarker, $setListMarker, markerToCss } from "@/features/stagebook/editor/list-markers";
import { documentToHtml, documentToMarkdown, exportFileName } from "@/features/stagebook/editor/export-document";
import { EQUATION_INLINE } from "@/features/stagebook/editor/markdown-transformers";
import { searchEmojis, type Emoji } from "@/features/stagebook/editor/emoji-data";
import {
  $addTimelineItem,
  $insertTimeline,
  $isTimelineNode,
  $unwrapTimeline,
  type TimelineItemNode,
  type TimelineNode,
} from "@/features/stagebook/editor/nodes/timeline-nodes";
import {
  $addLayoutColumn,
  $insertLayout,
  $isLayoutContainerNode,
  $removeLayoutColumn,
  type LayoutContainerNode,
  type LayoutItemNode,
} from "@/features/stagebook/editor/nodes/layout-nodes";
import { dueLabel, propertiesForExport } from "@/features/stagebook/documents/components/doc-properties";

function makeEditor(): LexicalEditor {
  return createEditor({ namespace: "test", nodes: EDITOR_NODES, onError: (e) => { throw e; } });
}

/** Documento com todos os blocos novos. */
function buildDoc(editor: LexicalEditor) {
  editor.update(
    () => {
      const root = $getRoot().clear();
      root.append($createTocNode());
      const h4 = $createHeadingNode("h4");
      h4.append($createTextNode("Detalhes técnicos"));
      root.append(h4);

      const p = $createParagraphNode();
      p.append($createTextNode("Energia: "), $createEquationNode("E=mc^2", true));
      root.append(p);
      root.append($createEquationNode("\\frac{a}{b}", false));

      const callout = $createCalloutNode("alerta");
      callout.append($createTextNode("Cuidado com a bateria"));
      root.append(callout);

      const list = $createListNode("bullet");
      ["Motor", "Sensor"].forEach((t) => {
        const li = $createListItemNode();
        li.append($createTextNode(t));
        list.append(li);
      });
      $setListMarker(list, "arrow");
      root.append(list);

      const h2 = $createHeadingNode("h2");
      h2.append($createTextNode("Estratégia"));
      root.append(h2);
      $transformBlock(h2.getKey(), "toggle");
    },
    { discrete: true },
  );
}

describe("StageBook — blocos novos", () => {
  it("converte título em recolhível do mesmo nível e desfaz", () => {
    const editor = makeEditor();
    buildDoc(editor);
    editor.read(() => {
      const last = $getRoot().getLastChild();
      expect($isCollapsibleContainerNode(last)).toBe(true);
      const c = last as CollapsibleContainerNode;
      expect(c.getTitle()?.getLevel()).toBe("h2");
      expect(c.getTitle()?.getTextContent()).toBe("Estratégia");
      expect($getBlockType(c)).toBe("toggle");
    });
    editor.update(
      () => {
        const c = $getRoot().getLastChild()!;
        $transformBlock(c.getKey(), "h3");
      },
      { discrete: true },
    );
    editor.read(() => {
      const nodes = $getRoot().getChildren();
      const h3 = nodes.find((n) => $isHeadingNode(n) && n.getTag() === "h3");
      expect(h3?.getTextContent()).toBe("Estratégia");
      expect(nodes.some($isCollapsibleContainerNode)).toBe(false);
    });
  });

  it("salva e reabre o JSON sem perder marcador, equação, destaque e recolhível", () => {
    const editor = makeEditor();
    buildDoc(editor);
    const json = editor.getEditorState().toJSON();
    const text = JSON.stringify(json);
    expect(text).toContain('"marker":"arrow"');

    const other = makeEditor();
    other.setEditorState(other.parseEditorState(text));
    expect(other.getEditorState().toJSON()).toEqual(json);
    other.read(() => {
      const list = $getRoot().getChildren().find($isListNode) as ListNode;
      expect($getListMarker(list)).toBe("arrow");
    });
  });

  it("exporta Markdown com h4, equações, alerta, marcador, sumário e recolhível", () => {
    const editor = makeEditor();
    buildDoc(editor);
    const md = documentToMarkdown(editor.getEditorState().toJSON(), { title: "Robô", icon: "🤖" });
    expect(md).toContain("# 🤖 Robô");
    expect(md).toContain("#### Detalhes técnicos");
    expect(md).toContain("Energia: $E=mc^2$");
    expect(md).toContain("$$\n\\frac{a}{b}\n$$");
    expect(md).toContain("> [!WARNING]\n> Cuidado com a bateria");
    expect(md).toContain("- → Motor");
    expect(md).toContain("- [Detalhes técnicos](#detalhes-técnicos)");
    expect(md).toContain("## Estratégia");
  });

  it("exporta HTML autônomo com âncoras e matemática renderizada", () => {
    const editor = makeEditor();
    buildDoc(editor);
    const html = documentToHtml(
      editor.getEditorState().toJSON(),
      { title: "Robô <teste>" },
      { renderMath: (l, d) => `<math data-d="${d}">${l}</math>` },
    );
    expect(html.startsWith("<!DOCTYPE html>")).toBe(true);
    expect(html).toContain("<title>Robô &lt;teste&gt;</title>");
    expect(html).toContain('<h4 id="detalhes-técnicos">');
    expect(html).toContain('href="#detalhes-técnicos"');
    expect(html).toContain('<math data-d="false">E=mc^2</math>');
    expect(html).toContain("sb-callout-alerta");
    expect(html).toContain('list-style-type: &quot;→  &quot;');
    expect(html).toContain("<details open><summary><h2");
    expect(html).toContain("katex.min.css");
  });

  it("não deixa link javascript: no HTML exportado", () => {
    const state = {
      root: {
        type: "root",
        children: [
          {
            type: "paragraph",
            children: [{ type: "link", url: "javascript:alert(1)", children: [{ type: "text", text: "x", format: 0 }] }],
          },
        ],
      },
    };
    expect(documentToHtml(state, { title: "t" })).toContain('href="#"');
  });

  it("atalho $...$ ignora valores em reais", () => {
    const re = EQUATION_INLINE.regExp;
    expect("R$ 10 e R$".match(re)).toBeNull();
    expect("custa R$10 e R$".match(re)).toBeNull();
    expect("a fórmula $x^2$".match(re)?.[1]).toBe("x^2");
    expect("$ x $".match(re)).toBeNull();
  });

  it("marcadores viram list-style-type válido", () => {
    expect(markerToCss("")).toBeNull();
    expect(markerToCss("lower-roman")).toBe("lower-roman");
    expect(markerToCss("c:🚀")).toBe('"🚀  "');
    expect(markerToCss('c:"x\\')).toBe('"x  "');
  });

  it("busca emoji por rótulo em português e atalho em inglês", () => {
    const all: Emoji[] = [
      { emoji: "🚀", label: "foguete", group: 5, shortcodes: ["rocket"], haystack: "foguete espaco veiculo rocket" },
      { emoji: "🤖", label: "rosto de robô", group: 0, shortcodes: ["robot"], haystack: "rosto de robo robot" },
    ];
    expect(searchEmojis(all, "fogu")[0].emoji).toBe("🚀");
    expect(searchEmojis(all, "robot")[0].emoji).toBe("🤖");
    expect(searchEmojis(all, "robô")[0].emoji).toBe("🤖");
  });

  it("gera nome de arquivo seguro", () => {
    expect(exportFileName("Relatório: Missão #3", "md")).toBe("relatorio-missao-3.md");
  });

  it("destaque sem emoji usa o ícone Lucide no HTML", () => {
    const editor = makeEditor();
    buildDoc(editor);
    const html = documentToHtml(editor.getEditorState().toJSON(), { title: "t" });
    expect(html).toContain('<span class="sb-callout-icon"><svg');
    expect(html).toContain("m21.73 18-8-14"); // triangle-alert
  });

  it("linha do tempo: etapas com blocos dentro, status e exportação", () => {
    const editor = makeEditor();
    editor.update(
      () => {
        const root = $getRoot().clear();
        const p = $createParagraphNode();
        root.append(p);
        const timeline = $insertTimeline(p, 2);
        const [first, second] = timeline.getChildren() as TimelineItemNode[];
        first.getFirstChildOrThrow<ReturnType<typeof $createParagraphNode>>().append($createTextNode("Projeto"));
        const list = $createListNode("bullet");
        const li = $createListItemNode();
        li.append($createTextNode("CAD do chassi"));
        list.append(li);
        first.append(list);
        first.setStatus("done");
        second.getFirstChildOrThrow<ReturnType<typeof $createParagraphNode>>().append($createTextNode("Testes"));
        $addTimelineItem(timeline, second);
      },
      { discrete: true },
    );
    const state = editor.getEditorState().toJSON();
    const other = makeEditor();
    other.setEditorState(other.parseEditorState(JSON.stringify(state)));
    expect(other.getEditorState().toJSON()).toEqual(state);
    other.read(() => {
      const t = $getRoot().getChildren().find($isTimelineNode) as TimelineNode;
      expect(t.getChildrenSize()).toBe(3);
      expect((t.getFirstChild() as TimelineItemNode).getStatus()).toBe("done");
    });

    const md = documentToMarkdown(state, { title: "Plano" });
    expect(md).toContain("1. ✅ **Projeto**");
    expect(md).toContain("   - CAD do chassi");
    expect(md).toContain("2. ⚪ **Testes**");
    const html = documentToHtml(state, { title: "Plano" });
    expect(html).toContain('<ol class="sb-timeline"><li class="sb-step sb-step-done"');

    editor.update(
      () => {
        const t = $getRoot().getChildren().find($isTimelineNode) as TimelineNode;
        $unwrapTimeline(t);
      },
      { discrete: true },
    );
    editor.read(() => {
      expect($getRoot().getChildren().some($isTimelineNode)).toBe(false);
      expect($getRoot().getTextContent()).toContain("CAD do chassi");
    });
  });

  it("colunas: adiciona até 4 e remove levando o conteúdo para a vizinha", () => {
    const editor = makeEditor();
    editor.update(
      () => {
        const root = $getRoot().clear();
        const p = $createParagraphNode();
        root.append(p);
        const c = $insertLayout(3, p);
        const items = c.getChildren() as LayoutItemNode[];
        (items[2].getFirstChild() as ReturnType<typeof $createParagraphNode>).append($createTextNode("Sensor"));
        expect($addLayoutColumn(c)).not.toBeNull();
        expect($addLayoutColumn(c)).toBeNull(); // máximo 4
        expect(c.getTemplateColumns()).toBe("1fr 1fr 1fr 1fr");
        $removeLayoutColumn(c, items[2]);
        expect(c.getChildrenSize()).toBe(3);
        expect(c.getTextContent()).toContain("Sensor");
      },
      { discrete: true },
    );
    editor.read(() => {
      const c = $getRoot().getChildren().find($isLayoutContainerNode) as LayoutContainerNode;
      expect(c.getTemplateColumns()).toBe("1fr 1fr 1fr");
    });
  });

  it("prazo relativo e propriedades na exportação", () => {
    const today = new Date(2026, 10, 14);
    expect(dueLabel("2026-11-14", today)?.text).toBe("hoje");
    expect(dueLabel("2026-11-17", today)).toEqual({ text: "em 3 dias", tone: "soon" });
    expect(dueLabel("2026-11-12", today)).toEqual({ text: "atrasado 2 dias", tone: "late" });
    expect(dueLabel("lixo", today)).toBeNull();
    const props = propertiesForExport({ status: "Em andamento", prazo: "2026-11-20", "Versão do robô": "v3" });
    expect(props.map((p) => p.label)).toEqual(["Status", "Prazo", "Versão do robô"]);
    const md = documentToMarkdown({ root: { type: "root", children: [] } }, { title: "X", properties: props });
    expect(md).toContain("**Status:** Em andamento");
  });
});
