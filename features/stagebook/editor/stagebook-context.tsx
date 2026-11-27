"use client";

import { createContext, useContext } from "react";

/** Evento global: abre a paleta já buscando o texto (detail = termo). */
export const STAGEBOOK_SEARCH_EVENT = "stagebook:search";

export type StagebookPage = { id: string; title: string; icon: string | null; href: string };

export type StagebookEditorContextValue = {
  /** Página aberta no editor. */
  documentId: string;
  /** Páginas do espaço (para menções e para mostrar o título atual). */
  pages: StagebookPage[];
  navigate: (href: string) => void;
};

const Ctx = createContext<StagebookEditorContextValue | null>(null);

export const StagebookEditorProvider = Ctx.Provider;

/** Dados da página/espaço para blocos que precisam deles (menções, sincronizados). */
export function useStagebookEditor(): StagebookEditorContextValue {
  return (
    useContext(Ctx) ?? {
      documentId: "",
      pages: [],
      navigate: (href: string) => {
        window.location.href = href;
      },
    }
  );
}
