"use client";

import dynamic from "next/dynamic";

/**
 * Plugins só de interação (menus, barras flutuantes, galeria de modelos).
 * Nenhum deles é necessário para mostrar o conteúdo, então saem do bundle
 * inicial da página e carregam logo depois — o texto aparece antes.
 * Os nós (EDITOR_NODES) e os plugins que transformam conteúdo continuam
 * carregados de imediato.
 */
export const SlashMenuPlugin = dynamic(
  () => import("./slash-menu-plugin").then((m) => m.SlashMenuPlugin),
  { ssr: false },
);

export const BlockSelectionPlugin = dynamic(
  () => import("./block-selection-plugin").then((m) => m.BlockSelectionPlugin),
  { ssr: false },
);

export const ContextualToolsPlugin = dynamic(
  () => import("./contextual-tools-plugin").then((m) => m.ContextualToolsPlugin),
  { ssr: false },
);

export const TableToolsPlugin = dynamic(
  () => import("./table-tools-plugin").then((m) => m.TableToolsPlugin),
  { ssr: false },
);

export const CodeToolsPlugin = dynamic(
  () => import("./code-tools-plugin").then((m) => m.CodeToolsPlugin),
  { ssr: false },
);

export const TemplateGalleryPlugin = dynamic(
  () => import("./template-gallery-plugin").then((m) => m.TemplateGalleryPlugin),
  { ssr: false },
);
