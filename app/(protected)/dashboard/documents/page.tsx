import { NotebookPen } from "lucide-react";

export default function NotebookIndexPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <NotebookPen size={40} className="text-base-content/30" />
      <h1 className="text-lg font-semibold">Selecione ou crie uma página</h1>
      <p className="max-w-sm text-sm text-base-content/60">
        Use o menu à esquerda para abrir uma anotação existente, ou crie uma pasta e uma página
        novas pelos botões no topo da árvore.
      </p>
    </div>
  );
}