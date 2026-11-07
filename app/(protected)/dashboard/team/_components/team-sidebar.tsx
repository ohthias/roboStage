import Link from "next/link";
import { Check, ChevronRight, Minus, Settings, ShieldCheck, type LucideIcon } from "lucide-react";
import { ROLE_META, roleCan, type TeamCapability, type TeamRole } from "@/utils/stagebook/team-permissions";
import { RoleBadge } from "./role-badge";
import { PersonAvatar, TeamAvatar } from "./team-avatar";
import { CORNER } from "./team-ui";

const CAPABILITY_ROWS: { capability: TeamCapability; label: string }[] = [
  { capability: "tool.create", label: "Ver e criar Kanbans, ThinkLabs e LabTests" },
  { capability: "session.run", label: "Conduzir treinos e marcar presença" },
  { capability: "milestone.manage", label: "Criar e editar os marcos" },
  { capability: "roster.manage", label: "Escala de competições e funções" },
  { capability: "session.delete.any", label: "Excluir sessões de outras pessoas" },
  { capability: "team.edit", label: "Editar nome, foto e perfil" },
  { capability: "team.members.manage", label: "Convidar, remover e trocar cargos" },
  { capability: "team.delete", label: "Excluir a equipe" },
];

export type SidebarTab = { id: string; label: string; Icon: LucideIcon; count?: number };

/**
 * Painel esquerdo do workspace (inspirado em dashboards de cursos): identidade
 * da equipe, navegação vertical das seções, o que o seu cargo permite, dois
 * números rápidos e o seu cartão. Em telas pequenas vira um cabeçalho com as
 * seções numa faixa rolável.
 */
export function TeamSidebar({
  team,
  logoUrl,
  subtitle,
  tabs,
  activeTab,
  role,
  canEditTeam,
  stats,
  viewer,
}: {
  team: { id: string; name: string };
  logoUrl: string | null;
  subtitle: string;
  tabs: SidebarTab[];
  activeTab: string;
  role: TeamRole;
  canEditTeam: boolean;
  stats: { value: number; label: string; href: string }[];
  viewer: { name: string | null; avatarUrl: string | null } | null;
}) {
  const base = `/dashboard/team/${team.id}`;

  return (
    <aside className="border-b border-base-300 lg:border-b-0 lg:border-r max-h-[calc(100vh-3.5rem)] lg:overflow-y-auto">
      <div className="flex flex-col gap-5 p-4 lg:p-5">
        {/* Identidade */}
        <div className="flex items-center gap-3">
          <TeamAvatar name={team.name} imageUrl={logoUrl} size="md" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-bold leading-tight">{team.name}</h1>
            {subtitle && <p className="truncate text-[11px] text-base-content/50">{subtitle}</p>}
          </div>
          {canEditTeam && (
            <Link
              href={`${base}/settings`}
              className="btn btn-ghost btn-sm btn-square lg:hidden"
              aria-label="Gerenciar equipe"
            >
              <Settings size={16} />
            </Link>
          )}
        </div>

        {/* Seções */}
        <nav aria-label="Seções da equipe" className="-mx-4 lg:mx-0">
          <ul className="flex gap-1 overflow-x-auto px-4 lg:flex-col lg:px-0">
            {tabs.map(({ id, label, Icon, count }) => {
              const active = id === activeTab;
              return (
                <li key={id} className="shrink-0">
                  <Link
                    href={`${base}?tab=${id}`}
                    aria-current={active ? "page" : undefined}
                    className={`group relative flex items-center gap-2.5 whitespace-nowrap px-3 py-2 text-sm transition-colors ${CORNER.sm} ${
                      active
                        ? "bg-primary/10 font-semibold text-primary"
                        : "text-base-content/60 hover:bg-base-200 hover:text-base-content"
                    }`}
                  >
                    {active && (
                      <span aria-hidden="true" className="absolute -left-4 top-1/2 hidden h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary lg:block" />
                    )}
                    <Icon size={16} className={active ? "" : "opacity-70"} />
                    <span className="flex-1">{label}</span>
                    {count !== undefined && (
                      <span className={`font-mono text-[11px] ${active ? "text-primary/70" : "text-base-content/35"}`}>
                        {count}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hidden flex-col gap-5 lg:flex">
          {/* Cargo (como o "Updated Course" da referência) */}
          <div className={`bg-base-200/70 p-3 ${CORNER.md}`}>
            <div className="flex items-center gap-2.5">
              <span className={`flex size-8 items-center justify-center bg-secondary text-secondary-content ${CORNER.sm}`}>
                <ShieldCheck size={15} />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold">Seu cargo</p>
                <RoleBadge role={role} size="xs" />
              </div>
            </div>
            <p className="mt-2 text-[11px] leading-snug text-base-content/55">{ROLE_META[role].description}</p>
            <details className="group mt-2">
              <summary className="flex cursor-pointer list-none items-center gap-1 font-mono text-[10px] tracking-wider text-base-content/45 hover:text-base-content">
                <ChevronRight size={11} className="transition-transform group-open:rotate-90" />O QUE POSSO FAZER
              </summary>
              <ul className="mt-2 space-y-1 text-[11px]">
                {CAPABILITY_ROWS.map(({ capability, label }) => {
                  const allowed = roleCan(role, capability);
                  return (
                    <li key={capability} className={`flex items-start gap-1.5 ${allowed ? "" : "text-base-content/35"}`}>
                      {allowed ? (
                        <Check size={11} className="mt-0.5 shrink-0 text-success" />
                      ) : (
                        <Minus size={11} className="mt-0.5 shrink-0" />
                      )}
                      {label}
                    </li>
                  );
                })}
              </ul>
            </details>
            {canEditTeam && (
              <Link href={`${base}/settings`} className="btn btn-ghost btn-xs mt-2 w-full justify-start gap-1.5">
                <Settings size={12} /> Gerenciar equipe
              </Link>
            )}
          </div>

          {/* Números rápidos */}
          <div className="grid grid-cols-2 gap-2">
            {stats.map((s, i) => (
              <Link
                key={s.label}
                href={s.href}
                className={`group bg-base-200/70 p-3 transition-colors hover:bg-base-200 ${CORNER.md}`}
              >
                <span
                  className={`mb-3 block size-2 rounded-full ${i === 0 ? "bg-primary" : "bg-accent"}`}
                  aria-hidden="true"
                />
                <p className="font-mono text-lg font-bold leading-none">{s.value}</p>
                <p className="mt-1 text-[11px] text-base-content/50">{s.label}</p>
              </Link>
            ))}
          </div>

          {/* Você */}
          {viewer && (
            <div className={`flex items-center gap-2.5 bg-base-200/70 p-2.5 ${CORNER.md}`}>
              <PersonAvatar name={viewer.name} imageUrl={viewer.avatarUrl} size="size-9" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{viewer.name ?? "Você"}</p>
                <p className="text-[11px] text-base-content/50">{ROLE_META[role].label}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
