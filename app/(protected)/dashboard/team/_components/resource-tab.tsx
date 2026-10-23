"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Loader2, Plus, Search, Trash2, User } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import { MilestoneChip } from "@/components/stagebook/labels/milestone-chip";
import {
  createTeamBoard,
  createTeamLabTest,
  createTeamThinkLab,
  deleteTeamBoard,
  deleteTeamLabTest,
  deleteTeamThinkLab,
} from "@/utils/stagebook/actions/team-resources";
import { canDeleteResource, roleCan, type TeamRole } from "@/utils/stagebook/team-permissions";
import type { MilestoneRef } from "@/types/team-workspace";
import {
  RESOURCE_META,
  TEST_MODE_LABEL,
  TEST_MODE_OPTIONS,
  TEST_STATUS_META,
  type ResourceKind,
} from "./resource-meta";
import { ConfirmDialog, Modal } from "@/components/stagebook/modal";

export type ResourceItem = {
  id: string;
  name: string;
  description: string | null;
  createdBy: string;
  creatorName: string | null;
  updatedAt: string;
  cardCount?: number;
  mode?: string;
  status?: string;
  season?: string | null;
  milestone?: MilestoneRef | null;
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

// Prazo de milestone é uma data sem hora (meia-noite UTC).
const fmtDue = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });

const norm = (v: string) => v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/**
 * Lista + criação + exclusão de um tipo de recurso da equipe (Kanban,
 * ThinkLab ou LabTest). A UI só esconde o que o cargo não pode — a barreira
 * real está nas Server Actions.
 */
