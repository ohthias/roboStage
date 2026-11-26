"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Book,
  CheckCircle2,
  Cuboid,
  FlaskConical,
  KanbanSquare,
  Lightbulb,
  ListChecks,
  Loader2,
  Lock,
  NotebookPen,
  Pencil,
  PenLine,
  Plus,
  RotateCcw,
  Target,
  Trash2,
  Users,
  X,
  CalendarDays,
  type LucideIcon,
} from "lucide-react";
import {
  IconButton,
  InfoTile,
  InlineAlert,
  Segmented,
  TeamAvatar,
  ToolBadge,
  ToolButton,
  ToolDialog,
  ToolEmpty,
  ToolInput,
  ToolSection,
  cn,
  useToolConfirm,
} from "@/components/stage";
import { useToast } from "@/components/providers/ToastContext";
import {
  createTeamMilestone,
  deleteTeamMilestone,
  setTeamMilestoneCompleted,
  toggleTeamMilestoneCriterion,
  updateTeamMilestone,
} from "@/features/stagebook/actions/milestones";
import { LABEL_PALETTE, resolveLabelColor } from "@/features/stagebook/lib/label-colors";
import { roleCan, type TeamRole } from "@/features/stagebook/lib/team-permissions";
import { MILESTONE_CRITERIA_LIMITS, type LabelableKind, type MilestoneCriterion } from "@/features/stagebook/types/labels";
import { formatJournalDate } from "@/features/stagebook/types/journal";
import type { TeamGoal } from "@/features/stagebook/types/team-workspace";
import { DueBadge, GoalCriteria, GoalFlag, GoalProgressBar, daysUntil } from "@/features/stagebook/components/goals/goal-ui";
import { useClientToday } from "@/features/stagebook/journal/hooks/use-client-value";
import { teamToolHref } from "../lib/team-links";

const toDateInput = (iso: string | null) => (iso ? iso.slice(0, 10) : "");

/** Ferramentas mostradas nos "itens vinculados" de cada meta (o Diário tem seção própria). */
const TOOL_META: { kind: LabelableKind; one: string; many: string; Icon: LucideIcon }[] = [
  { kind: "kanban-card", one: "card", many: "cards", Icon: KanbanSquare },
  { kind: "document", one: "página", many: "páginas", Icon: Book },
  { kind: "labtest", one: "teste", many: "testes", Icon: FlaskConical },
  { kind: "thinklab", one: "quadro", many: "quadros", Icon: Lightbulb },
  { kind: "quickbrick", one: "caderno", many: "cadernos", Icon: Cuboid },
  { kind: "calendar-event", one: "evento", many: "eventos", Icon: CalendarDays },
];

type Draft = {
  id: string | null;
  name: string;
  dueAt: string;
  color: string | null;
  description: string;
  criteria: { id?: string; text: string }[];
};
const EMPTY: Draft = { id: null, name: "", dueAt: "", color: null, description: "", criteria: [{ text: "" }] };

type View = "active" | "done" | "all";

/**
 * Metas da equipe (os marcos universais do Stagebook, agora com critérios de
 * conclusão). Técnico e mentor criam, editam, concluem e excluem; qualquer
 * membro marca critérios e registra no Diário o que fez por cada meta.
 */
