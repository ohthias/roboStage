"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FileText, Loader2, NotebookPen, Plus } from "lucide-react";
import { createDocumentAction } from "./actions";

type DocSummary = {
  id: string;
  title: string;
  updatedAt: Date;
};

export function DocumentsSidebar({
  organizationId,
  documents,
}: {
  organizationId: string;
  documents: DocSummary[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCreate() {
    setError(null);
    startTransition(async () => {
      const result = await createDocumentAction(organizationId);

      if (result.success && result.data) {
        router.push(
          `/dashboard/organizations/${organizationId}/documents/${result.data.id}`
        );
        router.refresh();
      } else {
        setError(result.message ?? "Não foi possível criar o documento.");
      }
    });
  }

  return (
    <aside className="flex h-fit flex-col gap-3 rounded-2xl border border-base-300 bg-base-100 p-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-base-content/70">
        <NotebookPen size={15} /> Caderno da equipe
      </h2>

      <button
        type="button"
        onClick={handleCreate}
        disabled={isPending}
        className="btn btn-primary btn-sm gap-2"
      >
        {isPending ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Plus size={14} />
        )}
        Novo documento
      </button>

      {error && <p className="text-xs text-error">{error}</p>}

      <ul className="mt-1 flex flex-col gap-1">
        {documents.map((doc) => {
          const href = `/dashboard/organizations/${organizationId}/documents/${doc.id}`;
          const isActive = pathname === href;

          return (
            <li key={doc.id}>
              <Link
                href={href}
                className={[
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                  isActive
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-base-content/70 hover:bg-base-200",
                ].join(" ")}
              >
                <FileText size={14} className="shrink-0" />
                <span className="truncate">{doc.title || "Sem título"}</span>
              </Link>
            </li>
          );
        })}

        {documents.length === 0 && (
          <li className="px-3 py-6 text-center text-xs text-base-content/40">
            Nenhum documento ainda.
          </li>
        )}
      </ul>
    </aside>
  );
}
