"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Cpu, Plug, Plus, Radio, Trash2 } from "lucide-react";
import { deleteAnatixLab } from "@/app/(protected)/dashboard/labtest/anatix/actions";
import { fmtDate } from "@/components/labtest/shared";
import type { AnatixLabRecord } from "@/types/anatix.types";
import { AnatixLabForm } from "./AnatixLabForm";

const VIEW_LABEL = { charts: "Gráficos", maps: "Mapas", tables: "Tabelas" } as const;

export function AnatixModal({
  dialogRef,
  title,
  children,
}: {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box max-w-md">
        <h3 className="mb-4 text-lg font-black tracking-tight">{title}</h3>
        {children}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button aria-label="Fechar">fechar</button>
      </form>
    </dialog>
  );
}

function LabCard({ lab }: { lab: AnatixLabRecord }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function remove() {
    if (!confirm(`Excluir "${lab.name}" e todas as sessões gravadas?`)) return;
    startTransition(async () => {
      await deleteAnatixLab(lab.id);
      router.refresh();
    });
  }

  const views = (Object.keys(VIEW_LABEL) as (keyof typeof VIEW_LABEL)[]).filter(
    (k) => lab.config.views[k],
  );

  return (
    <article className="group relative flex min-h-56 flex-col gap-4 rounded-tl-3xl rounded-tr-lg rounded-br-3xl rounded-bl-lg border border-base-300 bg-base-100 p-5 transition hover:border-primary/40 hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Radio className="size-5" />
        </span>
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          className="btn btn-ghost btn-xs btn-square relative z-10 text-base-content/40 hover:text-error"
          aria-label={`Excluir ${lab.name}`}
        >
          {pending ? <span className="loading loading-spinner loading-xs" /> : <Trash2 size={14} />}
        </button>
      </div>

      <div className="min-w-0">
        <Link href={`/dashboard/labtest/anatix/${lab.id}`} className="after:absolute after:inset-0">
          <h3 className="truncate text-lg font-black tracking-tight">{lab.name}</h3>
        </Link>
        <p className="mt-1 line-clamp-2 text-sm text-base-content/60">
          {lab.description || "Sem descrição."}
        </p>
      </div>

      <div className="mt-auto flex flex-wrap gap-1.5">
        {views.map((v) => (
          <span key={v} className="badge badge-sm badge-ghost">
            {VIEW_LABEL[v]}
          </span>
        ))}
        <span className="badge badge-sm badge-ghost">{lab.config.baudRate} baud</span>
      </div>

      <div className="flex items-center justify-between border-t border-base-200 pt-3 text-xs text-base-content/50">
        <span className="flex items-center gap-1.5 truncate">
          <Cpu size={13} />
          {lab.robotName ? `${lab.robotName} · ${lab.board ?? "?"}` : "Nenhum robô conectado ainda"}
        </span>
        <span className="shrink-0">
          {lab.sessionCount} {lab.sessionCount === 1 ? "sessão" : "sessões"}
          {lab.lastConnectedAt ? ` · ${fmtDate(lab.lastConnectedAt)}` : ""}
        </span>
      </div>
    </article>
  );
}

export function AnatixLabSlots({ labs, max }: { labs: AnatixLabRecord[]; max: number }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [formKey, setFormKey] = useState(0);
  const free = Math.max(0, max - labs.length);

  function openCreate() {
    setFormKey((k) => k + 1);
    dialogRef.current?.showModal();
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {labs.map((lab) => (
          <LabCard key={lab.id} lab={lab} />
        ))}
        {Array.from({ length: free }, (_, i) => (
          <button
            key={`free-${i}`}
            type="button"
            onClick={openCreate}
            className="flex min-h-56 flex-col items-center justify-center gap-2 rounded-tl-3xl rounded-tr-lg rounded-br-3xl rounded-bl-lg border-2 border-dashed border-base-300 bg-base-100/50 p-5 text-base-content/50 transition hover:border-primary/50 hover:text-primary"
          >
            {i === 0 ? <Plus className="size-7" /> : <Plug className="size-6 opacity-50" />}
            <span className="text-sm font-semibold">
              {i === 0 ? "Novo laboratório Anatix" : "Espaço livre"}
            </span>
            <span className="text-xs">
              {labs.length + i + 1} de {max}
            </span>
          </button>
        ))}
      </div>

      <AnatixModal dialogRef={dialogRef} title="Novo laboratório Anatix">
        <AnatixLabForm key={formKey} onDone={() => dialogRef.current?.close()} />
      </AnatixModal>
    </>
  );
}
