import { createEditor } from "lexical";
import { EDITOR_NODES } from "./editor-nodes";
import { $applyTemplateToDocument, type DocTemplate } from "./templates";

/**
 * Gera o JSON do Lexical de um modelo sem montar o editor na tela.
 * Permite criar a página já preenchida pelo servidor/ação existente.
 */
export function templateToEditorState(tpl: DocTemplate): Record<string, unknown> {
  const editor = createEditor({
    namespace: "template-export",
    nodes: EDITOR_NODES,
    onError(error) {
      throw error;
    },
  });
  editor.update(() => $applyTemplateToDocument(tpl), { discrete: true });
  return editor.getEditorState().toJSON() as unknown as Record<string, unknown>;
}
