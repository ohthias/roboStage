"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Info,
  Loader2,
  Mail,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import {
  checkEmailRegisteredInClerk,
  inviteTeamMember,
  removeTeamMember,
  revokeInvitation,
  updateTeamMemberRole,
  type AssignableRole,
} from "./actions";
import { useToast } from "@/app/context/ToastContext";

type Member = {
  userId: string;
  name: string | null;
  avatarUrl: string | null;
  role: string;
  joinedAt: Date | string;
};
type Invitation = {
  id: string;
  emailAddress: string;
  role: AssignableRole;
  createdAt: Date | string;
};

const ROLE_LABEL: Record<string, string> = {
  owner: "Técnico",
  competidor: "Competidor",
};

const ASSIGNABLE_ROLES: { value: AssignableRole; label: string }[] = [
  { value: "tecnico", label: "Técnico" },
  { value: "competidor", label: "Competidor" },
];

function initials(name: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function MemberManagement({
  teamId,
  members,
  invitations,
}: {
  teamId: string;
  members: Member[];
  invitations: Invitation[];
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AssignableRole>("competidor");
  const [emailCheck, setEmailCheck] = useState<{
    forEmail: string;
    registered: boolean;
    name: string | null;
  } | null>(null);

  const trimmedEmail = email.trim();
  const isValidEmailFormat = trimmedEmail.includes("@");
  const isCheckingEmail =
    isValidEmailFormat && emailCheck?.forEmail !== trimmedEmail;

  // Verifica se o e-mail já é cadastrado no Clerk, com um pequeno debounce
  // pra não disparar uma checagem a cada tecla digitada. É só informativo —
  // não bloqueia o convite em nenhum dos dois casos (ver actions.ts).
  useEffect(() => {
    if (!isValidEmailFormat) return;

    const timeout = setTimeout(async () => {
      try {
        const result = await checkEmailRegisteredInClerk(teamId, trimmedEmail);
        if (result.valid) {
          setEmailCheck({
            forEmail: trimmedEmail,
            registered: result.registered,
            name: result.name,
          });
        }
      } catch {
        // silencioso — é só um indicativo visual, não impede o convite
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [trimmedEmail, isValidEmailFormat, teamId]);

  function handleInvite() {
    const clean = email.trim();
    if (!clean) return;
    startTransition(async () => {
      try {
        await inviteTeamMember(teamId, clean, role);
        setEmail("");
        setEmailCheck(null);
        addToast("Convite enviado com sucesso.", "success");
        router.refresh();
      } catch (error) {
        addToast(
          error instanceof Error
            ? error.message
            : "Não foi possível enviar o convite.",
          "error",
        );
      }
    });
  }

  function handleRevoke(invitationId: string) {
    startTransition(async () => {
      try {
        await revokeInvitation(teamId, invitationId);
        addToast("Convite cancelado.", "success");
        router.refresh();
      } catch (error) {
        addToast(error instanceof Error ? error.message : "Não foi possível cancelar o convite.", "error");
      }
    });
  }

  function handleRoleChange(userId: string, nextRole: AssignableRole) {
    startTransition(async () => {
      try {
        await updateTeamMemberRole(teamId, userId, nextRole);
        addToast("Papel atualizado com sucesso.", "success");
        router.refresh();
      } catch (error) {
        addToast(
          error instanceof Error
            ? error.message
            : "Não foi possível alterar o papel.",
          "error",
        );
      }
    });
  }

  function handleRemove(userId: string, name: string | null) {
    if (!window.confirm(`Remover ${name ?? "este membro"} da equipe?`)) return;
    startTransition(async () => {
      try {
        await removeTeamMember(teamId, userId);
        addToast("Membro removido da equipe.", "success");
        router.refresh();
      } catch (error) {
        addToast(
          error instanceof Error
            ? error.message
            : "Não foi possível remover o membro.",
          "error",
        );
      }
    });
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-base-300 bg-base-100">
      {/* Cabeçalho */}
      <div className="border-b border-base-300 px-5 py-5">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users size={16} />
          </div>

          <div className="min-w-0">
            <h2 className="font-semibold text-base-content">
              Gerenciar membros
            </h2>

            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-base-content/50">
              Só você, como técnico responsável, pode convidar, remover ou
              trocar o papel de alguém.
            </p>
          </div>
        </div>
      </div>

      {/* Convite */}
      <div className="border-b border-base-300 px-5 py-5">
        <div className="mb-3">
          <p className="text-xs font-semibold text-base-content">
            Convidar membro
          </p>

          <p className="mt-0.5 text-[11px] text-base-content/40">
            Envie um convite para adicionar uma nova pessoa à equipe.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
          {/* E-mail */}
          <div className="flex min-w-0 items-center gap-2 rounded-lg border border-base-300 bg-base-100 px-3 transition-colors focus-within:border-primary/40">
            <Mail size={14} className="shrink-0 text-base-content/40" />

            <input
              className="input input-sm min-w-0 flex-1 border-none bg-transparent px-0 focus:outline-none focus:ring-0"
              placeholder="email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleInvite()}
              type="email"
            />
          </div>

          {/* Papel */}
          <select
            className="select select-bordered select-sm w-full sm:w-auto"
            value={role}
            onChange={(e) => setRole(e.target.value as AssignableRole)}
          >
            {ASSIGNABLE_ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>

          {/* Botão */}
          <button
            type="button"
            className="btn btn-primary btn-sm gap-1.5 px-4"
            onClick={handleInvite}
            disabled={isPending}
          >
            <UserPlus size={14} />
            Convidar
          </button>
        </div>

        {/* Verificação do e-mail */}
        <div className="mt-2 min-h-[18px] pl-1 text-xs">
          {isCheckingEmail && (
            <span className="flex items-center gap-1.5 text-base-content/40">
              <Loader2 size={12} className="animate-spin" />
              Verificando se este e-mail já tem conta...
            </span>
          )}

          {!isCheckingEmail &&
            emailCheck?.forEmail === trimmedEmail &&
            emailCheck.registered && (
              <span className="flex items-start gap-1.5 text-success">
                <CheckCircle2 size={12} className="mt-0.5 shrink-0" />

                <span>
                  Já tem conta
                  {emailCheck.name ? ` — ${emailCheck.name}` : ""}. Vai receber
                  o convite direto.
                </span>
              </span>
            )}

          {!isCheckingEmail &&
            emailCheck?.forEmail === trimmedEmail &&
            !emailCheck.registered && (
              <span className="flex items-start gap-1.5 text-base-content/45">
                <Info size={12} className="mt-0.5 shrink-0" />

                <span>
                  Ainda não tem conta no RoboStage — vai criar uma ao aceitar o
                  convite.
                </span>
              </span>
            )}
        </div>
      </div>

      {/* Convites pendentes */}
      {invitations.length > 0 && (
        <div className="border-b border-base-300 px-5 py-4">
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-base-content/35">
                Convites pendentes
              </p>

              <p className="mt-0.5 text-xs text-base-content/40">
                {invitations.length}{" "}
                {invitations.length === 1
                  ? "convite aguardando"
                  : "convites aguardando"}
              </p>
            </div>

            <Clock size={15} className="shrink-0 text-warning" />
          </div>

          <ul className="flex flex-col gap-1.5">
            {invitations.map((inv) => (
              <li
                key={inv.id}
                className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-base-300 bg-base-100 px-3 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
                    <Clock size={13} />
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-base-content">
                      {inv.emailAddress}
                    </p>

                    <span className="badge badge-ghost badge-xs mt-1">
                      {ROLE_LABEL[inv.role]}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-ghost btn-xs btn-square shrink-0 text-base-content/40 hover:bg-error/10 hover:text-error"
                  title="Cancelar convite"
                  onClick={() => handleRevoke(inv.id)}
                >
                  <X size={13} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Membros */}
      <div>
        <div className="border-b border-base-300 px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-base-content">
                Membros da equipe
              </p>

              <p className="mt-0.5 text-[11px] text-base-content/40">
                {members.length} {members.length === 1 ? "pessoa" : "pessoas"}{" "}
                vinculadas
              </p>
            </div>

            <span className="badge badge-neutral badge-sm">
              {members.length}
            </span>
          </div>
        </div>

        <ul className="divide-y divide-base-300/70">
          {members.map((member) => (
            <li
              key={member.userId}
              className="flex min-w-0 items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-base-200/40"
            >
              {/* Identificação */}
              <div className="flex min-w-0 items-center gap-3">
                <img src={member.avatarUrl ?? "/images/avatar-placeholder.png"} alt="" className="h-8 w-8 rounded-full object-cover" />

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-base-content">
                    {member.name ?? "Sem nome"}
                  </p>

                  {member.role === "owner" && (
                    <p className="mt-0.5 text-[10px] text-base-content/40">
                      Técnico responsável
                    </p>
                  )}
                </div>
              </div>

              {/* Ações */}
              {member.role === "owner" ? (
                <span className="badge badge-primary badge-sm shrink-0">
                  {ROLE_LABEL.owner}
                </span>
              ) : (
                <div className="flex shrink-0 items-center gap-1.5">
                  <select
                    className="select select-bordered select-xs"
                    value={member.role}
                    onChange={(e) =>
                      handleRoleChange(
                        member.userId,
                        e.target.value as AssignableRole,
                      )
                    }
                    disabled={isPending}
                    aria-label={`Papel de ${member.name ?? "membro"}`}
                  >
                    {ASSIGNABLE_ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="btn btn-ghost btn-xs btn-square text-base-content/35 hover:bg-error/10 hover:text-error"
                    title="Remover da equipe"
                    onClick={() => handleRemove(member.userId, member.name)}
                    disabled={isPending}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
