import type { ReactNode } from "react";

/**
 * Área de equipes. A troca entre equipes (e o espaço pessoal) fica na barra
 * lateral do dashboard; aqui é só o conteúdo: o hub ou o workspace da equipe.
 */
export default function TeamLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-[calc(100vh-3.5rem)] bg-base-100">{children}</div>;
}
