"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/**
 * Filtra os documentos já renderizados no servidor. Cada card tem
 * `data-doc` (texto pesquisável); grupos e temporadas usam `data-doc-group`
 * e somem quando ficam vazios. Sem JS, a página continua completa.
 */
export default function DocsSearch({ total }: { total: number }) {
  const [q, setQ] = useState("");
  const [visible, setVisible] = useState(total);
  const input = useRef<HTMLInputElement>(null);

  // Mostra/esconde os cards no DOM e devolve quantos ficaram visíveis.
  const apply = (value: string) => {
    const term = norm(value.trim());
    let count = 0;
    document.querySelectorAll<HTMLElement>("[data-doc]").forEach((el) => {
      const show = !term || norm(el.dataset.doc ?? "").includes(term);
      el.hidden = !show;
      if (show) count++;
    });
    document.querySelectorAll<HTMLElement>("[data-doc-group]").forEach((g) => {
      g.hidden = !g.querySelector("[data-doc]:not([hidden])");
    });
    setQ(value);
    setVisible(count);
  };

  // Atalho "/" para focar a busca, como em outras áreas da plataforma.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(t.tagName) && !t.isContentEditable) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div>
      <label className="flex items-center gap-3 rounded-tl-xl rounded-br-xl border border-base-300 bg-base-100 px-4 py-3 transition-colors focus-within:border-primary">
        <Search size={18} className="shrink-0 text-base-content/40" />
        <input
          ref={input}
          type="search"
          value={q}
          onChange={(e) => apply(e.target.value)}
          placeholder="Buscar documento…"
          aria-label="Buscar documentos"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-base-content/40"
        />
        {q ? (
          <button type="button" onClick={() => apply("")} aria-label="Limpar busca" className="text-base-content/40 hover:text-base-content">
            <X size={16} />
          </button>
        ) : (
          <kbd className="kbd kbd-sm hidden sm:inline-flex">/</kbd>
        )}
      </label>
      <p aria-live="polite" className="mt-2 font-mono text-[11px] text-base-content/45">
        {q ? `${visible} de ${total} documentos` : `${total} documentos`}
      </p>
      {q && visible === 0 && (
        <p className="mt-3 rounded-tl-lg rounded-br-lg border border-dashed border-base-content/25 px-3 py-2 text-sm text-base-content/60">
          Nada encontrado para “{q}”.
        </p>
      )}
    </div>
  );
}
