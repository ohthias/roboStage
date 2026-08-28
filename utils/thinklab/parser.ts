import { IshikawaCategory, IshikawaCause, IshikawaData, IshikawaSubCause } from '../types';

/**
 * Parses Markdown into structured Ishikawa diagram data
 */
export function parseMarkdownToIshikawa(markdown: string): IshikawaData {
  const lines = markdown.split(/\r?\n/);
  
  let title = 'Problema / Efeito Indesejado';
  const categories: IshikawaCategory[] = [];
  let currentCategory: IshikawaCategory | null = null;
  let currentCause: IshikawaCause | null = null;
  
  let autoIdCounter = 1;
  const generateId = (prefix: string) => `${prefix}-${autoIdCounter++}`;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Skip empty lines
    if (!trimmed) {
      continue;
    }

    // Check for Main Problem Title: # Title or # Problema: Title
    if (trimmed.startsWith('# ') && !trimmed.startsWith('## ') && !trimmed.startsWith('### ')) {
      let problemText = trimmed.replace(/^#\s*/, '').trim();
      // Remove common prefix like "Problema:" or "Efeito:" if wanted, or keep cleaned
      problemText = problemText.replace(/^(Problema|Efeito|Efeito Principal|Problem|Effect):\s*/i, '').trim();
      if (problemText) {
        title = problemText;
      }
      continue;
    }

    // Check for Category: ## Category or ### Category
    if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
      const categoryName = trimmed.replace(/^#{2,3}\s*/, '').trim();
      if (categoryName) {
        currentCategory = {
          id: generateId('cat'),
          name: categoryName,
          causes: [],
        };
        categories.push(currentCategory);
        currentCause = null;
      }
      continue;
    }

    // Check for List item (Causes and Sub-causes)
    const isListItem = /^\s*[-*+]\s+/.test(rawLine) || /^\s*\d+\.\s+/.test(rawLine);

    if (isListItem) {
      // Calculate indentation to distinguish between primary cause vs sub-cause (5 Whys)
      const leadingSpaces = rawLine.match(/^(\s*)/)?.[1].replace(/\t/g, '  ').length || 0;
      const isSubCause = leadingSpaces >= 2;

      // Extract raw text without the bullet mark
      const itemText = rawLine.replace(/^\s*([*+-]|\d+\.)\s+/, '').trim();
      if (!itemText) continue;

      // Parse metadata markers like [CR], [alta], [baixa], [media], ⭐
      const isRootCause = /\[(cr|causa raiz|root|raiz|\*)\]/i.test(itemText) || itemText.includes('⭐') || itemText.startsWith('[!]');
      let severity: 'low' | 'medium' | 'high' | undefined = undefined;
      if (/\[(alta|high|crítica|critica|!!)\]/i.test(itemText)) severity = 'high';
      else if (/\[(média|media|medium|!)\]/i.test(itemText)) severity = 'medium';
      else if (/\[(baixa|low)\]/i.test(itemText)) severity = 'low';

      // Clean display text by removing markdown tags
      const cleanText = itemText
        .replace(/\[(cr|causa raiz|root|raiz|\*|alta|high|média|media|medium|baixa|low|!|!!)\]/gi, '')
        .replace(/⭐/g, '')
        .trim();

      // If we don't have a category yet, create a default "Geral" category
      if (!currentCategory) {
        currentCategory = {
          id: generateId('cat'),
          name: 'Geral',
          causes: [],
        };
        categories.push(currentCategory);
      }

      if (isSubCause && currentCause) {
        // Add as sub-cause to the current parent cause
        const subCause: IshikawaSubCause = {
          id: generateId('sub'),
          text: cleanText,
          isRootCause,
        };
        currentCause.subCauses.push(subCause);
      } else {
        // Add as primary cause to the current category
        currentCause = {
          id: generateId('cause'),
          text: cleanText,
          subCauses: [],
          isRootCause,
          severity,
        };
        currentCategory.causes.push(currentCause);
      }
    }
  }

  // If no categories were parsed, provide fallback
  if (categories.length === 0) {
    categories.push({
      id: generateId('cat'),
      name: 'Exemplo',
      causes: [
        {
          id: generateId('cause'),
          text: 'Digite as categorias usando ## e causas usando -',
          subCauses: [],
        },
      ],
    });
  }

  return {
    title,
    categories,
    rawMarkdown: markdown,
  };
}

/**
 * Converts structured IshikawaData back to Markdown text
 */
export function ishikawaToMarkdown(data: IshikawaData): string {
  let md = `# Problema: ${data.title}\n\n`;

  for (const cat of data.categories) {
    md += `## ${cat.name}\n`;
    for (const cause of cat.causes) {
      let causeLine = `- ${cause.text}`;
      if (cause.isRootCause) {
        causeLine += ' [CR]';
      }
      if (cause.severity) {
        causeLine += ` [${cause.severity}]`;
      }
      md += `${causeLine}\n`;

      for (const sub of cause.subCauses) {
        let subLine = `  - ${sub.text}`;
        if (sub.isRootCause) {
          subLine += ' [CR]';
        }
        md += `${subLine}\n`;
      }
    }
    md += '\n';
  }

  return md.trim();
}
