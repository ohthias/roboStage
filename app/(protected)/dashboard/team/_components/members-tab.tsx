"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, Info, Loader2, Mail, ShieldCheck, Trash2, UserPlus, X } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import {
  checkEmailRegisteredInClerk,
  inviteTeamMember,
  removeTeamMember,
  revokeInvitation,
  updateTeamMemberRole,
  type PendingInvitation,
} from "../actions";
import {
  ROLE_META,
  TEAM_ROLES,
  assignableRolesFor,
  memberChangeError,
  roleCan,
  type TeamRole,
} from "@/utils/stagebook/team-permissions";
import type { TeamMemberSummary } from "@/types/team-workspace";
import { PersonAvatar } from "./team-avatar";
import { RoleBadge } from "./role-badge";
import { ConfirmDialog } from "@/components/stagebook/modal";

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

type EmailCheck = { forEmail: string; registered: boolean; name: string | null };

/**
 * Membros da equipe. Todos veem a lista; técnico e mentor convidam, trocam
 * cargos e removem (respeitando `memberChangeError`: só técnico mexe em técnico).
 */
export function MembersTab({
  teamId,
  viewerId,
  viewerRole,
  members,
  invitations,
}: {
  teamId: string;
  viewerId: string;
  viewerRole: TeamRole;
  members: TeamMemberSummary[];
  invitations: PendingInvitation[];
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const canManage = roleCan(viewerRole, "team.members.manage");
  const assignable = assignableRolesFor(viewerRole);
  const ownersCount = members.filter((m) => m.role === "owner").length;

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("competidor");
  const [emailCheck, setEmailCheck] = useState<EmailCheck | null>(null);
  const [removing, setRemoving] = useState<TeamMemberSummary | null>(null);

  const trimmed = email.trim();
  const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
  const checking = looksLikeEmail && emailCheck?.forEmail !== trimmed;

  // Informativo (não bloqueia o convite): já tem conta no RoboStage?
  useEffect(() => {
    if (!canManage || !looksLikeEmail) return;
    const timeout = setTimeout(async () => {
      const result = await checkEmailRegisteredInClerk(teamId, trimmed);
      if (result.ok && result.data.valid) {
        setEmailCheck({ forEmail: trimmed, registered: result.data.registered, name: result.data.name });
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [canManage, looksLikeEmail, trimmed, teamId]);

  function run(task: () => Promise<{ ok: true } | { ok: false; error: string }>, success: string, after?: () => void) {
    startTransition(async () => {
      const result = await task();
      if (!result.ok) {
        addToast(result.error, "error");
        return;
      }
      addToast(success, "success");
      after?.();
      router.refresh();
    });
  }

  function invite() {
    if (!looksLikeEmail) {
      addToast("Informe um e-mail válido.", "error");
      return;
    }
    run(() => inviteTeamMember(teamId, trimmed, role), "Convite enviado.", () => {
      setEmail("");
      setEmailCheck(null);
    });
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Membros</h2>
          <p className="text-sm text-base-content/60">
            {members.length} {members.length === 1 ? "pessoa" : "pessoas"} na equipe
          </p>
        </div>
      </div>

      {/* Convidar */}
      {canManage && (
        <div className="card border border-base-300 bg-base-100">
          <div className="card-body gap-3 p-4">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <UserPlus size={15} className="text-primary" /> Convidar pessoa
              </h3>
              <p className="text-xs text-base-content/50">O convite chega por e-mail, pelo Clerk.</p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="input w-full sm:flex-1">
                <Mail size={14} className="opacity-50" />
                <input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && invite()}
                />
              </label>
              <select
                className="select w-full sm:w-44"
                value={role}
                onChange={(e) => setRole(e.target.value as TeamRole)}
                aria-label="Cargo do convidado"
              >
                {assignable.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_META[r].label}
                  </option>
                ))}
              </select>
              <button type="button" className="btn btn-primary gap-1.5" onClick={invite} disabled={isPending || !trimmed}>
                {isPending ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
                Convidar
              </button>
            </div>

            <p className="min-h-4 text-xs" aria-live="polite">
              {checking && (
                <span className="flex items-center gap-1.5 text-base-content/45">
                  <Loader2 size={12} className="animate-spin" /> Verificando se já tem conta…
                </span>
              )}
              {!checking && emailCheck?.forEmail === trimmed && emailCheck.registered && (
                <span className="flex items-center gap-1.5 text-success">
                  <CheckCircle2 size={12} /> Já tem conta{emailCheck.name ? ` — ${emailCheck.name}` : ""}.
                </span>
              )}
              {!checking && emailCheck?.forEmail === trimmed && !emailCheck.registered && (
                <span className="flex items-center gap-1.5 text-base-content/50">
                  <Info size={12} /> Ainda não tem conta — vai criar uma ao aceitar.
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Convites pendentes */}
      {canManage && invitations.length > 0 && (
        <div className="card border border-base-300 bg-base-100">
          <div className="card-body gap-2 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Clock size={15} className="text-warning" /> Convites pendentes
              <span className="badge badge-warning badge-soft badge-sm">{invitations.length}</span>
            </h3>
            <ul className="divide-y divide-base-200">
              {invitations.map((inv) => (
                <li key={inv.id} className="flex items-center justify-between gap-3 py-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-sm">{inv.emailAddress}</span>
                    <RoleBadge role={inv.role} size="xs" />
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs btn-square text-base-content/40 hover:bg-error/10 hover:text-error"
                    title="Cancelar convite"
                    aria-label={`Cancelar convite de ${inv.emailAddress}`}
                    disabled={isPending}
                    onClick={() => run(() => revokeInvitation(teamId, inv.id), "Convite cancelado.")}
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tabela de membros */}
      <div className="card overflow-hidden border border-base-300 bg-base-100">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Cargo</th>
                <th className="hidden sm:table-cell">Entrou em</th>
                {canManage && <th className="w-12" />}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const isSelf = member.userId === viewerId;
                const locked = memberChangeError(viewerRole, member.role, null) !== null;
                const lastOwner = member.role === "owner" && ownersCount <= 1;
                const options = TEAM_ROLES.filter((r) => assignable.includes(r) || r === member.role);

                return (
                  <tr key={member.userId} className="hover:bg-base-200/40">
                    <td>
                      <div className="flex items-center gap-3">
                        <PersonAvatar name={member.name} imageUrl={member.avatarUrl} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {member.name ?? "Sem nome"}
                            {isSelf && <span className="ml-1.5 text-xs font-normal text-base-content/40">(você)</span>}
                          </p>
                          {member.email && <p className="truncate text-xs text-base-content/45">{member.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td>
                      {canManage && !locked ? (
                        <select
                          className="select select-sm w-36"
                          value={member.role}
                          disabled={isPending || lastOwner}
                          title={lastOwner ? "A equipe precisa de ao menos um técnico." : undefined}
                          aria-label={`Cargo de ${member.name ?? "membro"}`}
                          onChange={(e) =>
                            run(
                              () => updateTeamMemberRole(teamId, member.userId, e.target.value as TeamRole),
                              "Cargo atualizado.",
                            )
                          }
                        >
                          {options.map((r) => (
                            <option key={r} value={r}>
                              {ROLE_META[r].label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <RoleBadge role={member.role} />
                      )}
                    </td>
                    <td className="hidden text-sm text-base-content/55 sm:table-cell" suppressHydrationWarning>
                      {fmt(member.joinedAt)}
                    </td>
                    {canManage && (
                      <td className="text-right">
                        {!isSelf && !locked && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs btn-square text-base-content/35 hover:bg-error/10 hover:text-error"
                            title="Remover da equipe"
                            aria-label={`Remover ${member.name ?? "membro"} da equipe`}
                            disabled={isPending}
                            onClick={() => setRemoving(member)}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* O que cada cargo pode */}
      <div className="collapse collapse-arrow border border-base-300 bg-base-100">
        <input type="checkbox" aria-label="Mostrar o que cada cargo pode fazer" />
        <div className="collapse-title flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck size={15} className="text-primary" /> O que cada cargo pode fazer
        </div>
        <div className="collapse-content">
          <ul className="space-y-2 pt-1 text-sm">
            {TEAM_ROLES.map((r) => (
              <li key={r} className="flex items-start gap-2">
                <RoleBadge role={r} />
                <span className="text-base-content/60">{ROLE_META[r].description}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ConfirmDialog
        open={removing !== null}
        title={`Remover ${removing?.name ?? "membro"}?`}
        description="A pessoa perde o acesso à equipe e a todos os seus recursos. Você pode convidá-la de novo depois."
        confirmLabel="Remover"
        pending={isPending}
        onCancel={() => setRemoving(null)}
        onConfirm={() => {
          const target = removing;
          if (!target) return;
          run(() => removeTeamMember(teamId, target.userId), "Membro removido da equipe.", () => setRemoving(null));
        }}
      />
    </section>
  );
}
