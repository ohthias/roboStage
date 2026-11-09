"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw, Search, Trash2, X } from "lucide-react";
import { DocIcon } from "@/components/editor/doc-icon";
import { useToast } from "@/app/context/ToastContext";
import { unwrapAction } from "@/utils/stagebook/action-result";
import { TRASH_RETENTION_DAYS, trashDaysLeft } from "@/utils/stagebook/document-history";
import {
  deleteDocumentForever,
  emptyTrash,
  restoreDocument,
  type TrashedDocument,
} from "../history-actions";

const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

function relative(iso: string) {
  const diff = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
  const abs = Math.abs(diff);
  if (abs < 45) return "agora mesmo";
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
  return rtf.format(Math.round(diff / 86400), "day");
}

function DaysLeftBadge({ deletedAt }: { deletedAt: string }) {
  const days = trashDaysLeft(new Date(deletedAt));
  const urgent = days <= 1;
  return (
    <span
      className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${
        urgent ? "bg-error/10 text-error" : "bg-base-200 text-base-content/55"
      }`}
      title={`Apagada de vez em ${days} ${days === 1 ? "dia" : "dias"}`}
    >
      {days === 0 ? "Some hoje" : `${days} ${days === 1 ? "dia" : "dias"}`}
    </span>
  );
}

export function TrashView({ items }: { items: TrashedDocument[] }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) => item.title.toLowerCase().includes(q) || item.preview.toLowerCase().includes(q),
    );
  }, [items, query]);

  function run(id: string, fn: () => Promise<void>) {
    setBusyId(id);
    startTransition(async () => {
      try {
        await fn();
        router.refresh();
      } catch (error) {
        addToast(error instanceof Error ? error.message : "Não foi possível concluir a ação.", "error");
      } finally {
        setBusyId(null);
      }
    });
  }

  function restore(item: TrashedDocument) {
    run(item.id, async () => {
      unwrapAction(await restoreDocument(item.id));
      addToast(`“${item.title || "Sem título"}” foi restaurada.`, "success");
    });
  }

  function destroy(item: TrashedDocument) {
    if (!window.confirm(`Excluir “${item.title || "Sem título"}” para sempre? Isso não pode ser desfeito.`)) {
      return;
    }
    run(item.id, async () => {
      unwrapAction(await deleteDocumentForever(item.id));
      addToast("Página excluída para sempre.", "success");
    });
  }

  function empty() {
    if (
      !window.confirm(
        `Esvaziar a lixeira? ${items.length} ${items.length === 1 ? "página será excluída" : "páginas serão excluídas"} para sempre.`,
      )
    ) {
      return;
    }
    run("__all__", async () => {
      unwrapAction(await emptyTrash());
      addToast("Lixeira esvaziada.", "success");
    });
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-8 sm:py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-3xl font-black tracking-tight text-base-content">
            <Trash2 size={26} className="text-base-content/50" /> Lixeira
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-base-content/60">
            Páginas excluídas ficam aqui por {TRASH_RETENTION_DAYS} dias. Depois disso, são apagadas
            automaticamente — junto com o histórico de versões.
          </p>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            className="btn btn-ghost btn-sm gap-1.5 text-error"
            onClick={empty}
            disabled={busyId !== null}
          >
            {busyId === "__all__" ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Esvaziar lixeira
          </button>
        )}
      </header>

      {items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-base-300 px-6 py-16 text-center">
          <Trash2 size={28} className="mx-auto mb-3 text-base-content/20" />
          <p className="text-sm font-medium text-base-content/70">A lixeira está vazia</p>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-base-content/50">
            Quando você excluir uma página, ela aparece aqui e pode ser restaurada por {TRASH_RETENTION_DAYS} dias.
          </p>
        </div>
      ) : (
        <>
          {items.length > 5 && (
            <label className="input input-sm input-bordered mt-8 flex w-full items-center gap-2 sm:max-w-xs">
              <Search size={14} className="text-base-content/40" />
              <input
                type="search"
                className="grow"
                placeholder="Buscar na lixeira"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button type="button" aria-label="Limpar busca" onClick={() => setQuery("")}>
                  <X size={13} />
                </button>
              )}
            </label>
          )}

          <ul className="mt-6 divide-y divide-base-300/70 overflow-hidden rounded-2xl border border-base-300/70">
            {filtered.map((item) => {
              const busy = busyId === item.id;
              return (
                <li
                  key={item.id}
                  className={`flex flex-col gap-3 bg-base-100 px-4 py-3.5 transition-opacity sm:flex-row sm:items-center sm:gap-4 ${
                    busy ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-base-200 opacity-80">
                      <DocIcon value={item.icon} size={20} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">{item.title || "Sem título"}</span>
                        <DaysLeftBadge deletedAt={item.deletedAt} />
                      </div>
                      <p className="mt-0.5 truncate text-xs text-base-content/50">
                        Excluída {relative(item.deletedAt)}
                        {item.deletedByName ? ` por ${item.deletedByName}` : ""}
                        {item.preview ? ` · ${item.preview.replace(/\s+/g, " ")}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5 self-end sm:self-auto">
                    <button
                      type="button"
                      className="btn btn-sm gap-1.5"
                      onClick={() => restore(item)}
                      disabled={busyId !== null}
                    >
                      {busy ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                      Restaurar
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm btn-square text-base-content/50 hover:text-error"
                      onClick={() => destroy(item)}
                      disabled={busyId !== null}
                      aria-label={`Excluir ${item.title || "Sem título"} para sempre`}
                      title="Excluir para sempre"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="px-4 py-10 text-center text-sm text-base-content/50">
                Nada encontrado para “{query}”.
              </li>
            )}
          </ul>
        </>
      )}
    </div>
  );
}