export function MilestonesTab({ teamId, viewerRole, goals }: { teamId: string; viewerRole: TeamRole; goals: TeamGoal[] }) {
  const router = useRouter();
  const { addToast } = useToast();
  const { confirm, dialog: confirmDialog } = useToolConfirm();
  const today = useClientToday();
  const [isPending, startTransition] = useTransition();
  const canManage = roleCan(viewerRole, "milestone.manage");

  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>("active");

  const active = goals.filter((g) => !g.completedAt);
  const done = goals.filter((g) => g.completedAt);
  const shown = view === "active" ? active : view === "done" ? done : goals;

  const summary = useMemo(() => {
    const next = active
      .filter((g) => g.dueAt)
      .sort((a, b) => a.dueAt!.localeCompare(b.dueAt!))[0];
    const recent = goals.reduce((n, g) => n + g.journal.weeks.reduce((a, b) => a + b, 0), 0);
    const late = active.filter((g) => (daysUntil(g.dueAt, today) ?? 1) < 0).length;
    return { next, recent, late };
  }, [goals, active, today]);

  function close() {
    setDraft(null);
    setError(null);
  }

  function save() {
    if (!draft) return;
    setError(null);
    if (!draft.name.trim()) return setError("Informe um nome.");
    startTransition(async () => {
      const input = {
        name: draft.name,
        dueAt: draft.dueAt || null,
        color: draft.color,
        description: draft.description || null,
        criteria: draft.criteria.filter((c) => c.text.trim()),
      };
      const result = draft.id ? await updateTeamMilestone(teamId, draft.id, input) : await createTeamMilestone(teamId, input);
      if (!result.ok) return setError(result.error);
      addToast(draft.id ? "Meta atualizada." : "Meta criada.", "success");
      close();
      router.refresh();
    });
  }

  async function remove(g: TeamGoal) {
    const ok = await confirm({
      title: `Excluir “${g.name}”?`,
      message:
        g.usageTotal > 0
          ? `Os ${g.usageTotal} itens vinculados (incluindo entradas do diário) ficam sem meta. Não pode ser desfeito.`
          : "Não pode ser desfeito.",
      intent: "danger",
      confirmLabel: "Excluir",
    });
    if (!ok) return;
    const result = await deleteTeamMilestone(teamId, g.id);
    if (!result.ok) return addToast(result.error, "error");
    addToast("Meta excluída.", "success");
    router.refresh();
  }

  async function complete(g: TeamGoal, value: boolean) {
    const result = await setTeamMilestoneCompleted(teamId, g.id, value);
    if (!result.ok) return addToast(result.error, "error");
    addToast(value ? `“${g.name}” concluída!` : "Meta reaberta.", "success");
    router.refresh();
  }

  const edit = (g: TeamGoal) =>
    setDraft({
      id: g.id,
      name: g.name,
      dueAt: toDateInput(g.dueAt),
      color: g.color,
      description: g.description ?? "",
      criteria: g.criteria.length ? g.criteria.map((c) => ({ id: c.id, text: c.text })) : [{ text: "" }],
    });

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Metas da equipe</h2>
          <p className="max-w-xl text-sm text-base-content/60">
            Cada meta tem critérios de conclusão, os itens vinculados nas ferramentas e o que a equipe registrou no diário sobre ela.
          </p>
        </div>
        {canManage ? (
          <ToolButton variant="primary" size="md" icon={<Plus />} onClick={() => setDraft({ ...EMPTY, criteria: [{ text: "" }] })}>
            Nova meta
          </ToolButton>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-base-content/45">
            <Lock size={12} /> Só técnicos e mentores criam metas; todos marcam critérios.
          </span>
        )}
      </div>

      {goals.length > 0 && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <InfoTile label="Em andamento" value={active.length} hint={summary.late ? `${summary.late} atrasada${summary.late > 1 ? "s" : ""}` : "nenhuma atrasada"} trend={summary.late ? "down" : undefined} />
          <InfoTile label="Concluídas" value={done.length} hint={`de ${goals.length}`} trend={done.length ? "up" : undefined} />
          <InfoTile
            label="Próximo prazo"
            value={<span className="block truncate text-base">{summary.next ? summary.next.name : "—"}</span>}
            hint={summary.next?.dueAt ? formatJournalDate(summary.next.dueAt.slice(0, 10), "weekday") : "sem prazos"}
          />
          <InfoTile label="Diário · 8 semanas" value={summary.recent} unit="entradas" hint="ligadas a metas" />
        </div>
      )}

      {goals.length === 0 ? (
        <ToolEmpty
          icon={<Target />}
          title="Nenhuma meta ainda"
          description={
            canManage
              ? "Crie metas como “Torneio regional” ou “Entrega do projeto”, com critérios de conclusão. A equipe registra no diário o que fez por cada uma."
              : "Quando um técnico ou mentor criar metas, elas aparecem aqui."
          }
          action={
            canManage ? (
              <ToolButton variant="primary" icon={<Plus />} onClick={() => setDraft({ ...EMPTY, criteria: [{ text: "" }] })}>
                Criar a primeira meta
              </ToolButton>
            ) : undefined
          }
          className="bg-base-100 py-12"
        />
      ) : (
        <>
          <Segmented<View>
            label="Mostrar"
            value={view}
            onChange={setView}
            options={[
              { value: "active", label: `Em andamento · ${active.length}` },
              { value: "done", label: `Concluídas · ${done.length}` },
              { value: "all", label: "Todas" },
            ]}
          />
          {shown.length === 0 ? (
            <ToolEmpty icon={<CheckCircle2 />} title={view === "done" ? "Nenhuma meta concluída ainda" : "Nenhuma meta em andamento"} className="bg-base-100" />
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {shown.map((g) => (
                <GoalCard
                  key={g.id}
                  goal={g}
                  teamId={teamId}
                  today={today}
                  canManage={canManage}
                  onEdit={() => edit(g)}
                  onDelete={() => remove(g)}
                  onComplete={(v) => complete(g, v)}
                  onCriteriaChanged={() => router.refresh()}
                />
              ))}
            </div>
          )}
        </>
      )}

      <ToolDialog
        open={draft !== null}
        onClose={close}
        size="md"
        title={draft?.id ? "Editar meta" : "Nova meta"}
        description="Visível para toda a equipe."
        footer={
          <>
            <ToolButton onClick={close} disabled={isPending}>
              Cancelar
            </ToolButton>
            <ToolButton variant="primary" onClick={save} disabled={isPending || !draft?.name.trim()} icon={isPending ? <Loader2 className="animate-spin" /> : undefined}>
              {draft?.id ? "Salvar" : "Criar meta"}
            </ToolButton>
          </>
        }
      >
        {draft && (
          <form
            className="space-y-3 pb-1"
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            {error && <InlineAlert type="error">{error}</InlineAlert>}
            <ToolSection title="Nome">
              <ToolInput autoFocus maxLength={100} placeholder="Ex.: Torneio regional" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </ToolSection>
            <div className="grid gap-3 sm:grid-cols-2">
              <ToolSection title="Prazo (opcional)">
                <ToolInput type="date" value={draft.dueAt} onChange={(e) => setDraft({ ...draft, dueAt: e.target.value })} icon={<CalendarDays />} />
              </ToolSection>
              <ToolSection title="Cor">
                <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Cor da meta">
                  {LABEL_PALETTE.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      role="radio"
                      aria-checked={draft.color === c.value}
                      title={c.name}
                      onClick={() => setDraft({ ...draft, color: draft.color === c.value ? null : c.value })}
                      className={cn("size-6 rounded-full border border-black/10", draft.color === c.value && "ring-2 ring-base-content/60 ring-offset-2 ring-offset-base-100")}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              </ToolSection>
            </div>
            <ToolSection title="Descrição (opcional)">
              <textarea
                className="min-h-16 w-full rounded-md border border-base-300 bg-base-100 px-2.5 py-1.5 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                maxLength={1000}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </ToolSection>
            <ToolSection title="Critérios de conclusão">
              <p className="-mt-1 text-[11px] text-base-content/50">O que precisa estar feito para a meta ser cumprida. Qualquer membro marca; o progresso soma critérios e cards do Kanban.</p>
              <ul className="space-y-1">
                {draft.criteria.map((c, i) => (
                  <li key={c.id ?? `new-${i}`} className="flex items-center gap-1.5">
                    <ListChecks size={14} className="shrink-0 text-base-content/40" />
                    <ToolInput
                      value={c.text}
                      maxLength={MILESTONE_CRITERIA_LIMITS.text}
                      placeholder={i === 0 ? "Ex.: Missões 1 a 5 estáveis em 9 de 10 rodadas" : "Outro critério"}
                      onChange={(e) => setDraft({ ...draft, criteria: draft.criteria.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)) })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (draft.criteria.length < MILESTONE_CRITERIA_LIMITS.items) setDraft({ ...draft, criteria: [...draft.criteria, { text: "" }] });
                        }
                      }}
                      aria-label={`Critério ${i + 1}`}
                    />
                    <IconButton label="Remover critério" icon={<X />} size="xs" onClick={() => setDraft({ ...draft, criteria: draft.criteria.filter((_, j) => j !== i) })} />
                  </li>
                ))}
              </ul>
              {draft.criteria.length < MILESTONE_CRITERIA_LIMITS.items && (
                <ToolButton size="xs" variant="ghost" icon={<Plus />} onClick={() => setDraft({ ...draft, criteria: [...draft.criteria, { text: "" }] })}>
                  Adicionar critério
                </ToolButton>
              )}
            </ToolSection>
          </form>
        )}
      </ToolDialog>
      {confirmDialog}
    </section>
  );
}

