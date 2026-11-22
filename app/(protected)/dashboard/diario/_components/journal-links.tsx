"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Book, Cuboid, ExternalLink, FlaskConical, Lightbulb, Link2, Loader2, Plus, Search, Tags, Target, X, type LucideIcon } from "lucide-react";
import {
  IconButton,
  InlineAlert,
  ListItem,
  Panel,
  Segmented,
  ToolButton,
  ToolDialog,
  ToolEmpty,
  ToolInput,
} from "@/components/stage";
import { useToast } from "@/app/context/ToastContext";
import { ResourceLabels } from "@/components/stagebook/labels/resource-labels";
import { MilestoneSelector } from "@/components/stagebook/labels/milestone-selector";
import { DueBadge, GoalCriteria, GoalProgressBar } from "@/components/stagebook/goals/goal-ui";
import { addJournalLink, removeJournalLink, searchJournalLinkTargets } from "@/utils/stagebook/actions/journal";
import { toggleMilestoneCriterion } from "@/utils/stagebook/actions/milestones";
import { resolveLabelColor } from "@/utils/stagebook/label-colors";
import { milestoneProgress, type MilestoneDTO, type TagDTO } from "@/types/labels";
import {
  JOURNAL_LINK_KINDS,
  JOURNAL_LINK_LABEL,
  JOURNAL_MAX_LINKS,
  type JournalLink,
  type JournalLinkKind,
  type JournalLinkTarget,
  type JournalScopeInfo,
} from "@/types/journal";

export const LINK_ICONS: Record<JournalLinkKind, LucideIcon> = {
  stagebook: Book,
  labtest: FlaskConical,
  quickbrick: Cuboid,
  thinklab: Lightbulb,
};

// ============================================================================
// Tags + marco
// ============================================================================

/**
 * Tags e marco (meta) da entrada, no catálogo universal do espaço. Antes do
 * primeiro salvamento só dá para escolher a meta (vai junto na criação).
 */
export function JournalLabelsPanel({
  entryId,
  readOnly,
  initialTags,
  milestone,
  onMilestoneChange,
}: {
  entryId: string | null;
  readOnly: boolean;
  initialTags: TagDTO[];
  milestone: MilestoneDTO | null;
  onMilestoneChange: (m: MilestoneDTO | null) => void;
}) {
  if (readOnly && initialTags.length === 0 && !milestone) return null;
  return (
    <Panel title="Tags e meta" icon={<Tags />}>
      {entryId ? (
        <ResourceLabels
          kind="journal"
          resourceId={entryId}
          initialTags={initialTags}
          initialMilestone={milestone}
          disabled={readOnly}
          onChange={(state) => onMilestoneChange(state.milestone)}
        />
      ) : (
        <div className="space-y-2">
          <MilestoneSelector value={milestone} onChange={onMilestoneChange} label="Meta" />
          <p className="text-[11px] text-base-content/50">As tags ficam disponíveis assim que a entrada for salva (é só começar a escrever).</p>
        </div>
      )}
    </Panel>
  );
}

// ============================================================================
// Meta da entrada
// ============================================================================

/** A meta da entrada: prazo, progresso e critérios — marcar daqui atualiza a meta para toda a equipe. */
export function JournalGoalPanel({
  milestone,
  today,
  scope,
  onChange,
}: {
  milestone: MilestoneDTO;
  today: string | null;
  scope: JournalScopeInfo;
  onChange: (m: MilestoneDTO) => void;
}) {
  const { addToast } = useToast();
  const color = resolveLabelColor(milestone.color, milestone.name);
  const goalHref = scope.type === "team" ? `/dashboard/team/${scope.teamId}?tab=marcos` : "/dashboard/labels";
  return (
    <Panel
      title={milestone.name}
      icon={<Target style={{ color }} />}
      actions={
        <Link href={goalHref} className="grid size-7 place-items-center rounded-md text-base-content/50 hover:bg-base-content/[0.06]" title="Abrir a meta" aria-label="Abrir a meta">
          <ExternalLink size={13} />
        </Link>
      }
    >
      <div className="space-y-2.5">
        <DueBadge milestone={milestone} today={today} />
        {milestone.criteria.length > 0 ? (
          <>
            <GoalProgressBar progress={milestoneProgress(milestone.criteria)} color={color} />
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-base-content/50">O que você avançou?</p>
              <GoalCriteria
                key={milestone.id}
                criteria={milestone.criteria}
                disabled={!!milestone.completedAt}
                compact
                onToggle={(criterionId, done) => toggleMilestoneCriterion(milestone.id, criterionId, done)}
                onError={(m) => addToast(m, "error")}
                onChange={onChange}
              />
            </div>
          </>
        ) : (
          <p className="text-[11px] text-base-content/50">Esta meta ainda não tem critérios de conclusão.</p>
        )}
      </div>
    </Panel>
  );
}

// ============================================================================
// Vínculos
// ============================================================================