export function ResourceTab({
  teamId,
  kind,
  items,
  milestones,
  viewerId,
  viewerRole,
}: {
  teamId: string;
  kind: ResourceKind;
  items: ResourceItem[];
  /** Milestones da equipe, para vincular ao criar (ThinkLab e LabTest). */
  milestones: MilestoneRef[];
  viewerId: string;
  viewerRole: TeamRole;
}) {
  const meta = RESOURCE_META[kind];
  const router = useRouter();
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<ResourceItem | null>(null);

  // Formulário de criação
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState<string>("runs");
  const [season, setSeason] = useState("");
  const [milestoneId, setMilestoneId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const canCreate = roleCan(viewerRole, "tool.create");
  const hasMilestone = kind !== "kanban";

  const shown = useMemo(() => {
    const q = norm(search.trim());
    return q ? items.filter((i) => norm(i.name).includes(q) || norm(i.description ?? "").includes(q)) : items;
  }, [items, search]);

  function closeCreate() {
    setCreating(false);
    setError(null);
    setName("");
    setDescription("");
    setMode("runs");
    setSeason("");
    setMilestoneId("");
  }

  function submitCreate() {
    setError(null);
    if (!name.trim()) {
      setError("Informe um nome.");
      return;
    }
    startTransition(async () => {
      const base = { name, description: description || null };
      const result =
        kind === "kanban"
          ? await createTeamBoard(teamId, base)
          : kind === "thinklab"
            ? await createTeamThinkLab(teamId, { ...base, milestoneId: milestoneId || null })
            : await createTeamLabTest(teamId, {
                ...base,
                mode,
                season: season || null,
                milestoneId: milestoneId || null,
              });

      if (!result.ok) {
        setError(result.error);
        return;
      }
      addToast("Criado com sucesso.", "success");
      closeCreate();
      router.refresh();
    });
  }

  function confirmDelete() {
    const target = toDelete;
    if (!target) return;
    startTransition(async () => {
      const result =
        kind === "kanban"
          ? await deleteTeamBoard(teamId, target.id)
          : kind === "thinklab"
            ? await deleteTeamThinkLab(teamId, target.id)
            : await deleteTeamLabTest(teamId, target.id);

      if (!result.ok) {
        addToast(result.error, "error");
      } else {
        addToast("Excluído com sucesso.", "success");
        router.refresh();
      }
      setToDelete(null);
    });
  }

  const Icon = meta.Icon;

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{meta.title}</h2>
          <p className="text-sm text-base-content/60">{meta.subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          {items.length > 5 && (
            <label className="input input-sm w-52">
              <Search size={14} className="opacity-50" />
              <input
                type="search"
                placeholder="Buscar…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          )}
          {canCreate && (
            <button type="button" className="btn btn-primary btn-sm gap-1.5" onClick={() => setCreating(true)}>
              <Plus size={15} />
              {meta.newLabel}
            </button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card border border-dashed border-base-300 bg-base-100">
          <div className="card-body items-center py-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon size={22} />
            </span>
            <h3 className="font-semibold">{meta.emptyTitle}</h3>
            <p className="max-w-sm text-sm text-base-content/55">{meta.emptyText}</p>
            {canCreate && (
              <button type="button" className="btn btn-primary btn-sm mt-2 gap-1.5" onClick={() => setCreating(true)}>
                <Plus size={15} />
                {meta.newLabel}
              </button>
            )}
          </div>
        </div>
      ) : shown.length === 0 ? (
        <p className="py-10 text-center text-sm text-base-content/50">Nada encontrado para “{search}”.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((item) => {
            const deletable = canDeleteResource(viewerRole, item.createdBy, viewerId);
            const status = item.status ? TEST_STATUS_META[item.status] : null;
            return (
              <li key={item.id} className="card border border-base-300 bg-base-100 transition-shadow hover:shadow-md">
                <div className="card-body gap-3 p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold" title={item.name}>
                        {item.name}
                      </h3>
                      <p className="line-clamp-2 min-h-8 text-xs text-base-content/55">
                        {item.description || "Sem descrição."}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {kind === "kanban" && (
                      <span className="badge badge-ghost badge-sm">
                        {item.cardCount ?? 0} {item.cardCount === 1 ? "card" : "cards"}
                      </span>
                    )}
                    {kind === "labtest" && item.mode && (
                      <span className="badge badge-info badge-soft badge-sm">
                        {TEST_MODE_LABEL[item.mode] ?? item.mode}
                      </span>
                    )}
                    {status && <span className={`badge badge-soft badge-sm ${status.badgeClass}`}>{status.label}</span>}
                    {item.season && <span className="badge badge-ghost badge-sm">{item.season}</span>}
                    {item.milestone && <MilestoneChip milestone={item.milestone} size="xs" />}
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-base-200 pt-3">
                    <p className="flex min-w-0 items-center gap-1 text-[11px] text-base-content/45">
                      <User size={11} className="shrink-0" />
                      <span className="truncate">{item.creatorName ?? "Alguém"}</span>
                      <span aria-hidden="true">·</span>
                      <span suppressHydrationWarning>{fmt(item.updatedAt)}</span>
                    </p>
                    <div className="flex shrink-0 items-center gap-1">
                      {deletable && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs btn-square text-base-content/40 hover:bg-error/10 hover:text-error"
                          title="Excluir"
                          aria-label={`Excluir ${item.name}`}
                          onClick={() => setToDelete(item)}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      <Link href={meta.href(item.id)} className="btn btn-primary btn-soft btn-xs gap-1">
                        Abrir
                        <ExternalLink size={11} />
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Criar */}
      <Modal open={creating} onClose={closeCreate} title={meta.newLabel} description="Fica disponível para toda a equipe.">
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            submitCreate();
          }}
        >
          <label className="fieldset">
            <span className="fieldset-legend">{meta.nameLabel}</span>
            <input
              autoFocus
              className="input w-full"
              placeholder={meta.namePlaceholder}
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          {kind === "labtest" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="fieldset">
                <span className="fieldset-legend">Modo</span>
                <select className="select w-full" value={mode} onChange={(e) => setMode(e.target.value)}>
                  {TEST_MODE_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {TEST_MODE_LABEL[m]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="fieldset">
                <span className="fieldset-legend">Temporada (opcional)</span>
                <input
                  className="input w-full"
                  placeholder="Herda a da equipe"
                  maxLength={40}
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                />
              </label>
            </div>
          )}

          <label className="fieldset">
            <span className="fieldset-legend">Descrição (opcional)</span>
            <textarea
              className="textarea h-20 w-full"
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          {hasMilestone && milestones.length > 0 && (
            <label className="fieldset">
              <span className="fieldset-legend">Marco (opcional)</span>
              <select className="select w-full" value={milestoneId} onChange={(e) => setMilestoneId(e.target.value)}>
                <option value="">Sem marco</option>
                {milestones.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                    {m.dueAt ? ` — ${fmtDue(m.dueAt)}` : ""}
                  </option>
                ))}
              </select>
            </label>
          )}

          {error && (
            <div role="alert" className="alert alert-error alert-soft py-2 text-sm">
              {error}
            </div>
          )}

          <div className="modal-action">
            <button type="button" className="btn btn-ghost btn-sm" onClick={closeCreate} disabled={isPending}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={isPending || !name.trim()}>
              {isPending && <Loader2 size={14} className="animate-spin" />}
              Criar
            </button>
          </div>
        </form>
      </Modal>

      {/* Excluir */}
      <ConfirmDialog
        open={toDelete !== null}
        title={`Excluir “${toDelete?.name ?? ""}”?`}
        description={
          kind === "kanban"
            ? "As colunas e todos os cards deste kanban serão apagados. Não pode ser desfeito."
            : kind === "labtest"
              ? "Todas as execuções registradas neste teste serão apagadas. Não pode ser desfeito."
              : "O conteúdo deste quadro será apagado. Não pode ser desfeito."
        }
        pending={isPending}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </section>
  );
}
