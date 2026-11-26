"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, Link2, Search } from "lucide-react";
import { DocIcon } from "@/features/stagebook/editor/doc-icon";
import { unwrapAction } from "@/lib/action-result";
import { getBacklinks, type BacklinkItem, type UnlinkedMention } from "../actions/blocks";
import { IntentLink } from "./intent-link";

/**
 * Rodapé da página: quem aponta para ela (menções/links) e quem cita o título
 * sem link — sugestões para conectar o conhecimento da equipe.
 */
export function BacklinksPanel({ documentId, title }: { documentId: string; title: string }) {
  const [data, setData] = useState<{ links: BacklinkItem[]; unlinked: UnlinkedMention[] } | null>(null);
  const [openUnlinked, setOpenUnlinked] = useState(false);

  const load = useCallback(() => {
    getBacklinks(documentId)
      .then((r) => setData(unwrapAction(r)))
      .catch(() => setData({ links: [], unlinked: [] }));
  }, [documentId]);

  useEffect(() => {
    load();
    const onVisible = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [load, title]);

  if (!data) return null;
  const { links, unlinked } = data;

  return (
    <section aria-label="Referências a esta página" className="no-print mt-10 border-t border-base-300/70 pt-5">
      <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-base-content/70">
        <Link2 size={15} />
        {links.length === 0 ? "Nenhuma página aponta para cá ainda" : `${links.length} ${links.length === 1 ? "página aponta" : "páginas apontam"} para cá`}
      </h2>
      {links.length === 0 && (
        <p className="text-xs text-base-content/50">
          Em outra página, digite <kbd className="kbd kbd-xs">@</kbd> ou <kbd className="kbd kbd-xs">[[</kbd> e escolha esta para criar um link.
        </p>
      )}
      <ul className="space-y-1.5">
        {links.map((l) => (
          <li key={l.id}>
            <IntentLink href={`/dashboard/documents/${l.id}`} className="group block rounded-lg px-2 py-1.5 hover:bg-base-200/60">
              <span className="flex items-center gap-1.5 text-sm font-medium">
                <DocIcon value={l.icon} size={15} />
                <span className="truncate group-hover:underline">{l.title}</span>
              </span>
              {l.snippets.map((s, i) => (
                <span key={i} className="mt-0.5 block truncate pl-6 text-xs text-base-content/55">
                  {s}
                </span>
              ))}
            </IntentLink>
          </li>
        ))}
      </ul>
      {unlinked.length > 0 && (
        <div className="mt-3">
          <button
            type="button"
            className="flex items-center gap-1.5 text-xs font-medium text-base-content/55 hover:text-base-content"
            aria-expanded={openUnlinked}
            onClick={() => setOpenUnlinked((v) => !v)}
          >
            <Search size={13} />
            Citada sem link em {unlinked.length} {unlinked.length === 1 ? "página" : "páginas"}
            <ChevronDown size={13} className={`transition-transform ${openUnlinked ? "rotate-180" : ""}`} />
          </button>
          {openUnlinked && (
            <ul className="mt-1.5 space-y-1">
              {unlinked.map((u) => (
                <li key={u.id}>
                  <IntentLink href={`/dashboard/documents/${u.id}`} className="block rounded-lg px-2 py-1.5 hover:bg-base-200/60">
                    <span className="flex items-center gap-1.5 text-sm">
                      <DocIcon value={u.icon} size={15} />
                      <span className="truncate">{u.title}</span>
                    </span>
                    <span className="mt-0.5 block pl-6 text-xs text-base-content/55">
                      {u.snippet.before}
                      <mark className="rounded bg-warning/30 px-0.5 text-inherit">{u.snippet.match}</mark>
                      {u.snippet.after}
                    </span>
                  </IntentLink>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
