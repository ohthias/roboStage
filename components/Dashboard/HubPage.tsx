"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DashboardStats } from "./DashboardStats";
const supabase = createClient();

type LastAccessItem = {
  resource_type: "test" | "event" | "document" | "style";
  resource_id: string;
  title: string;
  last_access: string;
};

interface HubHeroProps {
  session: any;
  username: string;
}

const RESOURCE_CONFIG = {
  test: {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="size-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    badge: "badge-primary",
    label: "Teste",
    href: (id: string) => `/dashboard/labtest/${id}`,
  },
  event: {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="size-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
    badge: "badge-secondary",
    label: "Evento",
    href: (id: string) => `/showlive/${id}`,
  },
  document: {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="size-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    badge: "badge-accent",
    label: "Documento",
    href: (id: string) => `/innolab/${id}`,
  },
  style: {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="size-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
        />
      </svg>
    ),
    badge: "badge-warning",
    label: "Estilo",
    href: (id: string) => `/dashboard/stylelab/${id}`,
  },
};

const QUICK_ACTIONS = [
  {
    label: "Novo Teste",
    description: "Crie uma avaliação",
    href: "/tests/new",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="size-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    colorClass: "text-primary",
    bgClass: "bg-primary/10",
  },
  {
    label: "Novo Evento",
    description: "Agende uma atividade",
    href: "/events/new",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="size-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
    colorClass: "text-secondary",
    bgClass: "bg-secondary/10",
  },
  {
    label: "Novo Documento",
    description: "Escreva um conteúdo",
    href: "/documents/new",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="size-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
    colorClass: "text-accent",
    bgClass: "bg-accent/10",
  },
  {
    label: "Novo Estilo",
    description: "Personalize o visual",
    href: "/styles/new",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="size-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
        />
      </svg>
    ),
    colorClass: "text-warning",
    bgClass: "bg-warning/10",
  },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora mesmo";
  if (mins < 60) return `${mins}min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d atrás`;
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

