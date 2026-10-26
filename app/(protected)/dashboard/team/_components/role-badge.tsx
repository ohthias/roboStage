import { ROLE_META, isTeamRole } from "@/utils/stagebook/team-permissions";

// Classes completas (o Tailwind não enxerga nomes montados com template string).
const SIZE_CLASS = { xs: "badge-xs", sm: "badge-sm" } as const;

/** Selo do cargo na equipe (Técnico, Mentor, Competidor, Colaborador). */
export function RoleBadge({ role, size = "sm" }: { role: string; size?: keyof typeof SIZE_CLASS }) {
  const base = `badge ${SIZE_CLASS[size]}`;
  if (!isTeamRole(role)) return <span className={`${base} badge-ghost`}>{role}</span>;
  const meta = ROLE_META[role];
  return <span className={`${base} ${meta.badgeClass}`}>{meta.label}</span>;
}
