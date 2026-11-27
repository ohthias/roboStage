/**
 * lib/mission-timer/pdf.ts
 *
 * Converte o Markdown gerado por `generateMissionTimerMarkdown` em um PDF,
 * seguindo o requisito "Dados → Markdown → PDF": o PDF nunca recebe dados
 * calculados separadamente, apenas renderiza a MESMA string Markdown que
 * é oferecida para download em `.md`.
 *
 * Depende de `jsPDF` (biblioteca leve, sem dependências pesadas de
 * renderização de HTML). Caso o projeto ainda não tenha jsPDF instalado:
 *
 *   npm install jspdf
 *
 * Este módulo implementa um parser de Markdown minimalista (títulos,
 * listas, tabelas em pipe e parágrafos) suficiente para o formato
 * produzido por `markdown.ts` — não é um renderizador de Markdown
 * genérico, propositalmente, para evitar dependências pesadas.
 */

import { jsPDF } from "jspdf";

const PAGE_MARGIN = 48;
const LINE_HEIGHT = 16;
const FONT_FAMILY = "helvetica";

interface Cursor {
  y: number;
}

function ensureSpace(doc: jsPDF, cursor: Cursor, needed: number): void {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (cursor.y + needed > pageHeight - PAGE_MARGIN) {
    doc.addPage();
    cursor.y = PAGE_MARGIN;
  }
}

function writeHeading(doc: jsPDF, cursor: Cursor, text: string, level: 1 | 2): void {
  ensureSpace(doc, cursor, LINE_HEIGHT * 2);
  doc.setFont(FONT_FAMILY, "bold");
  doc.setFontSize(level === 1 ? 18 : 13);
  doc.text(text, PAGE_MARGIN, cursor.y);
  cursor.y += level === 1 ? LINE_HEIGHT * 1.6 : LINE_HEIGHT * 1.3;
  doc.setFont(FONT_FAMILY, "normal");
  doc.setFontSize(10.5);
}

function writeParagraph(doc: jsPDF, cursor: Cursor, text: string): void {
  const maxWidth = doc.internal.pageSize.getWidth() - PAGE_MARGIN * 2;
  const wrapped = doc.splitTextToSize(text, maxWidth) as string[];
  wrapped.forEach((line) => {
    ensureSpace(doc, cursor, LINE_HEIGHT);
    doc.text(line, PAGE_MARGIN, cursor.y);
    cursor.y += LINE_HEIGHT;
  });
  cursor.y += LINE_HEIGHT * 0.4;
}

function writeListItem(doc: jsPDF, cursor: Cursor, text: string): void {
  const maxWidth = doc.internal.pageSize.getWidth() - PAGE_MARGIN * 2 - 14;
  const wrapped = doc.splitTextToSize(text, maxWidth) as string[];
  wrapped.forEach((line, i) => {
    ensureSpace(doc, cursor, LINE_HEIGHT);
    doc.text(i === 0 ? `•  ${line}` : `   ${line}`, PAGE_MARGIN, cursor.y);
    cursor.y += LINE_HEIGHT;
  });
}

function writeTable(doc: jsPDF, cursor: Cursor, rows: string[][]): void {
  if (rows.length === 0) return;
  const colCount = rows[0].length;
  const tableWidth = doc.internal.pageSize.getWidth() - PAGE_MARGIN * 2;
  const colWidth = tableWidth / colCount;

  rows.forEach((row, rowIndex) => {
    ensureSpace(doc, cursor, LINE_HEIGHT * 1.4);
    doc.setFont(FONT_FAMILY, rowIndex === 0 ? "bold" : "normal");
    row.forEach((cell, colIndex) => {
      doc.text(cell, PAGE_MARGIN + colIndex * colWidth, cursor.y);
    });
    doc.setFont(FONT_FAMILY, "normal");
    cursor.y += LINE_HEIGHT * 1.2;
    if (rowIndex === 0) {
      doc.setDrawColor(200);
      doc.line(PAGE_MARGIN, cursor.y - LINE_HEIGHT * 0.6, PAGE_MARGIN + tableWidth, cursor.y - LINE_HEIGHT * 0.6);
    }
  });
  cursor.y += LINE_HEIGHT * 0.4;
}

function isTableSeparatorRow(line: string): boolean {
  return /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?$/.test(line.trim());
}

function parseTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

/**
 * Renderiza o markdown do relatório em um documento jsPDF pronto para
 * download. Suporta: `#`/`##` (títulos), linhas iniciadas com `-` (listas),
 * tabelas em formato pipe e parágrafos simples.
 */
export function renderMarkdownToPdf(markdown: string, documentTitle: string): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const cursor: Cursor = { y: PAGE_MARGIN };

  doc.setProperties({ title: documentTitle });
  doc.setFont(FONT_FAMILY, "normal");
  doc.setFontSize(10.5);

  const lines = markdown.split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      cursor.y += LINE_HEIGHT * 0.5;
      i += 1;
      continue;
    }

    if (line.startsWith("# ")) {
      writeHeading(doc, cursor, line.replace(/^#\s+/, ""), 1);
      i += 1;
      continue;
    }

    if (line.startsWith("## ")) {
      writeHeading(doc, cursor, line.replace(/^##\s+/, ""), 2);
      i += 1;
      continue;
    }

    if (line.trim().startsWith("- ")) {
      writeListItem(doc, cursor, line.trim().replace(/^-\s+/, ""));
      i += 1;
      continue;
    }

    if (line.trim().startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i]);
        i += 1;
      }
      const rows = tableLines
        .filter((l) => !isTableSeparatorRow(l))
        .map(parseTableRow);
      writeTable(doc, cursor, rows);
      continue;
    }

    writeParagraph(doc, cursor, line.trim());
    i += 1;
  }

  return doc;
}

export function downloadPdf(markdown: string, fileName: string, documentTitle: string): void {
  const doc = renderMarkdownToPdf(markdown, documentTitle);
  doc.save(fileName);
}