export default function HubHero({ session, username }: HubHeroProps) {
  const [lastAccess, setLastAccess] = useState<LastAccessItem[]>([]);
  const [loadingAccess, setLoadingAccess] = useState(true);
  const [stats, setStats] = useState([
    { label: "Testes Criados", value: 0 },
    { label: "Documentos", value: 0 },
    { label: "Eventos Criados", value: 0 },
    { label: "Estilos Personalizados", value: 0 },
  ]);

  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!session?.user?.id || fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchLastAccessedResources = async () => {
      const { data, error } = await supabase
        .from("user_last_access")
        .select("resource_type, resource_id, title, last_access")
        .eq("user_id", session.user.id)
        .order("last_access", { ascending: false })
        .limit(6);

      if (!error && data) setLastAccess(data);
      setLoadingAccess(false);
    };

    const fetchStats = async () => {
      const { data, error } = await supabase
        .from("user_activity_summary")
        .select("total_tests, total_documents, total_eventos, total_themes")
        .eq("user_id", session.user.id)
        .single();

      if (!error && data) {
        setStats([
          { label: "Testes Criados", value: data.total_tests },
          { label: "Documentos", value: data.total_documents },
          { label: "Eventos Criados", value: data.total_eventos },
          { label: "Estilos Personalizados", value: data.total_themes },
        ]);
      }
    };

    fetchStats();
    fetchLastAccessedResources();
  }, [session?.user?.id]);

  const initials = username
    ? username
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      {/* ── Hero banner ── */}
      <header className="px-6 pt-6 pb-2">
        <div className="relative overflow-hidden rounded-2xl bg-base-100 border border-base-300 shadow-sm px-6 py-7">
          {/* decorative dots */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(circle, currentColor 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          {/* accent strip */}
          <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-primary via-secondary to-accent rounded-t-2xl" />

          <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Avatar */}
            <div className="avatar placeholder shrink-0">
              <div className="bg-primary text-primary-content rounded-full w-14 h-14 text-lg font-semibold flex items-center justify-center text-center">
                <span>{initials}</span>
              </div>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-base-content/40 mb-0.5">
                Painel de controle · RoboStage
              </p>
              <h1 className="text-2xl font-bold tracking-tight truncate">
                {greeting}, <span className="text-primary">{username}</span> 👋
              </h1>
              <p className="text-sm text-base-content/55 mt-0.5">
                Retome suas atividades e acesse seus recursos rapidamente.
              </p>
            </div>

            {/* Date pill */}
            <div className="hidden lg:flex items-center gap-2 badge badge-ghost badge-lg font-medium self-start sm:self-center py-3 px-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-4 opacity-60"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "2-digit",
                month: "long",
              })}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-6 px-6 py-6">
        {/* Left column: stats + quick actions */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Stats */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-3 px-0.5">
              Resumo de atividade
            </h2>
            <DashboardStats stats={stats} />
          </section>

          {/* Quick actions */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-3 px-0.5">
              Ações rápidas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {QUICK_ACTIONS.map((action) => (
                <a
                  key={action.label}
                  href={action.href}
                  className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30 transition-all duration-200 group"
                >
                  <div className="card-body flex-row items-center gap-4 p-5">
                    <div
                      className={`p-3 rounded-xl ${action.bgClass} shrink-0 group-hover:scale-110 transition-transform duration-200`}
                    >
                      <span className={action.colorClass}>{action.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm">{action.label}</p>
                      <p className="text-xs text-base-content/50 truncate">
                        {action.description}
                      </p>
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="size-4 ml-auto text-base-content/20 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </section>
        </div>

        {/* Right column: recent access */}
        <aside className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-base-content/40 px-0.5">
            Acessos recentes
          </h2>

          <div className="card bg-base-100 border border-base-300 shadow-sm flex-1">
            <div className="card-body p-0">
              {loadingAccess ? (
                <ul className="divide-y divide-base-200">
                  {[...Array(5)].map((_, i) => (
                    <li key={i} className="flex items-center gap-3 px-5 py-4">
                      <div className="skeleton w-8 h-8 rounded-lg shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="skeleton h-3 w-3/4 rounded" />
                        <div className="skeleton h-2.5 w-1/3 rounded" />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : lastAccess.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-3">
                  <div className="p-4 bg-base-200 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="size-8 text-base-content/25"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-base-content/40">
                    Nenhum acesso recente
                  </p>
                  <p className="text-xs text-base-content/30">
                    Seus recursos visitados aparecerão aqui.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-base-200">
                  {lastAccess.map((item) => {
                    const cfg = RESOURCE_CONFIG[item.resource_type];
                    return (
                      <li key={`${item.resource_type}-${item.resource_id}`}>
                        <a
                          href={cfg.href(item.resource_id)}
                          className="flex items-center gap-3 px-5 py-3.5 hover:bg-base-200/70 transition-colors group"
                        >
                          <div
                            className={`p-2 rounded-lg bg-base-200 group-hover:bg-base-300 transition-colors shrink-0`}
                          >
                            <span className="text-base-content/60">
                              {cfg.icon}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate leading-tight">
                              {item.title}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className={`badge badge-xs ${cfg.badge} badge-outline`}
                              >
                                {cfg.label}
                              </span>
                              <span className="text-xs text-base-content/35">
                                ·
                              </span>
                              <span className="text-xs text-base-content/40">
                                {timeAgo(item.last_access)}
                              </span>
                            </div>
                          </div>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="size-3.5 text-base-content/20 group-hover:text-base-content/50 group-hover:translate-x-0.5 transition-all shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </aside>
      </main>

      {/* ── Footer ── */}
      <footer className="flex items-center justify-between px-6 py-4 border-t border-base-300 mt-auto">
        <p className="text-xs text-base-content/30 font-medium">
          RoboStage © {new Date().getFullYear()}
        </p>
        <span className="badge badge-ghost badge-sm font-mono text-base-content/30">
          v5.0.0
        </span>
      </footer>
    </div>
  );
}
