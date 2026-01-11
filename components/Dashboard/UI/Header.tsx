"use client";

import Logo from "@/components/UI/Logo";
import { ThemeController } from "@/components/UI/themeController";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/utils/supabase/client";

/* =========================
   Tipagem
========================= */
type GlobalSearchItem = {
  id: string;
  entity_type: "user" | "document" | "test" | "folder" | "team" | "events";
  title: string;
  subtitle?: string;
};

/* =========================
   Utils – Highlight
========================= */
function highlightText(text: string, query: string) {
  if (!query) return text;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");

  return text.split(regex).map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark
        key={i}
        className="bg-primary/20 text-primary font-medium rounded px-0.5"
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}

/* =========================
   Utils – Fuzzy (Levenshtein)
========================= */
function levenshtein(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      matrix[i][j] =
        a[i - 1] === b[j - 1]
          ? matrix[i - 1][j - 1]
          : Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
    }
  }

  return matrix[a.length][b.length];
}

function similarity(a: string, b: string) {
  const distance = levenshtein(a, b);
  return 1 - distance / Math.max(a.length, b.length);
}

/* =========================
   Componente
========================= */
export default function HeaderDashboard({
  collapsed,
  onToggleSidebar,
  onLogout,
  onMobileMenu,
}: {
  collapsed: boolean;
  onToggleSidebar: () => void;
  onLogout: () => void;
  onMobileMenu: () => void;
}) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GlobalSearchItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [tab, setTab] = useState<"content" | "users">("content");

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* =========================
     Busca (RPC)
  ========================= */
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);

      const { data, error } = await supabase.rpc("search_global", {
        q: query,
      });

      setLoading(false);

      if (!error && data) {
        setResults(data as GlobalSearchItem[]);
        setOpen(true);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  /* =========================
     Agrupamento + Fuzzy
  ========================= */
  const finalResults = useMemo(() => {
    const q = query.toLowerCase();

    const scored = results.map((r) => ({
      ...r,
      score: similarity(q, r.title.toLowerCase()),
    }));

    const priority = scored
      .filter((r) => r.score >= 0.50)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    if (priority.length > 0) return priority;

    if (tab === "users") {
      return scored
        .filter((r) => r.entity_type === "user")
        .slice(0, 5);
    }

    return scored
      .filter((r) => r.entity_type !== "user")
      .slice(0, 6);
  }, [results, query, tab]);

  useEffect(() => {
    setActiveIndex(0);
  }, [finalResults]);

  /* =========================
     Teclado
  ========================= */
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || finalResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, finalResults.length - 1));
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    }

    if (e.key === "Enter") {
      e.preventDefault();
      handleRedirect(finalResults[activeIndex]);
    }
  }

  useEffect(() => {
    function close(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  function handleRedirect(item: GlobalSearchItem) {
    setOpen(false);
    setQuery("");

    switch (item.entity_type) {
      case "user":
        router.push(`/u/${item.title}`);
        break;
      case "document":
        router.push(`/innolab/${item.id}`);
        break;
      case "test":
        router.push(`/dashboard/labtest/${item.id}`);
        break;
      case "folder":
        router.push(`/dashboard/folders/${item.id}`);
        break;
      case "team":
        router.push(`/team/${item.id}`);
        break;
      case "events":
        router.push(`/showlive/${item.id}`);
        break;
    }
  }

  return (
    <header className="h-16 bg-base-100 border-b border-base-300 flex items-center px-6 justify-between col-span-2">
      <div className="flex items-center gap-2">
        <button className="lg:hidden btn btn-ghost btn-circle" onClick={onMobileMenu}>
          <Menu size={20} />
        </button>

        <button
          className="hidden lg:flex btn btn-ghost btn-circle"
          onClick={onToggleSidebar}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>

        <Logo logoSize="md" />
      </div>

      <div className="flex items-center gap-2">
        <div ref={containerRef} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 z-2" size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar usuários, documentos, testes..."
            className="input input-sm input-bordered rounded-full w-72 pl-10"
          />

          {open && (
            <div className="absolute mt-2 w-full bg-base-100 rounded-lg shadow-xl z-50 overflow-hidden">
              <div className="flex text-xs border-b">
                <button
                  onClick={() => setTab("content")}
                  className={`flex-1 px-3 py-2 ${
                    tab === "content" ? "bg-base-200 font-medium" : ""
                  }`}
                >
                  Conteúdos
                </button>
                <button
                  onClick={() => setTab("users")}
                  className={`flex-1 px-3 py-2 ${
                    tab === "users" ? "bg-base-200 font-medium" : ""
                  }`}
                >
                  Usuários
                </button>
              </div>

              {loading && (
                <div className="px-4 py-3 text-sm opacity-60">Buscando…</div>
              )}

              {!loading && finalResults.length === 0 && (
                <div className="px-4 py-3 text-sm opacity-60">
                  Nenhum resultado encontrado
                </div>
              )}

              {!loading &&
                finalResults.map((item, i) => (
                  <button
                    key={`${item.entity_type}-${item.id}`}
                    onClick={() => handleRedirect(item)}
                    className={`w-full px-4 py-2 text-left ${
                      i === activeIndex
                        ? "bg-primary/10"
                        : "hover:bg-base-200"
                    }`}
                  >
                    <div className="font-medium">
                      {highlightText(item.title, query)}
                    </div>
                    <div className="text-xs opacity-60 capitalize">
                      {item.entity_type}
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>

        <button className="btn btn-ghost btn-circle btn-sm">
          <Bell size={20} />
        </button>

        <ThemeController />

        <button onClick={onLogout} className="btn btn-error btn-soft btn-circle btn-sm">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}