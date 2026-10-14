import { CATEGORIES } from '@/app/(public)/[competicao]/(fll)/empathy-map/initialData';
import { AnalysisData, EmpathyMap } from '@/types/EmpathyMap.types';

export function exportMapToMarkdown(map: EmpathyMap, analysis?: AnalysisData | null): string {
  const dateStr = new Date(map.updatedAt).toLocaleDateString('pt-BR');

  let md = `# Mapa de Empatia: ${map.title}\n\n`;
  md += `**Data de Atualização:** ${dateStr}\n`;
  md += `**Persona:** ${map.persona.name} — ${map.persona.role}\n`;
  if (map.persona.demographics) md += `**Demografia:** ${map.persona.demographics}\n`;
  if (map.persona.quote) md += `> "${map.persona.quote}"\n\n`;
  if (map.persona.context) md += `**Contexto da Persona:** ${map.persona.context}\n\n`;

  md += `---\n\n## 1. Notas por Quadrante de Empatia\n\n`;

  const categories = Object.values(CATEGORIES);
  for (const cat of categories) {
    const catNotes = map.notes.filter((n) => n.category === cat.id);
    md += `### ${cat.title} (${cat.subtitle})\n`;
    md += `*Pergunta norteadora: ${cat.guidingQuestion}*\n\n`;

    if (catNotes.length === 0) {
      md += `*Nenhuma nota adicionada nesta categoria.*\n\n`;
    } else {
      catNotes.forEach((n) => {
        const sentimentMark = n.sentiment === 'positive' ? '🟢' : n.sentiment === 'negative' ? '🔴' : '⚪';
        const tagsStr = n.tags && n.tags.length ? ` \`[${n.tags.join(', ')}]\`` : '';
        const authorStr = n.author ? ` *(Fonte: ${n.author})*` : '';
        const votesStr = n.votes > 0 ? ` [${n.votes} votos]` : '';
        md += `- ${sentimentMark} **${n.text}**${tagsStr}${votesStr}${authorStr}\n`;
      });
      md += `\n`;
    }
  }

  if (analysis) {
    md += `---\n\n## 2. Síntese Executiva & Análise de UX\n\n`;
    md += `### Arquétipo Identificado: ${analysis.archetypeTitle}\n\n`;
    md += `${analysis.executiveSummary}\n\n`;

    md += `### Principais Dores Priorizadas\n`;
    analysis.topPains.forEach((p, idx) => {
      md += `${idx + 1}. ${p}\n`;
    });
    md += `\n`;

    md += `### Motivações & Aspirações Nucleares\n`;
    analysis.coreMotivations.forEach((m, idx) => {
      md += `${idx + 1}. ${m}\n`;
    });
    md += `\n`;

    if (analysis.contradictions && analysis.contradictions.length > 0) {
      md += `### Contradições Identificadas (O que Diz vs O que Faz)\n`;
      analysis.contradictions.forEach((c) => {
        md += `- **Achado:** ${c.finding}\n  - *Insight UX:* ${c.uxInsight}\n`;
      });
      md += `\n`;
    }

    md += `### Oportunidades "Como Nós Poderíamos..." (HMW)\n`;
    analysis.howMightWe.forEach((hmw) => {
      md += `- ${hmw}\n`;
    });
    md += `\n`;

    md += `### Iniciativas de Produto Recomendadas\n`;
    analysis.actionableOpportunities.forEach((opp) => {
      md += `- **[Impacto: ${opp.impact}] ${opp.title}**: ${opp.description}\n`;
    });
  }

  return md;
}

export function exportMapToCSV(map: EmpathyMap): string {
  const headers = ['ID', 'Categoria', 'Texto', 'Sentimento', 'Votos', 'Autor/Fonte', 'Tags', 'Data'];
  const rows = map.notes.map((n) => {
    const catName = CATEGORIES[n.category]?.title || n.category;
    const dateStr = new Date(n.createdAt).toLocaleDateString('pt-BR');
    const tagsStr = (n.tags || []).join('; ');
    const escapedText = `"${n.text.replace(/"/g, '""')}"`;
    const escapedAuthor = `"${(n.author || '').replace(/"/g, '""')}"`;
    return [n.id, `"${catName}"`, escapedText, n.sentiment, n.votes, escapedAuthor, `"${tagsStr}"`, dateStr].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
