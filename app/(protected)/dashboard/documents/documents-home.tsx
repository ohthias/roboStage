"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, FilePlus, FileText, Loader2, Sparkles } from "lucide-react";
import { DocIcon } from "@/components/editor/doc-icon";
import { bgVar, textVar } from "@/components/editor/editor-colors";
import { readRecentDocs } from "@/components/editor/recent-docs";
import { TEMPLATES, type DocTemplate } from "@/components/editor/templates";
import { templateToEditorState } from "@/components/editor/template-state";
import "@/components/editor/editor.css";
import { useToast } from "@/app/context/ToastContext";
import {
  createDocument,
  renameDocument,
  updateDocumentContent,
  updateDocumentIcon,
} from "./actions";

export type HomeDocument = {
  id: string;
  title: string;
  icon: string | null;
  updatedAt: string; // ISO
};

type RecentItem = HomeDocument & { at: number; opened: boolean };

const QUICK_LIMIT = 8;
const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

function relative(ts: number, now: number) {
  const diff = Math.round((ts - now) / 1000);
  const abs = Math.abs(diff);
  if (abs < 45) return "agora mesmo";
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
  if (abs < 86400 * 30) return rtf.format(Math.round(diff / 86400), "day");
  return rtf.format(Math.round(diff / (86400 * 30)), "month");
}

export function DocumentsHome({ docs }: { docs: HomeDocument[] }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [creating, setCreating] = useState<string | null>(null); // id do modelo | "blank"
  const [opened, setOpened] = useState<Record<string, number>>({});
  const [now, setNow] = useState<number | null>(null);

  // "Últimos acessados" vem do histórico local; o que nunca foi aberto aqui
  // entra por último, ordenado pela edição mais recente.
  useEffect(() => {
    const map: Record<string, number> = {};
    readRecentDocs().forEach((e) => (map[e.id] = e.at));
    setOpened(map);
    setNow(Date.now());
  }, []);

  const recents: RecentItem[] = useMemo(() => {
    const items = docs.map((d) => ({
      ...d,
      opened: d.id in opened,
      at: opened[d.id] ?? new Date(d.updatedAt).getTime(),
    }));
    const seen = items.filter((i) => i.opened).sort((a, b) => b.at - a.at);
    const rest = items.filter((i) => !i.opened).sort((a, b) => b.at - a.at);
    return [...seen, ...rest].slice(0, QUICK_LIMIT);
  }, [docs, opened]);

  async function create(tpl: DocTemplate | null) {
    if (creating) return;
    setCreating(tpl?.id ?? "blank");
    try {
      const created = await createDocument(null, null);
      if (!created) throw new Error("Não foi possível criar a página.");
      if (tpl) {
        await Promise.all([
          renameDocument(created.id, tpl.title),
          updateDocumentIcon(created.id, tpl.emoji),
          updateDocumentContent(created.id, templateToEditorState(tpl)),
        ]);
      }
      router.refresh();
      router.push(`/dashboard/documents/${created.id}`);
    } catch (error) {
      setCreating(null);
      addToast(error instanceof Error ? error.message : "Não foi possível criar a página.", "error");
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-1 py-4 sm:gap-10 sm:px-6 sm:py-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-base-content sm:text-4xl">
              Stage<span className="text-primary">Book</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-base-content/60 sm:text-base">
              Retome de onde parou ou comece algo novo a partir de um modelo.
            </p>
          </div>
        </header>

        <button
          type="button"
          className="btn btn-primary btn-sm gap-1.5"
          onClick={() => create(null)}
          disabled={creating !== null}
        >
          {creating === "blank" ? <Loader2 size={15} className="animate-spin" /> : <FilePlus size={15} />}
          Página em branco
        </button>
      </header>

      <section aria-labelledby="quick-access">
        <h2
          id="quick-access"
          className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-base-content/50"
        >
          <Clock size={14} /> Acesso rápido
        </h2>

        {recents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-base-300 px-4 py-10 text-center">
            <FileText size={22} className="mx-auto mb-2 text-base-content/25" />
            <p className="text-sm text-base-content/50">
              Você ainda não tem páginas. Crie a primeira com um dos modelos abaixo.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
            {recents.map((doc) => (
              <li key={doc.id}>
                <Link
                  href={`/dashboard/documents/${doc.id}`}
                  className="group flex h-full flex-col gap-3 rounded-xl border border-base-300 bg-base-100 p-3.5 transition hover:-translate-y-0.5 hover:border-base-content/20 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-base-200">
                    <DocIcon value={doc.icon} size={22} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium group-hover:text-primary">
                      {doc.title || "Sem título"}
                    </span>
                    <span className="mt-0.5 block text-xs text-base-content/45">
                      {now === null
                        ? " "
                        : `${doc.opened ? "Aberto" : "Editado"} ${relative(doc.at, now)}`}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="quick-create">
        <h2
          id="quick-create"
          className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-base-content/50"
        >
          Criar a partir de um modelo
        </h2>

        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((tpl) => {
            const busy = creating === tpl.id;
            return (
              <li key={tpl.id}>
                <button
                  type="button"
                  onClick={() => create(tpl)}
                  disabled={creating !== null}
                  className="group flex h-full w-full items-start gap-3 rounded-xl border border-base-300 bg-base-100 p-3.5 text-left transition hover:-translate-y-0.5 hover:border-base-content/20 hover:shadow-md disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-xl"
                    style={{ background: bgVar(tpl.accent), color: textVar(tpl.accent) }}
                  >
                    {busy ? <Loader2 size={18} className="animate-spin" /> : tpl.emoji}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{tpl.title}</span>
                    <span className="mt-0.5 block text-xs text-base-content/55">{tpl.description}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