export function JournalLinksPanel({
  entryId,
  readOnly,
  initialLinks,
}: {
  entryId: string | null;
  readOnly: boolean;
  initialLinks: JournalLink[];
}) {
  const { addToast } = useToast();
  const [links, setLinks] = useState(initialLinks);
  const [open, setOpen] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  if (readOnly && links.length === 0) return null;

  const remove = async (link: JournalLink) => {
    if (!entryId) return;
    setRemoving(link.linkId);
    const res = await removeJournalLink(entryId, link.linkId);
    setRemoving(null);
    if (!res.ok) return addToast(res.error, "error");
    setLinks(res.data);
  };

  return (
    <Panel
      title="Vínculos"
      icon={<Link2 />}
      actions={
        !readOnly && entryId && links.length < JOURNAL_MAX_LINKS ? (
          <IconButton label="Vincular item" icon={<Plus />} size="xs" onClick={() => setOpen(true)} />
        ) : undefined
      }
    >
      {!entryId ? (
        <p className="text-[11px] text-base-content/50">Depois de salvar, vincule páginas, testes, cadernos e quadros a esta entrada.</p>
      ) : links.length === 0 ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-2 rounded-md border border-dashed border-base-300 px-2.5 py-2 text-left text-[12px] text-base-content/55 hover:border-primary/50 hover:text-base-content"
        >
          <Plus size={14} /> Vincular página, teste, caderno ou quadro
        </button>
      ) : (
        <ul className="-mx-1 space-y-0.5">
          {links.map((link) => {
            const Icon = LINK_ICONS[link.kind];
            return (
              <li key={link.linkId} className="group flex items-center gap-1">
                <Link href={link.href} className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1 hover:bg-base-content/[0.05]">
                  <span className="grid size-6 shrink-0 place-items-center rounded bg-base-200 text-base-content/65">
                    {link.icon ? <span className="text-[13px] leading-none">{link.icon}</span> : <Icon size={13} />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[12px] font-semibold">{link.title}</span>
                    <span className="block text-[10px] text-base-content/50">{JOURNAL_LINK_LABEL[link.kind].label}</span>
                  </span>
                </Link>
                {!readOnly &&
                  (removing === link.linkId ? (
                    <Loader2 size={13} className="mr-2 animate-spin text-base-content/40" />
                  ) : (
                    <IconButton
                      label={`Desvincular ${link.title}`}
                      icon={<X />}
                      size="xs"
                      className="opacity-0 focus-visible:opacity-100 group-hover:opacity-100"
                      onClick={() => remove(link)}
                    />
                  ))}
              </li>
            );
          })}
        </ul>
      )}
      {entryId && (
        <LinkPicker
          open={open}
          onClose={() => setOpen(false)}
          entryId={entryId}
          linked={links}
          onLinked={(next) => setLinks(next)}
        />
      )}
    </Panel>
  );
}

type KindFilter = "all" | JournalLinkKind;

function LinkPicker({
  open,
  onClose,
  entryId,
  linked,
  onLinked,
}: {
  open: boolean;
  onClose: () => void;
  entryId: string;
  linked: JournalLink[];
  onLinked: (links: JournalLink[]) => void;
}) {
  const { addToast } = useToast();
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<KindFilter>("all");
  const [results, setResults] = useState<JournalLinkTarget[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    const t = setTimeout(async () => {
      const res = await searchJournalLinkTargets({ q, kind: kind === "all" ? null : kind });
      if (!alive) return;
      if (res.ok) {
        setResults(res.data);
        setError(null);
      } else {
        setError(res.error);
        setResults([]);
      }
    }, 200);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [open, q, kind]);

  const isLinked = (t: JournalLinkTarget) => linked.some((l) => l.kind === t.kind && l.id === t.id);

  const add = async (t: JournalLinkTarget) => {
    setAdding(`${t.kind}:${t.id}`);
    const res = await addJournalLink(entryId, t.kind, t.id);
    setAdding(null);
    if (!res.ok) return addToast(res.error, "error");
    onLinked(res.data);
    addToast(`${JOURNAL_LINK_LABEL[t.kind].label}: “${t.title}” vinculado.`, "success");
  };

  return (
    <ToolDialog open={open} onClose={onClose} size="md" title="Vincular à entrada" description="Itens deste espaço no StageBook, LabTest, QuickBrick e ThinkLab.">
      <div className="space-y-3 pb-2">
        <ToolInput autoFocus icon={<Search />} placeholder="Buscar pelo nome" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar itens" />
        <Segmented<KindFilter>
          label="Ferramenta"
          size="xs"
          value={kind}
          onChange={setKind}
          options={[
            { value: "all", label: "Tudo" },
            ...JOURNAL_LINK_KINDS.map((k) => {
              const Icon = LINK_ICONS[k];
              return { value: k, label: JOURNAL_LINK_LABEL[k].label, icon: <Icon /> };
            }),
          ]}
        />
        {error && <InlineAlert type="error">{error}</InlineAlert>}
        {error ? null : results === null ? (
          <p className="flex items-center gap-2 py-6 text-[13px] text-base-content/50">
            <Loader2 size={14} className="animate-spin" /> Buscando…
          </p>
        ) : results.length === 0 ? (
          <ToolEmpty icon={<Search />} title="Nada encontrado" description={q ? "Tente outro nome." : "Este espaço ainda não tem itens nessas ferramentas."} />
        ) : (
          <div className="max-h-80 space-y-0.5 overflow-y-auto">
            {results.map((t) => {
              const Icon = LINK_ICONS[t.kind];
              const done = isLinked(t);
              const busy = adding === `${t.kind}:${t.id}`;
              return (
                <ListItem
                  key={`${t.kind}:${t.id}`}
                  leading={t.icon ? <span className="text-[14px]">{t.icon}</span> : <Icon />}
                  title={t.title}
                  description={JOURNAL_LINK_LABEL[t.kind].label}
                  onClick={done || busy ? undefined : () => add(t)}
                  trailing={
                    busy ? (
                      <Loader2 size={14} className="animate-spin text-base-content/50" />
                    ) : done ? (
                      <span className="text-[11px] font-semibold text-success">Vinculado</span>
                    ) : (
                      <span className="text-[11px] font-semibold text-primary opacity-0 group-hover:opacity-100">Vincular</span>
                    )
                  }
                />
              );
            })}
          </div>
        )}
        <div className="flex justify-end">
          <ToolButton onClick={onClose}>Concluir</ToolButton>
        </div>
      </div>
    </ToolDialog>
  );
}

