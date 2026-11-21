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

import { unwrapAction } from "@/utils/stagebook/action-result";
import {
  DisplayHeading,
  IconButton,
  InlineAlert,
  Panel,
  ToolBadge,
  ToolButton,
  ToolEmpty,
  ToolInput,
  ToolSelect,
  ToolTabs,
  useToolConfirm,
} from "@/components/stage";
const norm = (v: string) => v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function UsageSummary({ usage, total }: { usage: Record<LabelableKind, number>; total: number }) {
  if (total === 0) return <ToolBadge>Sem uso</ToolBadge>;
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
 * Gestão central das tags e metas (milestones) do espaço atual, com a Stage
 * UI. É a mesma lista usada por todas as ferramentas, inclusive o Diário.
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
  const { confirm, dialog: confirmDialog } = useToolConfirm();

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
        unwrapAction(await createTag(newName, newColor));
        await reloadTags();
      } else {
        unwrapAction(await createMilestone({ name: newName, color: newColor, dueAt: newDue || null }));
        await reloadMilestones();
      }
      setNewName("");
      setNewColor(null);
      setNewDue("");
    });
  }

  const isTags = tab === "tags";
  const canCreateHere = isTags || canDelete;

  async function removeTag(tag: TagWithUsage) {
    const ok = await confirm({
      title: `Excluir a tag “${tag.name}”?`,
      message: tag.total ? `Ela sai de ${tag.total} ${tag.total === 1 ? "item" : "itens"} em todas as ferramentas.` : "Ela não está em uso.",
      intent: "danger",
      confirmLabel: "Excluir",
    });
    if (!ok) return;
    run(async () => {
      unwrapAction(await deleteTag(tag.id));
      await reloadTags();
    });
  }

  async function removeMilestone(m: MilestoneWithUsage) {
    const ok = await confirm({
      title: `Excluir a meta “${m.name}”?`,
      message: m.total ? `Os ${m.total} itens vinculados ficam sem meta.` : "Nenhum item usa esta meta.",
      intent: "danger",
      confirmLabel: "Excluir",
    });
    if (!ok) return;
    run(async () => {
      unwrapAction(await deleteMilestone(m.id));
      await reloadMilestones();
    });
  }

  return (
    <div className="mx-auto w-full space-y-4">
      {!embedded && (
        <header>
          <DisplayHeading as="h1" size="sm" tag="Organização" highlight="metas">
            Tags &amp;
          </DisplayHeading>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-base-content/60">
            Um único catálogo para Kanban, StageBook, Calendário, ThinkLab, LabTest, QuickBrick e Diário. Renomear ou mudar a cor aqui
            atualiza tudo, em todas as ferramentas.
          </p>
        </header>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <ToolTabs<"tags" | "milestones">
          className="flex-1"
          value={tab}
          onChange={(v) => {
            setTab(v);
            setEditId(null);
            setMergeId(null);
          }}
          tabs={[
            { value: "tags", label: <><TagsIcon size={14} /> Tags</>, count: tags.length },
            { value: "milestones", label: <><Flag size={14} /> Metas</>, count: milestones.length },
          ]}
        />
        <ToolInput
          icon={<Search />}
          placeholder="Buscar…"
          aria-label="Buscar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-1 w-full sm:w-60"
        />
      </div>

      {/* Em equipes, metas são dos técnicos/mentores (`canDelete` = equipe técnica ou espaço pessoal). */}
      {!isTags && !canDelete && (
        <InlineAlert type="info">Só técnicos e mentores criam, editam e excluem as metas da equipe. Você pode usá-las em qualquer item.</InlineAlert>
      )}

      {canCreateHere && (
        <Panel title={isTags ? "Nova tag" : "Nova meta"} icon={<Plus />}>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              submitCreate();
            }}
          >
            <div className="flex flex-wrap items-center gap-2">
              <ToolInput
                className="min-w-48 flex-1"
                placeholder={isTags ? "Nome da nova tag" : "Nome da nova meta"}
                aria-label={isTags ? "Nome da nova tag" : "Nome da nova meta"}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={isTags ? 40 : 100}
              />
              {!isTags && (
                <ToolInput type="date" className="w-44" value={newDue} onChange={(e) => setNewDue(e.target.value)} aria-label="Prazo" />
              )}
              <ToolButton type="submit" variant="primary" icon={<Plus />} disabled={!newName.trim()}>
                Criar
              </ToolButton>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-base-content/50">Cor de fundo</span>
              <LabelColorPicker compact value={newColor} onChange={setNewColor} onReset={() => setNewColor(null)} />
              {newName.trim() && (
                <span className="flex-shrink-0">
                  {isTags ? (
                    <TagChip tag={{ name: newName.trim(), color: newColor }} />
                  ) : (
                    <MilestoneChip milestone={{ name: newName.trim(), color: newColor, dueAt: newDue || null }} />
                  )}
                </span>
              )}
            </div>
          </form>
        </Panel>
      )}

      {error && (
        <InlineAlert type="error" onClose={() => setError(null)}>
          {error}
        </InlineAlert>
      )}

      {isTags ? (
        shownTags.length === 0 ? (
          <ToolEmpty icon={<TagsIcon />} title={tags.length === 0 ? "Nenhuma tag criada ainda" : "Nenhuma tag encontrada"} />
        ) : (
          <ul className="space-y-2">
            {shownTags.map((tag) => {
              const editing = editId === tag.id;
              return (
                <li key={tag.id} className="rounded-lg border border-base-300 bg-base-100 p-3 transition-colors hover:border-base-content/20">
                  <div className="flex flex-wrap items-center gap-3">
                    <TagChip tag={tag} size="md" />
                    <UsageSummary usage={tag.usage} total={tag.total} />
                    <div className="ml-auto flex items-center gap-1">
                      <ToolButton
                        size="xs"
                        variant="ghost"
                        icon={<Palette />}
                        active={editing}
                        onClick={() => {
                          setEditId(editing ? null : tag.id);
                          setEditName(tag.name);
                          setMergeId(null);
                        }}
                      >
                        Editar
                      </ToolButton>
                      {canDelete && (
                        <>
                          <ToolButton
                            size="xs"
                            variant="ghost"
                            icon={<GitMerge />}
                            active={mergeId === tag.id}
                            onClick={() => {
                              setMergeId(mergeId === tag.id ? null : tag.id);
                              setEditId(null);
                            }}
                          >
                            Mesclar
                          </ToolButton>
                          <IconButton size="xs" label={`Excluir a tag ${tag.name}`} icon={<Trash2 />} className="hover:text-error" onClick={() => removeTag(tag)} />
                        </>
                      )}
                    </div>
                  </div>

                  {editing && (
                    <div className="mt-3 space-y-3 border-t border-base-300 pt-3">
                      <form
                        className="flex gap-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          run(async () => {
                            unwrapAction(await updateTag(tag.id, { name: editName }));
                            await reloadTags();
                          });
                        }}
                      >
                        <ToolInput className="flex-1" value={editName} onChange={(e) => setEditName(e.target.value)} maxLength={40} aria-label="Nome da tag" />
                        <ToolButton type="submit" variant="primary" icon={<Check />}>
                          Salvar nome
                        </ToolButton>
                      </form>
                      <LabelColorPicker
                        value={tag.color ?? resolveLabelColor(null, tag.name)}
                        onChange={(hex) =>
                          run(async () => {
                            unwrapAction(await updateTag(tag.id, { color: hex }));
                            await reloadTags();
                          })
                        }
                        onReset={() =>
                          run(async () => {
                            unwrapAction(await updateTag(tag.id, { color: null }));
                            await reloadTags();
                          })
                        }
                      />
                    </div>
                  )}

                  {mergeId === tag.id && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-base-300 pt-3 text-[13px]">
                      <span className="text-base-content/60">Juntar “{tag.name}” em</span>
                      <ToolSelect
                        className="w-56"
                        defaultValue=""
                        aria-label="Tag de destino"
                        onChange={(e) => {
                          const target = e.target.value;
                          if (!target) return;
                          run(async () => {
                            unwrapAction(await mergeTags(tag.id, target));
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
                      </ToolSelect>
                      <IconButton size="xs" label="Cancelar" icon={<X />} onClick={() => setMergeId(null)} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )
      ) : shownMilestones.length === 0 ? (
        <ToolEmpty icon={<Flag />} title={milestones.length === 0 ? "Nenhuma meta criada ainda" : "Nenhuma meta encontrada"} />
      ) : (
        <ul className="space-y-2">
          {shownMilestones.map((m) => {
            const editing = editId === m.id;
            const crDone = m.criteria.filter((c) => c.done).length;
            return (
              <li key={m.id} className="rounded-lg border border-base-300 bg-base-100 p-3">
                <div className="flex flex-wrap items-center gap-3">
                  <MilestoneChip milestone={m} size="sm" />
                  {m.completedAt ? (
                    <ToolBadge tone="success">Concluída</ToolBadge>
                  ) : (
                    m.criteria.length > 0 && (
                      <ToolBadge tone={crDone === m.criteria.length ? "success" : "ink"}>
                        {crDone}/{m.criteria.length} critérios
                      </ToolBadge>
                    )
                  )}
                  <UsageSummary usage={m.usage} total={m.total} />
                  {canDelete && (
                    <div className="ml-auto flex items-center gap-1">
                      <ToolButton
                        size="xs"
                        variant="ghost"
                        icon={<Pencil />}
                        active={editing}
                        onClick={() => {
                          setEditId(editing ? null : m.id);
                          setEditName(m.name);
                          setEditDue(m.dueAt ? m.dueAt.slice(0, 10) : "");
                        }}
                      >
                        Editar
                      </ToolButton>
                      <IconButton size="xs" label={`Excluir ${m.name}`} icon={<Trash2 />} className="hover:text-error" onClick={() => removeMilestone(m)} />
                    </div>
                  )}
                </div>

                {editing && canDelete && (
                  <div className="mt-3 space-y-3 border-t border-base-300 pt-3">
                    <form
                      className="flex flex-wrap gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        run(async () => {
                          unwrapAction(await updateMilestone(m.id, { name: editName, dueAt: editDue || null }));
                          await reloadMilestones();
                        });
                      }}
                    >
                      <ToolInput className="min-w-48 flex-1" value={editName} onChange={(e) => setEditName(e.target.value)} maxLength={100} aria-label="Nome da meta" />
                      <ToolInput type="date" className="w-44" value={editDue} onChange={(e) => setEditDue(e.target.value)} aria-label="Prazo" />
                      <ToolButton type="submit" variant="primary" icon={<Check />}>
                        Salvar
                      </ToolButton>
                    </form>
                    <LabelColorPicker
                      value={m.color ?? resolveLabelColor(null, m.name)}
                      onChange={(hex) =>
                        run(async () => {
                          unwrapAction(await updateMilestone(m.id, { color: hex }));
                          await reloadMilestones();
                        })
                      }
                      onReset={() =>
                        run(async () => {
                          unwrapAction(await updateMilestone(m.id, { color: null }));
                          await reloadMilestones();
                        })
                      }
                    />
                    <p className="text-[11px] text-base-content/50">Critérios de conclusão e progresso das metas da equipe ficam na aba Metas da página da equipe.</p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {confirmDialog}
    </div>
  );
}