// ============================================================================

function GoalCard({
  goal,
  teamId,
  today,
  canManage,
  onEdit,
  onDelete,
  onComplete,
  onCriteriaChanged,
}: {
  goal: TeamGoal;
  teamId: string;
  today: string | null;
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onComplete: (value: boolean) => void;
  onCriteriaChanged: () => void;
}) {
  const { addToast } = useToast();
  const color = resolveLabelColor(goal.color, goal.name);
  const [criteria, setCriteria] = useState<MilestoneCriterion[]>(goal.criteria);
  // progresso ao vivo enquanto marca critérios (o resto vem do servidor)
  const crDone = criteria.filter((c) => c.done).length;
  const total = criteria.length + goal.cards.total;
  const progress = total ? { done: crDone + goal.cards.done, total, pct: Math.round(((crDone + goal.cards.done) / total) * 100) } : null;
  const allCriteria = criteria.length > 0 && crDone === criteria.length;
  const tools = TOOL_META.filter((t) => goal.usage[t.kind] > 0);
  const maxWeek = Math.max(1, ...goal.journal.weeks);
  const completed = !!goal.completedAt;

  return (
    <article className={cn("flex flex-col overflow-hidden rounded-lg border bg-base-100", completed ? "border-success/40" : "border-base-300")}>
      <div className="h-1" style={{ background: color }} aria-hidden />
      <div className="flex-1 space-y-3 p-4">
        <header className="flex items-start gap-3">
          <GoalFlag milestone={goal} size={36} />
          <div className="min-w-0 flex-1">
            <h3 className={cn("text-[15px] font-bold leading-snug", completed && "text-base-content/60")}>{goal.name}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <DueBadge milestone={goal} today={today} />
              {goal.dueAt && <span className="font-mono text-[11px] text-base-content/45">{formatJournalDate(goal.dueAt.slice(0, 10), "short")}</span>}
            </div>
          </div>
          {canManage && (
            <div className="-mr-1 -mt-1 flex">
              <IconButton label={`Editar ${goal.name}`} icon={<Pencil />} size="xs" onClick={onEdit} />
              <IconButton label={`Excluir ${goal.name}`} icon={<Trash2 />} size="xs" className="hover:text-error" onClick={onDelete} />
            </div>
          )}
        </header>

        {goal.description && <p className="line-clamp-2 text-[13px] text-base-content/65">{goal.description}</p>}

        <GoalProgressBar progress={progress} color={completed ? "var(--color-success)" : color} />

        {criteria.length > 0 && (
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-base-content/50">Critérios</p>
            <GoalCriteria
              criteria={goal.criteria}
              disabled={completed}
              onToggle={(cid, d) => toggleTeamMilestoneCriterion(teamId, goal.id, cid, d)}
              onError={(m) => addToast(m, "error")}
              onChange={(m) => {
                setCriteria(m.criteria);
                onCriteriaChanged();
              }}
            />
          </div>
        )}

        {canManage && !completed && allCriteria && (
          <InlineAlert
            type="success"
            title="Todos os critérios foram cumpridos"
            action={
              <ToolButton size="xs" variant="primary" icon={<CheckCircle2 />} onClick={() => onComplete(true)}>
                Concluir meta
              </ToolButton>
            }
          />
        )}

        {tools.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tools.map(({ kind, one, many, Icon }) => (
              <ToolBadge key={kind} className="gap-1">
                <Icon className="size-3" /> {goal.usage[kind]} {goal.usage[kind] === 1 ? one : many}
              </ToolBadge>
            ))}
            {goal.cards.total > 0 && (
              <ToolBadge tone={goal.cards.done === goal.cards.total ? "success" : "ink"}>
                {goal.cards.done}/{goal.cards.total} cards concluídos
              </ToolBadge>
            )}
          </div>
        )}

        {/* ---------------------------------------------- Diário da meta */}
        <div className="rounded-md border border-base-300 bg-base-200/40 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-[12px] font-bold">
              <NotebookPen size={14} className="text-primary" /> No diário
            </p>
            <div className="flex items-end gap-0.5" aria-label={`Entradas por semana nas últimas 8 semanas: ${goal.journal.weeks.join(", ")}`} role="img">
              {goal.journal.weeks.map((n, i) => (
                <span
                  key={i}
                  className="w-1.5 rounded-sm"
                  style={{ height: `${4 + (n / maxWeek) * 16}px`, background: n ? color : "var(--color-base-300)", opacity: i === 7 ? 1 : 0.75 }}
                  title={`${n} ${n === 1 ? "entrada" : "entradas"}`}
                />
              ))}
            </div>
          </div>
          {goal.journal.count === 0 ? (
            <p className="mt-1.5 text-[12px] text-base-content/55">Ninguém registrou nada sobre esta meta ainda.</p>
          ) : (
            <>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 text-[11px] text-base-content/55">
                <span>
                  {goal.journal.count} {goal.journal.count === 1 ? "entrada" : "entradas"}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users size={11} /> {goal.journal.contributors} {goal.journal.contributors === 1 ? "pessoa" : "pessoas"}
                </span>
                {goal.journal.lastDate && <span>última: {formatJournalDate(goal.journal.lastDate, "weekday")}</span>}
              </p>
              <ul className="mt-2 space-y-0.5">
                {goal.journal.recent.map((r) => (
                  <li key={r.id}>
                    <a href={teamToolHref(teamId, `/dashboard/diario/${r.id}`)} className="flex items-center gap-2 rounded px-1 py-0.5 text-[12px] hover:bg-base-content/[0.05]">
                      <TeamAvatar name={r.author.name ?? "Membro"} src={r.author.avatarUrl ?? undefined} size={18} className="ring-1" />
                      <span className="min-w-0 flex-1 truncate font-medium">{r.title || `Diário de ${formatJournalDate(r.entryDate, "weekday")}`}</span>
                      <span className="shrink-0 font-mono text-[10px] text-base-content/45">{formatJournalDate(r.entryDate, "weekday")}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {!completed && (
              <a
                href={teamToolHref(teamId, `/dashboard/diario/novo?marco=${goal.id}`)}
                className="inline-flex h-7 items-center gap-1.5 rounded-tl-lg rounded-br-lg rounded-tr-sm rounded-bl-sm bg-primary px-2.5 text-[12px] font-semibold text-primary-content hover:bg-primary/90"
              >
                <PenLine size={13} /> Registrar no diário
              </a>
            )}
            {goal.journal.count > 0 && (
              <a
                href={teamToolHref(teamId, `/dashboard/diario?marco=${goal.id}`)}
                className="inline-flex h-7 items-center rounded-md border border-base-300 bg-base-100 px-2.5 text-[12px] font-semibold hover:bg-base-200/60"
              >
                Ver tudo no diário
              </a>
            )}
          </div>
        </div>
      </div>

      {canManage && completed && (
        <footer className="flex items-center justify-between gap-2 border-t border-base-300 bg-success/[0.06] px-4 py-2 text-[12px] text-success">
          <span className="inline-flex items-center gap-1.5 font-semibold">
            <CheckCircle2 size={14} /> Concluída em {formatJournalDate(goal.completedAt!.slice(0, 10), "short")}
          </span>
          <ToolButton size="xs" variant="ghost" icon={<RotateCcw />} onClick={() => onComplete(false)}>
            Reabrir
          </ToolButton>
        </footer>
      )}
      {canManage && !completed && !allCriteria && (
        <footer className="flex justify-end border-t border-base-300 px-4 py-2">
          <ToolButton size="xs" variant="ghost" icon={<CheckCircle2 />} onClick={() => onComplete(true)}>
            Marcar como concluída
          </ToolButton>
        </footer>
      )}
    </article>
  );
}
