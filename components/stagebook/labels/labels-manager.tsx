"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Check,
  Flag,
  GitMerge,
  Palette,
  Pencil,
  Plus,
  Search,
  Tags as TagsIcon,
  Trash2,
  X,
} from "lucide-react";
import {
  createTag,
  deleteTag,
  listTagsWithUsage,
  mergeTags,
  updateTag,
} from "@/utils/stagebook/actions/tags";
import {
  createMilestone,
  deleteMilestone,
  listMilestonesWithUsage,
  updateMilestone,
} from "@/utils/stagebook/actions/milestones";
import { resolveLabelColor } from "@/utils/stagebook/label-colors";
import {
  LABELABLE_KINDS,
  LABELABLE_LABELS,
  type LabelableKind,
  type MilestoneWithUsage,
  type TagWithUsage,
} from "@/types/labels";
import { LabelColorPicker } from "./color-picker";
import { MilestoneChip } from "./milestone-chip";
import { TagChip } from "./tag-chip";

const norm = (v: string) => v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function UsageSummary({ usage, total }: { usage: Record<LabelableKind, number>; total: number }) {
  if (total === 0) return <span className="text-xs text-base-content/40">Sem uso</span>;
  return (
    <span className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-base-content/55">
      {LABELABLE_KINDS.filter((k) => usage[k] > 0).map((k) => (
        <span key={k}>
          <strong className="font-semibold text-base-content/75">{usage[k]}</strong> {LABELABLE_LABELS[k].toLowerCase()}
        </span>
      ))}
    </span>
  );
}

/**
 * Gestão central das tags e milestones do espaço atual. É a mesma lista
 * usada por Kanban, Documentos, Calendário, ThinkLab e LabTest.
 */
