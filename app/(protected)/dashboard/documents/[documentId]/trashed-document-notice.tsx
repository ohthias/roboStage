"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, RotateCcw, Trash2 } from "lucide-react";
import { DocIcon } from "@/components/editor/doc-icon";
import { useToast } from "@/app/context/ToastContext";
import { unwrapAction } from "@/utils/stagebook/action-result";
import { trashDaysLeft } from "@/utils/stagebook/document-history";
import { deleteDocumentForever, restoreDocument } from "../history-actions";

/** Mostrada quando alguém abre (por link ou histórico) uma página que está na lixeira. */
export function TrashedDocumentNotice({
  documentId,
  title,
  icon,
  deletedAt,
}: {
  documentId: string;
  title: string;
  icon: string | null;
  deletedAt: string;
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [pending, startTransition] = useTransition();
  const daysLeft = trashDaysLeft(new Date(deletedAt));

  function restore() {
    startTransition(async () => {
      try {
        unwrapAction(await restoreDocument(documentId));
        addToast("Página restaurada.", "success");
        router.refresh();
      } catch (error) {
        addToast(error instanceof Error ? error.message : "Não foi possível restaurar.", "error");
      }
    });
  }

  function destroy() {
    if (!window.confirm("Excluir esta página para sempre? Isso não pode ser desfeito.")) return;
    startTransition(async () => {
      try {
        unwrapAction(await deleteDocumentForever(documentId));
        router.push("/dashboard/documents/trash");
      } catch (error) {
        addToast(error instanceof Error ? error.message : "Não foi possível excluir.", "error");
      }
    });
  }

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
      <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-base-200 opacity-70">
        <DocIcon value={icon} size={36} />
      </span>
      <h1 className="text-2xl font-bold tracking-tight text-base-content">{title || "Sem título"}</h1>
      <p className="mt-2 text-sm text-base-content/60">
        Esta página está na lixeira.{" "}
        {daysLeft > 0
          ? `Ela será apagada de vez em ${daysLeft} ${daysLeft === 1 ? "dia" : "dias"}.`
          : "Ela será apagada de vez hoje."}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <button type="button" className="btn btn-primary btn-sm gap-1.5" onClick={restore} disabled={pending}>
          {pending ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
          Restaurar página
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm gap-1.5 text-error"
          onClick={destroy}
          disabled={pending}
        >
          <Trash2 size={14} />
          Excluir para sempre
        </button>
      </div>

      <Link
        href="/dashboard/documents/trash"
        className="mt-8 inline-flex items-center gap-1.5 text-xs text-base-content/50 hover:text-base-content"
      >
        <ArrowLeft size={13} /> Ir para a lixeira
      </Link>
    </div>
  );
}
