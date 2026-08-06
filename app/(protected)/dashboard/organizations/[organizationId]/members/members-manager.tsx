"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Trash2, UserPlus, X } from "lucide-react";
import {
  inviteMemberAction,
  removeMemberAction,
  revokeInvitationAction,
  updateMemberRoleAction,
  type OrgRole,
} from "../actions";

type Member = {
  id: string;
  userId: string;
  name: string;
  identifier: string;
  imageUrl?: string;
  role: string;
};

type Invitation = {
  id: string;
  email: string;
  role: string;
};

export function MembersManager({
  organizationId,
  members,
  invitations,
}: {
  organizationId: string;
  members: Member[];
  invitations: Invitation[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<OrgRole>("org:member");
  const [error, setError] = useState<string | null>(null);

  function handleInvite(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPendingId("invite");

    startTransition(async () => {
      const result = await inviteMemberAction(
        organizationId,
        inviteEmail,
        inviteRole
      );

      if (!result.success) {
        setError(result.message ?? "Não foi possível enviar o convite.");
      } else {
        setInviteEmail("");
        router.refresh();
      }
      setPendingId(null);
    });
  }

  function handleRoleChange(userId: string, role: OrgRole) {
    setError(null);
    setPendingId(userId);

    startTransition(async () => {
      const result = await updateMemberRoleAction(
        organizationId,
        userId,
        role
      );
      if (!result.success) {
        setError(result.message ?? "Não foi possível atualizar o papel.");
      }
      router.refresh();
      setPendingId(null);
    });
  }

  function handleRemove(userId: string) {
    setError(null);
    setPendingId(userId);

    startTransition(async () => {
      const result = await removeMemberAction(organizationId, userId);
      if (!result.success) {
        setError(result.message ?? "Não foi possível remover o membro.");
      }
      router.refresh();
      setPendingId(null);
    });
  }

  function handleRevoke(invitationId: string) {
    setError(null);
    setPendingId(invitationId);

    startTransition(async () => {
      const result = await revokeInvitationAction(
        organizationId,
        invitationId
      );
      if (!result.success) {
        setError(result.message ?? "Não foi possível revogar o convite.");
      }
      router.refresh();
      setPendingId(null);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="alert alert-error text-sm">
          <span>{error}</span>
        </div>
      )}

      <form
        onSubmit={handleInvite}
        className="flex flex-col gap-3 rounded-2xl border border-base-300 bg-base-100 p-5 sm:flex-row sm:items-end"
      >
        <div className="form-control flex-1">
          <label className="label" htmlFor="invite-email">
            <span className="label-text">Convidar por e-mail</span>
          </label>
          <input
            id="invite-email"
            type="email"
            required
            value={inviteEmail}
            onChange={(event) => setInviteEmail(event.target.value)}
            placeholder="nome@empresa.com"
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control w-full sm:w-40">
          <label className="label" htmlFor="invite-role">
            <span className="label-text">Papel</span>
          </label>
          <select
            id="invite-role"
            value={inviteRole}
            onChange={(event) =>
              setInviteRole(event.target.value as OrgRole)
            }
            className="select select-bordered w-full"
          >
            <option value="org:member">Membro</option>
            <option value="org:admin">Administrador</option>
          </select>
        </div>

        <button
          type="submit"
          className="btn btn-primary gap-2"
          disabled={isPending}
        >
          {isPending && pendingId === "invite" ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <UserPlus size={16} />
          )}
          Convidar
        </button>
      </form>

      {invitations.length > 0 && (
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-base-content/70">
            <Mail size={15} /> Convites pendentes
          </h3>
          <ul className="divide-y divide-base-200">
            {invitations.map((invitation) => (
              <li
                key={invitation.id}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="text-sm font-medium">{invitation.email}</p>
                  <p className="text-xs text-base-content/50">
                    {invitation.role === "org:admin"
                      ? "Administrador"
                      : "Membro"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRevoke(invitation.id)}
                  disabled={isPending && pendingId === invitation.id}
                  className="btn btn-ghost btn-sm gap-1 text-error"
                >
                  {isPending && pendingId === invitation.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <X size={14} />
                  )}
                  Revogar
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100">
        <table className="table">
          <thead>
            <tr>
              <th>Membro</th>
              <th>Papel</th>
              <th className="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-base-200 text-sm font-semibold">
                      {member.imageUrl ? (
                        <img
                          src={member.imageUrl}
                          alt={member.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        getInitials(member.name)
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-base-content/50">
                        {member.identifier}
                      </p>
                    </div>
                  </div>
                </td>
                <td>
                  <select
                    value={member.role}
                    onChange={(event) =>
                      handleRoleChange(
                        member.userId,
                        event.target.value as OrgRole
                      )
                    }
                    disabled={isPending && pendingId === member.userId}
                    className="select select-bordered select-sm"
                  >
                    <option value="org:member">Membro</option>
                    <option value="org:admin">Administrador</option>
                  </select>
                </td>
                <td className="text-right">
                  <button
                    type="button"
                    onClick={() => handleRemove(member.userId)}
                    disabled={isPending && pendingId === member.userId}
                    className="btn btn-ghost btn-sm gap-1 text-error"
                  >
                    {isPending && pendingId === member.userId ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                    Remover
                  </button>
                </td>
              </tr>
            ))}

            {members.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="py-8 text-center text-sm text-base-content/50"
                >
                  Nenhum membro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  return `${first}${second}`.toUpperCase();
}
