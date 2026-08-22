import type { Cause, FishboneData, SubCause } from "./types";

/**
 * Converte o markdown escrito pelo usuário em uma árvore para o diagrama de Ishikawa.
 *
 * Convenção:
 *   # Problema principal    -> cabeça do peixe (apenas o primeiro é considerado)
 *   ## Causa                -> espinha (pode haver várias)
 *   ### Sub causa            -> ramificação da espinha (pode haver várias por causa)
 *   #### Detalhe               -> detalhe da sub causa (pode haver vários por sub causa)
 *
 * Linhas que não comecem com #, ##, ### ou #### são ignoradas (permite comentários livres).
 */
export function parseMarkdown(markdown: string): FishboneData {
  const lines = (markdown || "").split("\n");

  let problem = "";
  const causes: Cause[] = [];
  let currentCause: Cause | null = null;
  let currentSub: SubCause | null = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    const h4 = line.match(/^####\s+(.*)/);
    const h3 = line.match(/^###\s+(.*)/);
    const h2 = line.match(/^##\s+(.*)/);
    const h1 = line.match(/^#\s+(.*)/);

    if (h4) {
      const text = h4[1].trim();
      if (text && currentSub) {
        currentSub.details.push(text);
      }
      continue;
    }

    if (h3) {
      const text = h3[1].trim();
      if (text && currentCause) {
        currentSub = { name: text, details: [] };
        currentCause.subcauses.push(currentSub);
      }
      continue;
    }

    if (h2) {
      const text = h2[1].trim();
      if (text) {
        currentCause = { name: text, subcauses: [] };
        currentSub = null;
        causes.push(currentCause);
      }
      continue;
    }

    if (h1) {
      const text = h1[1].trim();
      if (text && !problem) {
        problem = text;
      }
      continue;
    }
  }

  return { problem, causes };
}

export const EXAMPLE_MARKDOWN = `# Atrasos na entrega de pedidos

## Mão de obra
### Falta de treinamento
#### Novos funcionários sem onboarding
#### Rotatividade alta na equipe
### Baixa motivação
#### Ausência de plano de carreira

## Método
### Processo de separação manual
#### Falta de checklist padrão
### Roteirização ineficiente

## Máquina
### Falhas no sistema de estoque
#### Sistema desatualizado
#### Falta de manutenção preventiva
`;
