import { NotebookPen } from "lucide-react";

export default function DocumentsIndexPage() {
  return (
    <div className="flex h-full min-h-[560px] flex-col items-center justify-center gap-3 p-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <NotebookPen size={24} />
      </div>
      <div>
        <h3 className="font-semibold">Selecione ou crie um documento</h3>
        <p className="max-w-sm text-sm text-base-content/60">
          Use o caderno da equipe para registrar decisões, atas de reunião e
          anotações — tudo salvo automaticamente.
        </p>
      </div>
    </div>
  );
}