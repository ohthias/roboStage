import Link from "next/link";
import { Check, ChevronDown, ChevronRight, Minus, Settings, type LucideIcon } from "lucide-react";
import { ROLE_META, roleCan, type TeamCapability, type TeamRole } from "@/utils/stagebook/team-permissions";
import { TeamAvatar } from "./team-avatar";

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

export type HeaderTab = { id: string; label: string; Icon: LucideIcon; count?: number };

/**
 * Cabeçalho do workspace da equipe. A troca de equipe fica na barra lateral do
 * dashboard (é o "espaço"); aqui só fica o que é DESTA equipe: identidade,
 * cargo, gerenciar e as seções em abas — fixas no topo ao rolar.
 */
export function TeamHeader({
  team,
  logoUrl,
  subtitle,
  tabs,
  activeTab,
  role,
  canEditTeam,
}: {
  team: { id: string; name: string };
  logoUrl: string | null;
  subtitle: string;
  tabs: HeaderTab[];
  activeTab: string;
  role: TeamRole;
  canEditTeam: boolean;
}) {
  const base = `/dashboard/team/${team.id}`;

  return (
    <>
      <header className="border-b border-base-300/70 bg-base-100 px-4 pb-3 pt-4 sm:px-6">
        <nav aria-label="Caminho" className="mb-2 flex items-center gap-1 text-xs text-base-content/45">
          <Link href="/dashboard/team?view=all" className="hover:text-primary">
            Equipes
          </Link>
          <ChevronRight size={12} />
          <span className="truncate text-base-content/70">{team.name}</span>
        </nav>

        <div className="flex items-center gap-3">
          <TeamAvatar name={team.name} imageUrl={logoUrl} size="md" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold leading-tight tracking-tight sm:text-xl">{team.name}</h1>
            {subtitle && <p className="truncate text-xs text-base-content/50">{subtitle}</p>}
          </div>

          {/* Cargo: abre o que ele permite */}
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-sm gap-1 rounded-full border border-base-300 px-3 font-medium"
              aria-label={`Seu cargo: ${ROLE_META[role].label}. Ver permissões`}
            >
              <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
              {ROLE_META[role].label}
              <ChevronDown size={13} className="opacity-50" />
            </div>
            <div
              tabIndex={0}
              className="dropdown-content z-40 mt-2 w-72 rounded-xl border border-base-300 bg-base-100 p-3 shadow-xl"
            >
              <p className="font-mono text-[10px] tracking-[0.18em] text-base-content/40">/ SEU CARGO</p>
              <p className="mt-1 text-sm font-semibold">{ROLE_META[role].label}</p>
              <p className="mt-0.5 text-xs text-base-content/55">{ROLE_META[role].description}</p>
              <ul className="mt-3 space-y-1.5 text-xs">
                {CAPABILITY_ROWS.map(({ capability, label }) => {
                  const allowed = roleCan(role, capability);
                  return (
                    <li key={capability} className={`flex items-start gap-2 ${allowed ? "" : "text-base-content/35"}`}>
                      {allowed ? (
                        <Check size={12} className="mt-0.5 shrink-0 text-success" />
                      ) : (
                        <Minus size={12} className="mt-0.5 shrink-0" />
                      )}
                      {label}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {canEditTeam && (
            <Link href={`${base}/settings`} className="btn btn-ghost btn-sm btn-square" aria-label="Gerenciar equipe" title="Gerenciar equipe">
              <Settings size={16} />
            </Link>
          )}
        </div>
      </header>

      {/* Seções: fixas sob a barra superior ao rolar */}
      <nav
        aria-label="Seções da equipe"
        className="sticky top-14 z-10 border-b border-base-300/70 bg-base-100/95 px-2 backdrop-blur sm:px-4"
      >
        <ul className="flex gap-1 overflow-x-auto">
          {tabs.map(({ id, label, Icon, count }) => {
            const active = id === activeTab;
            return (
              <li key={id} className="shrink-0">
                <Link
                  href={`${base}?tab=${id}`}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex h-11 items-center gap-2 whitespace-nowrap px-3 text-sm transition-colors ${
                    active ? "font-semibold text-base-content" : "text-base-content/55 hover:text-base-content"
                  }`}
                >
                  <Icon size={15} className={active ? "text-primary" : "opacity-70"} />
                  {label}
                  {count !== undefined && count > 0 && (
                    <span className="font-mono text-[10px] text-base-content/40">{count}</span>
                  )}
                  {active && (
                    <span aria-hidden="true" className="absolute inset-x-2 bottom-0 h-[2px] rounded-full bg-primary" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