export function LabelsManager({
  initialTags,
  initialMilestones,
  canDelete,
  initialTab = "tags",
  embedded = false,
}: {
  initialTags: TagWithUsage[];
  initialMilestones: MilestoneWithUsage[];
  initialTab?: "tags" | "milestones";
  /** Dentro de um modal: sem o cabeçalho de página. */
  embedded?: boolean;
  /** Excluir/mesclar exige owner/mentor em equipes. */
  canDelete: boolean;
}) {
  const [tab, setTab] = useState<"tags" | "milestones">(initialTab);
  const [tags, setTags] = useState(initialTags);
  const [milestones, setMilestones] = useState(initialMilestones);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Edição inline
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDue, setEditDue] = useState("");
  const [mergeId, setMergeId] = useState<string | null>(null);

  // Criação
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState<string | null>(null);
  const [newDue, setNewDue] = useState("");

  function run(fn: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await fn();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Algo deu errado.");
      }
    });
  }

  const reloadTags = async () => setTags(await listTagsWithUsage());
  const reloadMilestones = async () => setMilestones(await listMilestonesWithUsage());

  const q = norm(search.trim());
  const shownTags = useMemo(() => tags.filter((t) => !q || norm(t.name).includes(q)), [tags, q]);
  const shownMilestones = useMemo(
    () => milestones.filter((m) => !q || norm(m.name).includes(q)),
    [milestones, q],
  );

  function submitCreate() {
    if (!newName.trim()) return;
    run(async () => {
      if (tab === "tags") {
        await createTag(newName, newColor);
        await reloadTags();
      } else {
        await createMilestone({ name: newName, color: newColor, dueAt: newDue || null });
        await reloadMilestones();
      }
      setNewName("");
      setNewColor(null);
      setNewDue("");
    });
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <header className={embedded ? "hidden" : undefined}>
        <h1 className="text-3xl font-black tracking-tight">
          Tags <span className="text-primary">&amp; Milestones</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-base-content/60">
          Um único catálogo para Kanban, StageBook, Calendário, ThinkLab e LabTest. Renomear ou mudar a cor
          aqui atualiza tudo, em todas as ferramentas.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div role="tablist" className="tabs tabs-box">
          <button role="tab" className={`tab gap-1.5 ${tab === "tags" ? "tab-active" : ""}`} onClick={() => setTab("tags")}>
            <TagsIcon size={14} /> Tags <span className="opacity-50">{tags.length}</span>
          </button>
          <button
            role="tab"
            className={`tab gap-1.5 ${tab === "milestones" ? "tab-active" : ""}`}
            onClick={() => setTab("milestones")}
          >
            <Flag size={14} /> Milestones <span className="opacity-50">{milestones.length}</span>
          </button>
        </div>

        <label className="input input-bordered input-sm ml-auto flex w-full items-center gap-2 sm:w-64">
          <Search size={14} className="text-base-content/40" />
          <input className="grow" placeholder="Buscar…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
      </div>

      <form
        className="space-y-3 rounded-2xl border border-base-300 bg-base-100 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          submitCreate();
        }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <input
            className="input input-bordered input-sm min-w-48 flex-1"
            placeholder={tab === "tags" ? "Nome da nova tag" : "Nome da nova milestone"}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            maxLength={tab === "tags" ? 40 : 100}
          />
          {tab === "milestones" && (
            <input
              type="date"
              className="input input-bordered input-sm"
              value={newDue}
              onChange={(e) => setNewDue(e.target.value)}
              aria-label="Prazo"
            />
          )}
          <button type="submit" className="btn btn-primary btn-sm gap-1.5" disabled={!newName.trim()}>
            <Plus size={14} /> Criar
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-medium text-base-content/55">Cor de fundo</span>
          <LabelColorPicker compact value={newColor} onChange={setNewColor} onReset={() => setNewColor(null)} />
          {newName.trim() && (
            <span className="ml-auto">
              {tab === "tags" ? (
                <TagChip tag={{ name: newName.trim(), color: newColor }} />
              ) : (
                <MilestoneChip milestone={{ name: newName.trim(), color: newColor, dueAt: newDue || null }} />
              )}
            </span>
          )}
        </div>
      </form>

      {error && (
        <div role="alert" className="alert alert-error alert-soft py-2 text-sm">
          {error}
        </div>
      )}

      {tab === "tags" ? (
        <ul className="space-y-2">
          {shownTags.map((tag) => {
            const editing = editId === tag.id;
            return (
              <li key={tag.id} className="rounded-xl border border-base-300 bg-base-100 p-3">
                <div className="flex flex-wrap items-center gap-3">
                  <TagChip tag={tag} size="md" />
                  <UsageSummary usage={tag.usage} total={tag.total} />
                  <div className="ml-auto flex items-center gap-1">
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs gap-1"
                      onClick={() => {
                        setEditId(editing ? null : tag.id);
                        setEditName(tag.name);
                        setMergeId(null);
                      }}
                    >
                      <Palette size={13} /> Editar
                    </button>
                    {canDelete && (
                      <>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs gap-1"
                          onClick={() => {
                            setMergeId(mergeId === tag.id ? null : tag.id);
                            setEditId(null);
                          }}
                        >
                          <GitMerge size={13} /> Mesclar
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs gap-1 text-error"
                          onClick={() => {
                            if (!window.confirm(`Excluir a tag “${tag.name}”? Ela será removida de ${tag.total} item(ns).`)) return;
                            run(async () => {
                              await deleteTag(tag.id);
                              await reloadTags();
                            });
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {editing && (
                  <div className="mt-3 space-y-3 border-t border-base-200 pt-3">
                    <form
                      className="flex gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        run(async () => {
                          await updateTag(tag.id, { name: editName });
                          await reloadTags();
                        });
                      }}
                    >
                      <input
                        className="input input-bordered input-sm flex-1"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        maxLength={40}
                      />
                      <button type="submit" className="btn btn-primary btn-sm">
                        <Check size={14} /> Salvar nome
                      </button>
                    </form>
                    <LabelColorPicker
                      value={tag.color ?? resolveLabelColor(null, tag.name)}
                      onChange={(hex) =>
                        run(async () => {
                          await updateTag(tag.id, { color: hex });
                          await reloadTags();
                        })
                      }
                      onReset={() =>
                        run(async () => {
                          await updateTag(tag.id, { color: null });
                          await reloadTags();
                        })
                      }
                    />
                  </div>
                )}

                {mergeId === tag.id && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-base-200 pt-3 text-sm">
                    <span className="text-base-content/60">Juntar “{tag.name}” em</span>
                    <select
                      className="select select-bordered select-sm"
                      defaultValue=""
                      onChange={(e) => {
                        const target = e.target.value;
                        if (!target) return;
                        run(async () => {
                          await mergeTags(tag.id, target);
                          setMergeId(null);
                          await reloadTags();
                        });
                      }}
                    >
                      <option value="">Escolha a tag de destino…</option>
                      {tags
                        .filter((t) => t.id !== tag.id)
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                    </select>
                    <button type="button" className="btn btn-ghost btn-xs" onClick={() => setMergeId(null)}>
                      <X size={12} />
                    </button>
                  </div>
                )}
              </li>
            );
          })}
          {shownTags.length === 0 && (
            <li className="rounded-xl border border-dashed border-base-300 py-12 text-center text-sm text-base-content/45">
              {tags.length === 0 ? "Nenhuma tag criada ainda." : "Nenhuma tag encontrada."}
            </li>
          )}
        </ul>
      ) : (
        <ul className="space-y-2">
          {shownMilestones.map((m) => {
            const editing = editId === m.id;
            return (
              <li key={m.id} className="rounded-xl border border-base-300 bg-base-100 p-3">
                <div className="flex flex-wrap items-center gap-3">
                  <MilestoneChip milestone={m} size="sm" />
                  <UsageSummary usage={m.usage} total={m.total} />
                  <div className="ml-auto flex items-center gap-1">
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs gap-1"
                      onClick={() => {
                        setEditId(editing ? null : m.id);
                        setEditName(m.name);
                        setEditDue(m.dueAt ? m.dueAt.slice(0, 10) : "");
                      }}
                    >
                      <Pencil size={13} /> Editar
                    </button>
                    {canDelete && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs text-error"
                        aria-label={`Excluir ${m.name}`}
                        onClick={() => {
                          if (!window.confirm(`Excluir a milestone “${m.name}”? Os ${m.total} item(ns) ficarão sem milestone.`)) return;
                          run(async () => {
                            await deleteMilestone(m.id);
                            await reloadMilestones();
                          });
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {editing && (
                  <div className="mt-3 space-y-3 border-t border-base-200 pt-3">
                    <form
                      className="flex flex-wrap gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        run(async () => {
                          await updateMilestone(m.id, { name: editName, dueAt: editDue || null });
                          await reloadMilestones();
                        });
                      }}
                    >
                      <input
                        className="input input-bordered input-sm min-w-48 flex-1"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        maxLength={100}
                      />
                      <input
                        type="date"
                        className="input input-bordered input-sm"
                        value={editDue}
                        onChange={(e) => setEditDue(e.target.value)}
                      />
                      <button type="submit" className="btn btn-primary btn-sm">
                        <Check size={14} /> Salvar
                      </button>
                    </form>
                    <LabelColorPicker
                      value={m.color ?? resolveLabelColor(null, m.name)}
                      onChange={(hex) =>
                        run(async () => {
                          await updateMilestone(m.id, { color: hex });
                          await reloadMilestones();
                        })
                      }
                      onReset={() =>
                        run(async () => {
                          await updateMilestone(m.id, { color: null });
                          await reloadMilestones();
                        })
                      }
                    />
                  </div>
                )}
              </li>
            );
          })}
          {shownMilestones.length === 0 && (
            <li className="rounded-xl border border-dashed border-base-300 py-12 text-center text-sm text-base-content/45">
              {milestones.length === 0 ? "Nenhuma milestone criada ainda." : "Nenhuma milestone encontrada."}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
