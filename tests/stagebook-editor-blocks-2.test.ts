import { describe, expect, it } from "vitest";
import { $createParagraphNode, $createTextNode, $getRoot, createEditor, type LexicalEditor } from "lexical";
import { $createHeadingNode, $isHeadingNode } from "@lexical/rich-text";
import { EDITOR_NODES } from "@/features/stagebook/editor/editor-nodes";
import { $insertTabs, $isTabsNode, $revealInTabs, $unwrapTabs, type TabNode, type TabsNode } from "@/features/stagebook/editor/nodes/tabs-nodes";
import { $createPageMentionNode } from "@/features/stagebook/editor/nodes/page-mention-node";
import { $createSmartBlockNode } from "@/features/stagebook/editor/nodes/smart-block-node";
import { $createSyncedBlockNode } from "@/features/stagebook/editor/nodes/synced-block-node";
import { documentToHtml, documentToMarkdown } from "@/features/stagebook/editor/export-document";
import { lexicalToPlainText } from "@/features/stagebook/lib/lexical-text";
import { collectDecisions, collectSyncIds, findReferenceSnippets, searchSnippet } from "@/features/stagebook/lib/page-links";

const makeEditor = (): LexicalEditor => createEditor({ namespace: "t", nodes: EDITOR_NODES, onError: (e) => { throw e; } });
const PAGE = "11111111-1111-4111-8111-111111111111";
const SYNC = "22222222-2222-4222-8222-222222222222";

function build(editor: LexicalEditor) {
  editor.update(
    () => {
      const root = $getRoot().clear();
      const p = $createParagraphNode();
      root.append(p);
      const tabs = $insertTabs(p, ["Hardware", "Software"]);
      const [hw, sw] = tabs.getChildren() as TabNode[];
      (hw.getFirstChild() as ReturnType<typeof $createParagraphNode>).append($createTextNode("Motores grandes"));
      const h = $createHeadingNode("h3");
      h.append($createTextNode("Sensores"));
      sw.append(h);
      const m = $createParagraphNode();
      m.append($createTextNode("Ver "), $createPageMentionNode(PAGE, "Plano da M03"), $createTextNode(" antes."));
      root.append(m);
      root.append($createSyncedBlockNode(SYNC));
      root.append(
        $createSmartBlockNode("decision", {
          title: "Usar esteiras",
          date: "2026-11-10",
          status: "implementada",
          decision: "Trocar rodas por esteiras",
          reason: "Mais tração na rampa",
          participants: ["Ana", "Caio"],
          alternatives: [{ id: "a", text: "Rodas maiores", why: "Robô ficava alto demais" }],
          outcome: "sucesso",
          result: "Subiu a rampa 10/10",
        }),
      );
      root.append(
        $createSmartBlockNode("competition-checklist", {
          title: "Checklist — Campeonato",
          groups: [{ id: "g", title: "Robô", items: [{ id: "i1", text: "Bateria carregada", important: true, checked: true }, { id: "i2", text: "Cabos" }] }],
        }),
      );
      root.append($createSmartBlockNode("programming-strategy", { mission: "M03", attempts: 10, successes: 8, steps: [{ id: "s", text: "Andar 40 cm" }], code: "drive(400)" }));
    },
    { discrete: true },
  );
}

describe("StageBook — rodada 3 (abas, menções, sincronizados, inteligentes)", () => {
  it("salva e reabre o JSON sem perder nada", () => {
    const editor = makeEditor();
    build(editor);
    const json = editor.getEditorState().toJSON();
    const other = makeEditor();
    other.setEditorState(other.parseEditorState(JSON.stringify(json)));
    expect(other.getEditorState().toJSON()).toEqual(json);
  });

  it("abas: revela a aba do nó e desfaz em títulos", () => {
    const editor = makeEditor();
    build(editor);
    editor.update(
      () => {
        const tabs = $getRoot().getChildren().find($isTabsNode) as TabsNode;
        expect(tabs.getActive()).toBe(0);
        const heading = (tabs.getChildAtIndex(1) as TabNode).getChildren().find($isHeadingNode)!;
        $revealInTabs(heading);
        expect(tabs.getActive()).toBe(1);
        $unwrapTabs(tabs, (t) => {
          const h = $createHeadingNode("h3");
          h.append($createTextNode(t));
          return h;
        });
      },
      { discrete: true },
    );
    editor.read(() => {
      const text = $getRoot().getTextContent();
      expect(text).toContain("Hardware");
      expect(text).toContain("Motores grandes");
      expect($getRoot().getChildren().some($isTabsNode)).toBe(false);
    });
  });

  it("acha menções, sincronizados e decisões no JSON", () => {
    const editor = makeEditor();
    build(editor);
    const json = editor.getEditorState().toJSON();
    expect(findReferenceSnippets(json, PAGE)).toEqual(["Ver @Plano da M03 antes."]);
    expect(collectSyncIds(json)).toEqual([SYNC]);
    expect(collectDecisions(json)[0]).toMatchObject({ title: "Usar esteiras", outcome: "sucesso" });
    const plain = lexicalToPlainText(json);
    expect(plain).toContain("Hardware");
    expect(plain).toContain("@Plano da M03");
    expect(plain).toContain("Mais tração na rampa");
  });

  it("trecho de busca ignora acento e maiúscula", () => {
    const s = searchSnippet("Hoje a Equipe ajustou o GIROSCÓPIO do robô.", "giroscopio");
    expect(s?.match).toBe("GIROSCÓPIO");
    expect(s?.before).toContain("ajustou");
    expect(searchSnippet("nada aqui", "xyz")).toBeNull();
  });

  it("exporta Markdown e HTML com abas, menção, sincronizado resolvido e blocos inteligentes", () => {
    const editor = makeEditor();
    build(editor);
    const json = editor.getEditorState().toJSON();
    const synced = {
      [SYNC]: {
        title: "Regras",
        content: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Use óculos", format: 0 }] }] } },
      },
    };
    const md = documentToMarkdown(json, { title: "Robô" }, synced);
    expect(md).toContain("**▸ Hardware**");
    expect(md).toContain(`[@Plano da M03](/dashboard/documents/${PAGE})`);
    expect(md).toContain("Use óculos");
    expect(md).toContain("**Decisão: Usar esteiras**");
    expect(md).toContain("- **Por quê:** Mais tração na rampa");
    expect(md).toContain("- Rodas maiores — Robô ficava alto demais");
    expect(md).toContain("- [x] Bateria carregada ⭐");
    expect(md).toContain("8 acertos em 10 tentativas (80%)");
    expect(md).toContain("```\ndrive(400)\n```");

    const html = documentToHtml(json, { title: "Robô" }, { synced });
    expect(html).toContain('<div class="sb-tab-title">Software</div>');
    expect(html).toContain('<a class="sb-mention"');
    expect(html).toContain('<div class="sb-synced"><p>Use óculos</p></div>');
    expect(html).toContain("sb-smart-decision");

    // Sem o conteúdo do sincronizado: aviso no lugar.
    expect(documentToMarkdown(json, { title: "Robô" })).toContain("Bloco sincronizado (abra no Stagebook)");
  });
});
