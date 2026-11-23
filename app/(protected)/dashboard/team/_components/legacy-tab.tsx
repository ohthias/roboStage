"use client";

import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArrowRightLeft,
  Book,
  CalendarDays,
  Check,
  Cuboid,
  FlaskConical,
  Folder,
  KanbanSquare,
  Lightbulb,
  Loader2,
  MapPin,
  MessageSquareText,
  NotebookPen,
  Pencil,
  PenLine,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  Timer,
  Trash2,
  Trophy,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  IconButton,
  InfoTile,
  InlineAlert,
  ListGroup,
  ListItem,
  Panel,
  Segmented,
  TeamAvatar,
  ToolBadge,
  ToolButton,
  ToolDialog,
  ToolEmpty,
  ToolInput,
  ToolSection,
  ToolSelect,
  cn,
  useToolConfirm,
} from "@/components/stage";
import { useToast } from "@/app/context/ToastContext";
import { TransferDialog } from "@/components/stagebook/transfer/transfer-dialog";
import {
  addLegacyItems,
  createLegacyChapter,
  deleteLegacyChapter,
  getLegacySuggestions,
  removeLegacyItem,
  searchLegacyCandidates,
  updateLegacyChapter,
  updateLegacyItemNote,
} from "@/utils/stagebook/actions/legacy";
import { LABEL_PALETTE, resolveLabelColor } from "@/utils/stagebook/label-colors";
import { canDeleteResource, roleCan, type TeamRole } from "@/utils/stagebook/team-permissions";
import { formatJournalDate } from "@/types/journal";
import {
  LEGACY_ITEM_KINDS,
  LEGACY_ITEM_LABEL,
  LEGACY_LEAGUES,
  LEGACY_LEAGUE_META,
  LEGACY_LIMITS,
  LEGACY_SEASON_PRESETS,
  LEGACY_STAGE_OPTIONS,
  legacyItemIsTool,
  seasonPreset,
  stageLabel,
  type LegacyAward,
  type LegacyCandidateDTO,
  type LegacyChapterDTO,
  type LegacyChapterKind,
  type LegacyContent,
  type LegacyHighlight,
  type LegacyItemDTO,
  type LegacyItemKind,
  type LegacyLeague,
  type LegacySeasonPreset,
  type LegacyStage,
} from "@/types/legacy";
import { LegacySections } from "./legacy-sections";
import type { TeamMemberSummary } from "@/types/team-workspace";
import { useClientToday } from "@/app/(protected)/dashboard/diario/_components/use-client-value";
import { teamToolHref } from "./team-links";

export const LEGACY_ICONS: Record<LegacyItemKind, LucideIcon> = {
  stagebook: Book,
  labtest: FlaskConical,
  quickbrick: Cuboid,
  thinklab: Lightbulb,
  journal: NotebookPen,
  folder: Folder,
  kanban: KanbanSquare,
  session: Timer,
  milestone: Target,
};

/** Marca da aba: logo da temporada, sigla da liga ou um ícone. */
function ChapterMark({ chapter, size }: { chapter: LegacyChapterDTO; size: "sm" | "lg" }) {
  const preset = seasonPreset(chapter.seasonKey);
  const box = size === "lg" ? "size-16" : "size-9";
  if (preset?.logo) {
    return <Image src={preset.logo} alt={size === "lg" ? `Logo da temporada ${preset.name}` : ""} width={size === "lg" ? 64 : 36} height={size === "lg" ? 64 : 36} className={cn(box, "shrink-0 object-contain")} />;
  }
  const league = chapter.league && chapter.league !== "outra" ? LEGACY_LEAGUE_META[chapter.league] : null;
  const color = league?.color ?? chapterColor(chapter);
  return (
    <span
      aria-hidden={size === "sm"}
      className={cn(box, "grid shrink-0 place-items-center rounded-lg font-black leading-none tracking-tight text-white", size === "lg" ? "text-lg" : "text-[11px]")}
      style={{ background: color }}
    >
      {league ? (
        <span className="flex flex-col items-center">
          {league.label}
          {size === "lg" && preset && <span className="mt-0.5 text-[10px] font-semibold opacity-80">{preset.years}</span>}
        </span>
      ) : chapter.kind === "season" ? (
        <CalendarDays size={size === "lg" ? 26 : 16} />
      ) : (
        <Trophy size={size === "lg" ? 26 : 16} />
      )}
    </span>
  );
}

/** Temporadas atuais (uma por liga), para os atalhos do legado vazio. */
function currentPresets(today: string | null, taken: (string | null)[]): LegacySeasonPreset[] {
  const free = LEGACY_SEASON_PRESETS.filter((p) => !taken.includes(p.key));
  if (!today) return free.slice(0, 3);
  const current = LEGACY_LEAGUES.flatMap((l) => free.filter((p) => p.league === l && p.start <= today && today <= p.end).slice(0, 1));
  return [...current, ...free.filter((p) => !current.includes(p))].slice(0, 4);
}

const OTHERS = "outras";
const short = (d: string) => formatJournalDate(d, "short");

function periodLabel(c: Pick<LegacyChapterDTO, "kind" | "startDate" | "endDate">): string | null {
  if (!c.startDate) return null;
  if (!c.endDate || c.endDate === c.startDate) return c.kind === "season" && !c.endDate ? `desde ${short(c.startDate)}` : short(c.startDate);
  return `${short(c.startDate)} – ${short(c.endDate)}`;
}

/** Cor da aba: a escolhida, senão a da liga (OBR verde, FLL vermelho…), senão uma pelo nome. */
const chapterColor = (c: Pick<LegacyChapterDTO, "color" | "title"> & { league?: LegacyLeague | null }) =>
  c.color ?? (c.league && c.league !== "outra" ? LEGACY_LEAGUE_META[c.league].color : resolveLabelColor(null, c.title));

/** Ajuda de UX: troca `?aba=` na URL sem navegar (recarregar volta para a mesma aba). */
function rememberChapter(id: string) {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", "legado");
    url.searchParams.set("aba", id);
    window.history.replaceState(window.history.state, "", url);
  } catch {
    /* sem histórico (ex.: iframe restrito) */
  }
}

/**
 * Legado da equipe: uma aba por temporada (e, dentro dela, por competição)
 * com o que foi feito naquele período — texto, resultado, prêmios, quem
 * participou — e os arquivos das ferramentas guardados ali, sempre atualizados.
 */
export function LegacyTab({
  teamId,
  teamName,
  viewerId,
  viewerRole,
  chapters,
  members,
  initialChapterId,
}: {
  teamId: string;
  teamName: string;
  viewerId: string;
  viewerRole: TeamRole;
  chapters: LegacyChapterDTO[];
  members: TeamMemberSummary[];
  initialChapterId: string | null;
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const today = useClientToday();
  const canEdit = roleCan(viewerRole, "tool.create");

  const seasons = useMemo(() => chapters.filter((c) => c.kind === "season"), [chapters]);
  const seasonIds = useMemo(() => new Set(seasons.map((s) => s.id)), [seasons]);
  const compsOf = (seasonId: string | null) =>
    chapters.filter((c) => c.kind === "competition" && (seasonId ? c.parentId === seasonId : !c.parentId || !seasonIds.has(c.parentId)));
  const orphans = compsOf(null);

  const [selectedId, setSelectedId] = useState<string | null>(initialChapterId);
  // Aba excluída (ou nenhuma escolhida): cai na temporada mais recente.
  const selected = chapters.find((c) => c.id === selectedId) ?? seasons[0] ?? chapters[0] ?? null;
  const group = !selected ? null : selected.kind === "season" ? selected.id : selected.parentId && seasonIds.has(selected.parentId) ? selected.parentId : OTHERS;
  const groupSeason = group && group !== OTHERS ? (chapters.find((c) => c.id === group) ?? null) : null;
  const groupComps = group === OTHERS ? orphans : group ? compsOf(group) : [];

  const select = (id: string) => {
    setSelectedId(id);
    rememberChapter(id);
  };

  const [chapterDialog, setChapterDialog] = useState<{ mode: "create"; kind: LegacyChapterKind; parentId: string | null } | { mode: "edit"; chapter: LegacyChapterDTO } | null>(null);
  const [transferOpen, setTransferOpen] = useState(false);
  const [creatingPreset, startPreset] = useTransition();

  const quickPresets = currentPresets(today, seasons.map((s) => s.seasonKey));

  function quickSeason(key: string) {
    startPreset(async () => {
      const res = await createLegacyChapter(teamId, { kind: "season", seasonKey: key });
      if (!res.ok) return addToast(res.error, "error");
      addToast("Temporada criada no legado.", "success");
      select(res.data.id);
      router.refresh();
    });
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Legado da equipe</h2>
          <p className="max-w-2xl text-sm text-base-content/60">
            Uma aba por temporada (FLL, OBR, FTC ou outra) e por competição: o que a equipe fez, resultados, rodadas, projeto,
            quem participou e os arquivos das ferramentas daquele ano.
          </p>
        </div>
        {canEdit && (
          <div className="flex flex-wrap gap-2">
            <ToolButton size="md" icon={<ArrowRightLeft />} onClick={() => setTransferOpen(true)}>
              Trazer do pessoal
            </ToolButton>
            <ToolButton size="md" variant="primary" icon={<Plus />} onClick={() => setChapterDialog({ mode: "create", kind: "season", parentId: null })}>
              Nova temporada
            </ToolButton>
          </div>
        )}
      </div>

      {chapters.length === 0 ? (
        <ToolEmpty
          icon={<Archive />}
          title="O legado ainda está vazio"
          description="Crie uma aba para cada temporada. Dentro dela, registre as competições, o que foi feito e guarde os arquivos daquele ano."
          className="bg-base-100 py-12"
          action={
            canEdit ? (
              <div className="flex flex-wrap justify-center gap-2">
                {quickPresets.map((p, i) => (
                  <ToolButton key={p.key} variant={i === 0 ? "primary" : "outline"} disabled={creatingPreset} onClick={() => quickSeason(p.key)}>
                    {p.league === "obr" ? p.title : `${LEGACY_LEAGUE_META[p.league].label} · ${p.title}`}
                  </ToolButton>
                ))}
                <ToolButton variant="ghost" icon={<Plus />} onClick={() => setChapterDialog({ mode: "create", kind: "season", parentId: null })}>
                  Outra
                </ToolButton>
              </div>
            ) : undefined
          }
        />
      ) : (
        <>
          {/* ---------------------------------------------- temporadas */}
          <nav aria-label="Temporadas" className="-mx-1 overflow-x-auto px-1 pb-1">
            <ul className="flex gap-2">
              {seasons.map((s) => (
                <li key={s.id} className="shrink-0">
                  <SeasonChip chapter={s} active={group === s.id} count={compsOf(s.id).length} onClick={() => select(s.id)} />
                </li>
              ))}
              {orphans.length > 0 && (
                <li className="shrink-0">
                  <button
                    type="button"
                    aria-current={group === OTHERS ? "page" : undefined}
                    onClick={() => select(orphans[0].id)}
                    className={cn(
                      "flex h-14 items-center gap-2 rounded-lg border px-3 text-left transition-colors",
                      group === OTHERS ? "border-primary bg-primary/5" : "border-base-300 bg-base-100 hover:border-base-content/25",
                    )}
                  >
                    <Trophy size={18} className="text-base-content/50" />
                    <span>
                      <span className="block text-[13px] font-bold">Outras competições</span>
                      <span className="block text-[11px] text-base-content/50">{orphans.length} sem temporada</span>
                    </span>
                  </button>
                </li>
              )}
            </ul>
          </nav>

          {/* ---------------------------------------------- competições da temporada */}
          {(groupSeason || group === OTHERS) && (
            <div className="flex flex-wrap items-center gap-1.5 border-b border-base-300 pb-2">
              {groupSeason && (
                <SubTab active={selected?.id === groupSeason.id} onClick={() => select(groupSeason.id)} icon={<CalendarDays size={13} />}>
                  Temporada inteira
                </SubTab>
              )}
              {groupComps.map((c) => (
                <SubTab key={c.id} active={selected?.id === c.id} onClick={() => select(c.id)} icon={<Trophy size={13} />} color={chapterColor(c)}>
                  {c.title}
                </SubTab>
              ))}
              {canEdit && (
                <ToolButton
                  size="xs"
                  variant="ghost"
                  icon={<Plus />}
                  onClick={() => setChapterDialog({ mode: "create", kind: "competition", parentId: groupSeason?.id ?? null })}
                >
                  Competição
                </ToolButton>
              )}
            </div>
          )}

          {selected && (
            <ChapterView
              key={selected.id}
              teamId={teamId}
              chapter={selected}
              competitions={selected.kind === "season" ? compsOf(selected.id) : []}
              members={members}
              canEdit={canEdit}
              canDelete={canDeleteResource(viewerRole, selected.createdBy, viewerId)}
              onEdit={() => setChapterDialog({ mode: "edit", chapter: selected })}
              onOpen={select}
            />
          )}
        </>
      )}

      <ChapterDialog
        teamId={teamId}
        state={chapterDialog}
        seasons={seasons}
        onClose={() => setChapterDialog(null)}
        onSaved={(id) => {
          setChapterDialog(null);
          if (id) select(id);
          router.refresh();
        }}
      />
      <TransferDialog open={transferOpen} onClose={() => setTransferOpen(false)} teams={[{ id: teamId, name: teamName }]} fixedTeamId={teamId} />
    </section>
  );
}

// ============================================================================
// Navegação
// ============================================================================

function SeasonChip({ chapter, active, count, onClick }: { chapter: LegacyChapterDTO; active: boolean; count: number; onClick: () => void }) {
  const color = chapterColor(chapter);
  return (
    <button
      type="button"
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={cn(
        "relative flex h-14 min-w-44 items-center gap-2.5 overflow-hidden rounded-lg border px-3 text-left transition-colors",
        active ? "border-primary bg-primary/5" : "border-base-300 bg-base-100 hover:border-base-content/25",
      )}
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-1" style={{ background: color }} />
      <ChapterMark chapter={chapter} size="sm" />
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-bold">{chapter.title}</span>
        <span className="block truncate text-[11px] text-base-content/50">
          {[
            chapter.league ? LEGACY_LEAGUE_META[chapter.league].label : null,
            chapter.startDate ? chapter.startDate.slice(0, 4) : null,
            count ? `${count} ${count === 1 ? "competição" : "competições"}` : null,
          ]
            .filter(Boolean)
            .join(" · ") || "Sem datas"}
        </span>
      </span>
    </button>
  );
}

function SubTab({ active, onClick, icon, color, children }: { active: boolean; onClick: () => void; icon: ReactNode; color?: string; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-current={active ? "true" : undefined}
      onClick={onClick}
      className={cn(
        "inline-flex h-7 max-w-56 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-semibold transition-colors",
        active ? "bg-base-content text-base-100" : "text-base-content/65 hover:bg-base-content/[0.06] hover:text-base-content",
      )}
    >
      <span style={color && !active ? { color } : undefined}>{icon}</span>
      <span className="truncate">{children}</span>
    </button>
  );
}

// ============================================================================
// Uma aba
// ============================================================================

function ChapterView({
  teamId,
  chapter,
  competitions,
  members,
  canEdit,
  canDelete,
  onEdit,
  onOpen,
}: {
  teamId: string;
  chapter: LegacyChapterDTO;
  competitions: LegacyChapterDTO[];
  members: TeamMemberSummary[];
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onOpen: (id: string) => void;
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const { confirm, dialog: confirmDialog } = useToolConfirm();
  const [contentOpen, setContentOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [syncOpen, setSyncOpen] = useState(false);
  const [noteItem, setNoteItem] = useState<LegacyItemDTO | null>(null);

  const color = chapterColor(chapter);
  const c = chapter.content;
  const stage = stageLabel(chapter.league, chapter.stage);
  const period = periodLabel(chapter);
  const isSeason = chapter.kind === "season";
  const hasText = Boolean(c.summary || c.highlights?.length || c.lessons);
  const grouped = LEGACY_ITEM_KINDS.map((kind) => ({ kind, items: chapter.items.filter((i) => i.kind === kind) })).filter((g) => g.items.length);

  async function remove() {
    const ok = await confirm({
      title: `Excluir “${chapter.title}”?`,
      message: `${isSeason && competitions.length ? `As ${competitions.length} competições dela ficam em “Outras competições”. ` : ""}Os arquivos guardados continuam nas ferramentas; só saem do legado. Não pode ser desfeito.`,
      intent: "danger",
      confirmLabel: "Excluir",
    });
    if (!ok) return;
    const res = await deleteLegacyChapter(teamId, chapter.id);
    if (!res.ok) return addToast(res.error, "error");
    addToast("Aba excluída do legado.", "success");
    router.refresh();
  }

  async function removeItem(item: LegacyItemDTO) {
    const res = await removeLegacyItem(teamId, chapter.id, item.id);
    if (!res.ok) return addToast(res.error, "error");
    addToast(`“${item.title}” saiu desta aba (continua em ${LEGACY_ITEM_LABEL[item.kind].tool}).`, "success");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* ------------------------------------------------ cabeçalho */}
      <article className="overflow-hidden rounded-lg border border-base-300 bg-base-100">
        <div className="h-1.5" style={{ background: color }} aria-hidden />
        <div className="flex flex-wrap items-start gap-4 p-4">
          <ChapterMark chapter={chapter} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] tracking-[0.2em] text-base-content/45">
              / {isSeason ? "TEMPORADA" : "COMPETIÇÃO"}
              {chapter.league && chapter.league !== "outra" ? ` · ${LEGACY_LEAGUE_META[chapter.league].label}` : ""}
              {stage ? ` · ${stage.toUpperCase()}` : ""}
            </p>
            <h3 className="text-xl font-black tracking-tight">{chapter.title}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-base-content/60">
              {period && (
                <span className="inline-flex items-center gap-1">
                  <CalendarDays size={12} /> {period}
                </span>
              )}
              {chapter.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={12} /> {chapter.location}
                </span>
              )}
              {c.modality && <span>Modalidade: <strong className="text-base-content/80">{c.modality}</strong></span>}
              {c.robotName && <span>Robô: <strong className="text-base-content/80">{c.robotName}</strong></span>}
            </div>
            {(c.result || c.awards?.length) && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {c.result && (
                  <ToolBadge tone="primary" className="gap-1">
                    <Trophy className="size-3" /> {c.result}
                  </ToolBadge>
                )}
                {c.awards?.map((a) => (
                  <ToolBadge key={a.id} tone="accent">
                    {a.title}
                  </ToolBadge>
                ))}
              </div>
            )}
          </div>
          <div className="flex shrink-0 gap-1">
            {canEdit && (
              <>
                <ToolButton size="sm" icon={<PenLine />} onClick={() => setContentOpen(true)}>
                  Escrever
                </ToolButton>
                <IconButton label="Editar nome e datas" icon={<Pencil />} onClick={onEdit} />
              </>
            )}
            {canDelete && <IconButton label={`Excluir ${chapter.title}`} icon={<Trash2 />} className="hover:text-error" onClick={remove} />}
          </div>
        </div>
      </article>

      {/* ------------------------------------------------ números do período */}
      {chapter.stats && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          <InfoTile label="Rodadas no LabTest" value={chapter.stats.executions} />
          <InfoTile label="Melhor pontuação" value={chapter.stats.bestScore ?? "—"} unit={chapter.stats.bestScore !== null ? "pts" : undefined} />
          <InfoTile label="Entradas no diário" value={chapter.stats.journalEntries} />
          <InfoTile label="Treinos" value={chapter.stats.trainingSessions} />
          <InfoTile label="Metas concluídas" value={chapter.stats.milestonesCompleted} />
        </div>
      )}
      {!chapter.startDate && canEdit && (
        <InlineAlert
          type="info"
          title="Sem datas"
          action={
            <ToolButton size="xs" onClick={onEdit}>
              Definir período
            </ToolButton>
          }
        >
          Com o período definido, o legado mostra os números da época e sugere os arquivos criados nela.
        </InlineAlert>
      )}

      {/* ------------------------------------------------ texto + resultado */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Panel title="O que fizemos" icon={<MessageSquareText />}>
            {hasText ? (
              <div className="space-y-4 text-[13px] leading-relaxed">
                {c.summary && <p className="whitespace-pre-line">{c.summary}</p>}
                {c.highlights?.length ? (
                  <div>
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-base-content/50">Momentos marcantes</p>
                    <ol className="relative space-y-2 border-l border-base-300 pl-4">
                      {c.highlights.map((h) => (
                        <li key={h.id} className="relative">
                          <span aria-hidden className="absolute -left-[21px] top-1.5 size-2.5 rounded-full border-2 border-base-100" style={{ background: color }} />
                          {h.text}
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null}
                {c.lessons && (
                  <div>
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-base-content/50">O que aprendemos</p>
                    <p className="whitespace-pre-line text-base-content/75">{c.lessons}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-start gap-2 py-2">
                <p className="text-[13px] text-base-content/55">
                  {isSeason ? "Conte como foi a temporada: o desafio, o robô, o projeto de inovação, as viradas." : "Conte como foi a competição: rodadas, entrevistas, o que deu certo."}
                </p>
                {canEdit && (
                  <ToolButton size="xs" variant="primary" icon={<PenLine />} onClick={() => setContentOpen(true)}>
                    Escrever o resumo
                  </ToolButton>
                )}
              </div>
            )}
          </Panel>

          {isSeason && competitions.length > 0 && (
            <Panel title="Competições da temporada" icon={<Trophy />} padded={false}>
              <ul className="divide-y divide-base-300">
                {competitions.map((comp) => (
                  <li key={comp.id}>
                    <button type="button" onClick={() => onOpen(comp.id)} className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-base-content/[0.04]">
                      <span className="size-2.5 shrink-0 rounded-full" style={{ background: chapterColor(comp) }} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-semibold">{comp.title}</span>
                        <span className="block truncate text-[11px] text-base-content/50">
                          {[periodLabel(comp), comp.location, comp.items.length ? `${comp.items.length} ${comp.items.length === 1 ? "arquivo" : "arquivos"}` : null].filter(Boolean).join(" · ") || "Sem detalhes"}
                        </span>
                      </span>
                      {comp.content.result && <ToolBadge tone="primary">{comp.content.result}</ToolBadge>}
                    </button>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>

        <div className="space-y-4">
          <Panel title="Prêmios e resultado" icon={<Trophy />}>
            {c.result || c.awards?.length ? (
              <div className="space-y-2 text-[13px]">
                {c.result && (
                  <p>
                    <span className="text-base-content/50">Resultado: </span>
                    <strong>{c.result}</strong>
                  </p>
                )}
                {c.awards?.length ? (
                  <ul className="space-y-1.5">
                    {c.awards.map((a) => (
                      <li key={a.id} className="flex gap-2">
                        <Trophy size={14} className="mt-0.5 shrink-0 text-warning" />
                        <span>
                          <span className="font-semibold">{a.title}</span>
                          {a.detail && <span className="block text-[12px] text-base-content/55">{a.detail}</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : (
              <p className="text-[12px] text-base-content/50">Nenhum resultado registrado.</p>
            )}
          </Panel>

          <Panel title={`Quem participou${chapter.members.length ? ` · ${chapter.members.length}` : ""}`} icon={<Users />}>
            {chapter.members.length ? (
              <ul className="flex flex-wrap gap-2">
                {chapter.members.map((m) => (
                  <li key={m.id} className="flex items-center gap-1.5 rounded-full bg-base-200/70 py-0.5 pl-0.5 pr-2.5 text-[12px]" title={m.current ? undefined : "Não está mais na equipe"}>
                    <TeamAvatar name={m.name ?? "Membro"} src={m.avatarUrl ?? undefined} size={22} />
                    <span className={cn("font-medium", !m.current && "text-base-content/50")}>{m.name ?? "Membro"}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[12px] text-base-content/50">Marque quem fez parte {isSeason ? "desta temporada" : "desta competição"} em “Escrever”.</p>
            )}
          </Panel>
        </div>
      </div>

      {/* ------------------------------------------------ seções de documentação */}
      <LegacySections teamId={teamId} chapter={chapter} league={chapter.league} canEdit={canEdit} />

      {/* ------------------------------------------------ arquivos */}
      <Panel
        title={`Arquivos guardados${chapter.items.length ? ` · ${chapter.items.length}` : ""}`}
        icon={<Archive />}
        actions={
          canEdit ? (
            <>
              <ToolButton size="xs" variant="ghost" icon={<RefreshCw />} onClick={() => setSyncOpen(true)}>
                Sincronizar
              </ToolButton>
              <ToolButton size="xs" variant="ghost" icon={<Plus />} onClick={() => setPickerOpen(true)}>
                Adicionar
              </ToolButton>
            </>
          ) : undefined
        }
      >
        {chapter.items.length === 0 ? (
          <ToolEmpty
            icon={<Archive />}
            title="Nada guardado ainda"
            description="Guarde páginas e pastas do StageBook, testes, cadernos do robô, quadros, Kanbans, treinos, metas e entradas do diário deste período. O legado mostra sempre a versão atual de cada um."
            action={
              canEdit ? (
                <div className="flex flex-wrap justify-center gap-2">
                  <ToolButton size="sm" variant="primary" icon={<Sparkles />} onClick={() => setSyncOpen(true)}>
                    Ver sugestões
                  </ToolButton>
                  <ToolButton size="sm" icon={<Search />} onClick={() => setPickerOpen(true)}>
                    Buscar
                  </ToolButton>
                </div>
              ) : undefined
            }
          />
        ) : (
          <div className="grid gap-x-6 gap-y-2 md:grid-cols-2">
            {grouped.map(({ kind, items }) => {
              const Icon = LEGACY_ICONS[kind];
              return (
                <ListGroup key={kind} label={`${LEGACY_ITEM_LABEL[kind].tool} · ${items.length}`}>
                  {items.map((item) => (
                    <div key={item.id} className="group flex items-center gap-1 rounded-md hover:bg-base-content/[0.04]">
                      <a href={legacyItemIsTool(item.kind) ? teamToolHref(teamId, item.href) : item.href} className="flex min-w-0 flex-1 items-center gap-2.5 px-2 py-1.5">
                        <span className="grid size-7 shrink-0 place-items-center rounded-md bg-base-200 text-base-content/70">
                          {item.icon ? <span className="text-[14px]">{item.icon}</span> : <Icon size={16} />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-semibold">{item.title}</span>
                          <span className="block truncate text-[11px] text-base-content/55">
                            {item.note ? <span className="italic text-base-content/70">“{item.note}”</span> : item.meta}
                          </span>
                        </span>
                      </a>
                      {canEdit && (
                        <span className="flex shrink-0 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                          <IconButton size="xs" label={`Legenda de ${item.title}`} icon={<MessageSquareText />} onClick={() => setNoteItem(item)} />
                          <IconButton size="xs" label={`Tirar ${item.title} desta aba`} icon={<X />} className="hover:text-error" onClick={() => removeItem(item)} />
                        </span>
                      )}
                    </div>
                  ))}
                </ListGroup>
              );
            })}
          </div>
        )}
      </Panel>

      <ContentDialog open={contentOpen} onClose={() => setContentOpen(false)} teamId={teamId} chapter={chapter} members={members} />
      <ItemPicker open={pickerOpen} onClose={() => setPickerOpen(false)} teamId={teamId} chapter={chapter} />
      <SuggestionsDialog open={syncOpen} onClose={() => setSyncOpen(false)} teamId={teamId} chapter={chapter} />
      <NoteDialog item={noteItem} onClose={() => setNoteItem(null)} teamId={teamId} chapterId={chapter.id} />
      {confirmDialog}
    </div>
  );
}

// ============================================================================
// Criar / editar aba
// ============================================================================

type ChapterDraft = {
  kind: LegacyChapterKind;
  league: LegacyLeague | "";
  seasonKey: string;
  stage: LegacyStage | "";
  title: string;
  parentId: string;
  startDate: string;
  endDate: string;
  location: string;
  color: string | null;
};

type ChapterDialogState = { mode: "create"; kind: LegacyChapterKind; parentId: string | null } | { mode: "edit"; chapter: LegacyChapterDTO };

function initialDraft(state: ChapterDialogState, seasons: LegacyChapterDTO[]): ChapterDraft {
  if (state.mode === "edit") {
    const c = state.chapter;
    return {
      kind: c.kind,
      league: c.league ?? "",
      seasonKey: c.seasonKey ?? "",
      stage: c.stage ?? "",
      title: c.title,
      parentId: c.parentId ?? "",
      startDate: c.startDate ?? "",
      endDate: c.endDate ?? "",
      location: c.location ?? "",
      color: c.color,
    };
  }
  // Temporada nova já vem com a próxima temporada (FLL) que ainda não tem aba.
  const preset = state.kind === "season" ? LEGACY_SEASON_PRESETS.find((p) => !seasons.some((s) => s.seasonKey === p.key)) : null;
  const parent = state.parentId ? seasons.find((s) => s.id === state.parentId) : null;
  return {
    kind: state.kind,
    league: preset?.league ?? parent?.league ?? "",
    seasonKey: preset?.key ?? "",
    stage: "",
    title: preset?.title ?? "",
    parentId: state.parentId ?? "",
    startDate: preset?.start ?? "",
    endDate: preset?.end ?? "",
    location: "",
    color: null,
  };
}

type ChapterDialogProps = {
  teamId: string;
  state: ChapterDialogState | null;
  seasons: LegacyChapterDTO[];
  onClose: () => void;
  onSaved: (id: string | null) => void;
};

function ChapterDialog(props: ChapterDialogProps) {
  return props.state ? <ChapterDialogBody {...props} state={props.state} /> : null;
}

const STAGE_LABELS = new Set(Object.values(LEGACY_STAGE_OPTIONS).flatMap((list) => list.map((o) => o.label)));

function ChapterDialogBody({ teamId, state, seasons, onClose, onSaved }: ChapterDialogProps & { state: ChapterDialogState }) {
  const [draft, setDraft] = useState<ChapterDraft>(() => initialDraft(state, seasons));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const editing = state.mode === "edit";
  const isSeason = draft.kind === "season";
  const parent = !isSeason && draft.parentId ? (seasons.find((s) => s.id === draft.parentId) ?? null) : null;
  // Competição dentro de uma temporada usa a liga dela.
  const league: LegacyLeague | "" = parent?.league ?? draft.league;
  const presets = LEGACY_SEASON_PRESETS.filter((p) => !league || p.league === league);

  function pickLeague(next: LegacyLeague) {
    setDraft((d) => {
      const keep = seasonPreset(d.seasonKey)?.league === next;
      return { ...d, league: next, ...(keep || d.kind !== "season" ? {} : { seasonKey: "" }) };
    });
  }

  function pickPreset(key: string) {
    const p = seasonPreset(key);
    setDraft((d) => ({
      ...d,
      seasonKey: key,
      ...(p ? { league: p.league, title: p.title, startDate: p.start, endDate: p.end } : {}),
    }));
  }

  function pickStage(stage: LegacyStage | "") {
    const label = LEGACY_STAGE_OPTIONS[league || "outra"].find((o) => o.stage === stage)?.label;
    setDraft((d) => ({
      ...d,
      stage,
      // Sem nome (ou com o nome de outra etapa): usa o nome da etapa.
      ...(label && (!d.title.trim() || STAGE_LABELS.has(d.title.trim())) ? { title: label } : {}),
    }));
  }

  function save() {
    setError(null);
    if (!draft.title.trim()) return setError("Dê um nome para a aba.");
    startTransition(async () => {
      const input = {
        kind: draft.kind,
        title: draft.title,
        league: parent ? null : draft.league || null,
        seasonKey: isSeason ? draft.seasonKey || null : null,
        stage: !isSeason ? draft.stage || null : null,
        parentId: !isSeason ? draft.parentId || null : null,
        startDate: draft.startDate || null,
        endDate: draft.endDate || null,
        location: draft.location || null,
        color: draft.color,
      };
      if (state.mode === "edit") {
        const res = await updateLegacyChapter(teamId, state.chapter.id, input);
        if (!res.ok) return setError(res.error);
        onSaved(state.chapter.id);
      } else {
        const res = await createLegacyChapter(teamId, input);
        if (!res.ok) return setError(res.error);
        onSaved(res.data.id);
      }
    });
  }

  return (
    <ToolDialog
      open
      onClose={onClose}
      size="md"
      title={editing ? `Editar ${isSeason ? "temporada" : "competição"}` : isSeason ? "Nova temporada" : "Nova competição"}
      description="Visível para toda a equipe."
      footer={
        <>
          <ToolButton onClick={onClose} disabled={pending}>
            Cancelar
          </ToolButton>
          <ToolButton variant="primary" onClick={save} disabled={pending || !draft.title.trim()} icon={pending ? <Loader2 className="animate-spin" /> : undefined}>
            {editing ? "Salvar" : "Criar aba"}
          </ToolButton>
        </>
      }
    >
      <form
        className="space-y-3 pb-1"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        {error && <InlineAlert type="error">{error}</InlineAlert>}
        {!editing && (
          <Segmented<LegacyChapterKind>
            label="Tipo"
            value={draft.kind}
            onChange={(kind) =>
              setDraft({
                ...draft,
                kind,
                ...(kind === "competition" ? { seasonKey: "", title: "", startDate: "", endDate: "" } : { stage: "", parentId: "" }),
              })
            }
            options={[
              { value: "season", label: "Temporada", icon: <CalendarDays /> },
              { value: "competition", label: "Competição", icon: <Trophy /> },
            ]}
          />
        )}

        {!isSeason && (
          <ToolSection title="Temporada">
            <ToolSelect value={draft.parentId} onChange={(e) => setDraft({ ...draft, parentId: e.target.value })} aria-label="Temporada da competição">
              <option value="">Sem temporada</option>
              {seasons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </ToolSelect>
          </ToolSection>
        )}

        <ToolSection title="Competição">
          {parent ? (
            <p className="text-[12px] text-base-content/60">
              {parent.league ? `${LEGACY_LEAGUE_META[parent.league].name}, como a temporada.` : "Sem liga definida na temporada."}
            </p>
          ) : (
            <Segmented<LegacyLeague>
              label="Liga"
              size="xs"
              value={(draft.league || "outra") as LegacyLeague}
              onChange={pickLeague}
              className="flex-wrap"
              options={LEGACY_LEAGUES.map((l) => ({ value: l, label: LEGACY_LEAGUE_META[l].label, title: LEGACY_LEAGUE_META[l].name }))}
            />
          )}
        </ToolSection>

        {isSeason && league !== "outra" && presets.length > 0 && (
          <ToolSection title={league === "obr" ? "Ano da OBR" : "Temporada"}>
            <ToolSelect value={draft.seasonKey} onChange={(e) => pickPreset(e.target.value)} aria-label="Temporada conhecida">
              <option value="">Outra / personalizada</option>
              {presets.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.league === "obr" ? p.title : `${p.name} (${p.years})`}
                </option>
              ))}
            </ToolSelect>
            <p className="text-[11px] text-base-content/50">
              {league === "obr"
                ? "A OBR vai de janeiro a dezembro. O legado sugere as rodadas OBR do LabTest e o que foi feito no ano."
                : "Com a temporada escolhida, o legado mostra o logo e sugere os testes e cadernos dela."}
            </p>
          </ToolSection>
        )}

        {!isSeason && (
          <ToolSection title="Etapa">
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Etapa">
              {LEGACY_STAGE_OPTIONS[league || "outra"].map((o) => (
                <button
                  key={o.stage}
                  type="button"
                  role="radio"
                  aria-checked={draft.stage === o.stage}
                  onClick={() => pickStage(draft.stage === o.stage ? "" : o.stage)}
                  className={cn(
                    "h-7 rounded-md border px-2.5 text-[12px] font-semibold transition-colors",
                    draft.stage === o.stage ? "border-primary bg-primary/10 text-primary" : "border-base-300 text-base-content/65 hover:border-base-content/30",
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </ToolSection>
        )}

        <ToolSection title="Nome">
          <ToolInput
            autoFocus
            maxLength={LEGACY_LIMITS.title}
            placeholder={isSeason ? (league === "obr" ? "Ex.: OBR 2026" : "Ex.: Unearthed 2025/26") : league === "obr" ? "Ex.: Etapa estadual SP" : "Ex.: Regional São Paulo"}
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          />
        </ToolSection>
        <div className="grid gap-3 sm:grid-cols-2">
          <ToolSection title={isSeason ? "Início" : "Data"}>
            <ToolInput type="date" value={draft.startDate} onChange={(e) => setDraft({ ...draft, startDate: e.target.value })} icon={<CalendarDays />} />
          </ToolSection>
          <ToolSection title={isSeason ? "Fim (opcional)" : "Último dia (se durou mais de um)"}>
            <ToolInput type="date" value={draft.endDate} min={draft.startDate || undefined} onChange={(e) => setDraft({ ...draft, endDate: e.target.value })} icon={<CalendarDays />} />
          </ToolSection>
        </div>
        {!isSeason && (
          <ToolSection title="Local (opcional)">
            <ToolInput maxLength={LEGACY_LIMITS.location} placeholder="Ex.: São Paulo, SP" value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} icon={<MapPin />} />
          </ToolSection>
        )}
        <ToolSection title="Cor">
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Cor da aba">
            {LABEL_PALETTE.map((p) => (
              <button
                key={p.value}
                type="button"
                role="radio"
                aria-checked={draft.color === p.value}
                title={p.name}
                onClick={() => setDraft({ ...draft, color: draft.color === p.value ? null : p.value })}
                className={cn("size-6 rounded-full border border-black/10", draft.color === p.value && "ring-2 ring-base-content/60 ring-offset-2 ring-offset-base-100")}
                style={{ backgroundColor: p.value }}
              />
            ))}
          </div>
        </ToolSection>
      </form>
    </ToolDialog>
  );
}

// ============================================================================
// Escrever (conteúdo da aba)
// ============================================================================

const newRowId = () => Math.random().toString(36).slice(2, 10);
const textareaCls =
  "w-full rounded-md border border-base-300 bg-base-100 px-2.5 py-1.5 text-[13px] leading-relaxed outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

type ContentDialogProps = {
  open: boolean;
  onClose: () => void;
  teamId: string;
  chapter: LegacyChapterDTO;
  members: TeamMemberSummary[];
};

function ContentDialog(props: ContentDialogProps) {
  return props.open ? <ContentDialogBody {...props} /> : null;
}

function ContentDialogBody({ onClose, teamId, chapter, members }: ContentDialogProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [draft, setDraft] = useState(() => fromContent(chapter.content));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Membros atuais + quem já estava marcado e saiu da equipe.
  const people = useMemo(() => {
    const list = members.map((m) => ({ id: m.userId, name: m.name, avatarUrl: m.avatarUrl, current: true }));
    for (const m of chapter.members) if (!list.some((p) => p.id === m.id)) list.push({ ...m, current: false });
    return list;
  }, [members, chapter.members]);

  function save() {
    setError(null);
    startTransition(async () => {
      // Mantém as seções (editadas à parte) e troca só o que este diálogo edita.
      const res = await updateLegacyChapter(teamId, chapter.id, { content: { ...chapter.content, ...draft } });
      if (!res.ok) return setError(res.error);
      addToast("Legado atualizado.", "success");
      onClose();
      router.refresh();
    });
  }

  const setAward = (i: number, patch: Partial<LegacyAward>) => setDraft({ ...draft, awards: draft.awards.map((a, j) => (j === i ? { ...a, ...patch } : a)) });
  const setHighlight = (i: number, text: string) => setDraft({ ...draft, highlights: draft.highlights.map((h, j) => (j === i ? { ...h, text } : h)) });
  const togglePerson = (id: string) =>
    setDraft({ ...draft, members: draft.members.includes(id) ? draft.members.filter((m) => m !== id) : [...draft.members, id] });

  return (
    <ToolDialog
      open
      onClose={onClose}
      size="lg"
      title={`Escrever em “${chapter.title}”`}
      description="O que a equipe quer lembrar daqui a alguns anos."
      footer={
        <>
          <ToolButton onClick={onClose} disabled={pending}>
            Cancelar
          </ToolButton>
          <ToolButton variant="primary" onClick={save} disabled={pending} icon={pending ? <Loader2 className="animate-spin" /> : undefined}>
            Salvar
          </ToolButton>
        </>
      }
    >
      <form
        className="space-y-4 pb-2"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        {error && <InlineAlert type="error">{error}</InlineAlert>}
        <ToolSection title="Resumo">
          <textarea
            autoFocus
            className={cn(textareaCls, "min-h-28")}
            maxLength={LEGACY_LIMITS.summary}
            placeholder="O desafio, as escolhas do robô, o projeto, o que mudou ao longo do caminho…"
            value={draft.summary}
            onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
          />
        </ToolSection>

        <div className="grid gap-3 sm:grid-cols-3">
          <ToolSection title="Modalidade / categoria">
            <ToolInput
              list={`modalities-${chapter.id}`}
              maxLength={80}
              placeholder={chapter.league === "obr" ? "Ex.: Prática · Resgate" : "Opcional"}
              value={draft.modality}
              onChange={(e) => setDraft({ ...draft, modality: e.target.value })}
            />
            <datalist id={`modalities-${chapter.id}`}>
              {(chapter.league ? LEGACY_LEAGUE_META[chapter.league].modalities : []).map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </ToolSection>
          <ToolSection title="Resultado">
            <ToolInput maxLength={LEGACY_LIMITS.result} placeholder="Ex.: 2º lugar geral" value={draft.result} onChange={(e) => setDraft({ ...draft, result: e.target.value })} icon={<Trophy />} />
          </ToolSection>
          <ToolSection title="Robô">
            <ToolInput maxLength={LEGACY_LIMITS.robotName} placeholder="Nome do robô" value={draft.robotName} onChange={(e) => setDraft({ ...draft, robotName: e.target.value })} icon={<Cuboid />} />
          </ToolSection>
        </div>

        <ToolSection title="Prêmios">
          <ul className="space-y-1.5">
            {draft.awards.map((a, i) => (
              <li key={a.id} className="grid grid-cols-[1fr_1.4fr_auto] items-center gap-1.5">
                <ToolInput aria-label={`Prêmio ${i + 1}`} maxLength={LEGACY_LIMITS.awardTitle} placeholder="Ex.: Robot Design" value={a.title} onChange={(e) => setAward(i, { title: e.target.value })} />
                <ToolInput aria-label={`Detalhe do prêmio ${i + 1}`} maxLength={LEGACY_LIMITS.awardDetail} placeholder="Onde / detalhe (opcional)" value={a.detail} onChange={(e) => setAward(i, { detail: e.target.value })} />
                <IconButton size="xs" label="Remover prêmio" icon={<X />} onClick={() => setDraft({ ...draft, awards: draft.awards.filter((_, j) => j !== i) })} />
              </li>
            ))}
          </ul>
          {draft.awards.length < LEGACY_LIMITS.awards && (
            <ToolButton size="xs" variant="ghost" icon={<Plus />} onClick={() => setDraft({ ...draft, awards: [...draft.awards, { id: newRowId(), title: "", detail: "" }] })}>
              Adicionar prêmio
            </ToolButton>
          )}
        </ToolSection>

        <ToolSection title="Momentos marcantes">
          <ul className="space-y-1.5">
            {draft.highlights.map((h, i) => (
              <li key={h.id} className="flex items-center gap-1.5">
                <ToolInput
                  aria-label={`Momento ${i + 1}`}
                  maxLength={LEGACY_LIMITS.highlightText}
                  placeholder="Ex.: Primeira rodada acima de 300 pontos"
                  value={h.text}
                  onChange={(e) => setHighlight(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (draft.highlights.length < LEGACY_LIMITS.highlights) setDraft({ ...draft, highlights: [...draft.highlights, { id: newRowId(), text: "" }] });
                    }
                  }}
                />
                <IconButton size="xs" label="Remover momento" icon={<X />} onClick={() => setDraft({ ...draft, highlights: draft.highlights.filter((_, j) => j !== i) })} />
              </li>
            ))}
          </ul>
          {draft.highlights.length < LEGACY_LIMITS.highlights && (
            <ToolButton size="xs" variant="ghost" icon={<Plus />} onClick={() => setDraft({ ...draft, highlights: [...draft.highlights, { id: newRowId(), text: "" }] })}>
              Adicionar momento
            </ToolButton>
          )}
        </ToolSection>

        <ToolSection title="O que aprendemos">
          <textarea
            className={cn(textareaCls, "min-h-20")}
            maxLength={LEGACY_LIMITS.lessons}
            placeholder="O que faríamos de novo, o que faríamos diferente, dicas para a próxima equipe."
            value={draft.lessons}
            onChange={(e) => setDraft({ ...draft, lessons: e.target.value })}
          />
        </ToolSection>

        <ToolSection title="Quem participou">
          <ul className="flex flex-wrap gap-1.5">
            {people.map((p) => {
              const on = draft.members.includes(p.id);
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    onClick={() => togglePerson(p.id)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border py-0.5 pl-0.5 pr-2.5 text-[12px] transition-colors",
                      on ? "border-primary bg-primary/10 font-semibold text-primary" : "border-base-300 text-base-content/70 hover:border-base-content/30",
                    )}
                  >
                    <TeamAvatar name={p.name ?? "Membro"} src={p.avatarUrl ?? undefined} size={20} />
                    {p.name ?? "Membro"}
                    {!p.current && <span className="text-[10px] font-normal text-base-content/45">(ex-membro)</span>}
                    {on && <Check size={12} />}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="flex gap-1">
            <ToolButton size="xs" variant="ghost" onClick={() => setDraft({ ...draft, members: people.map((p) => p.id) })}>
              Marcar todos
            </ToolButton>
            <ToolButton size="xs" variant="ghost" onClick={() => setDraft({ ...draft, members: [] })}>
              Limpar
            </ToolButton>
          </div>
        </ToolSection>
      </form>
    </ToolDialog>
  );
}

function fromContent(c: LegacyContent) {
  return {
    summary: c.summary ?? "",
    result: c.result ?? "",
    robotName: c.robotName ?? "",
    awards: (c.awards ?? []).map((a) => ({ ...a })) as LegacyAward[],
    highlights: (c.highlights ?? []).map((h) => ({ ...h })) as LegacyHighlight[],
    lessons: c.lessons ?? "",
    modality: c.modality ?? "",
    members: [...(c.members ?? [])],
  };
}

// ============================================================================
// Guardar itens
// ============================================================================

type KindFilter = "all" | LegacyItemKind;

function KindFilterBar({ value, onChange }: { value: KindFilter; onChange: (v: KindFilter) => void }) {
  return (
    <Segmented<KindFilter>
      label="Ferramenta"
      size="xs"
      value={value}
      onChange={onChange}
      className="flex-wrap"
      options={[
        { value: "all", label: "Tudo" },
        ...LEGACY_ITEM_KINDS.map((k) => {
          const Icon = LEGACY_ICONS[k];
          return { value: k, label: LEGACY_ITEM_LABEL[k].tool, icon: <Icon /> };
        }),
      ]}
    />
  );
}

type ChapterDialogBaseProps = { open: boolean; onClose: () => void; teamId: string; chapter: LegacyChapterDTO };

function ItemPicker(props: ChapterDialogBaseProps) {
  return props.open ? <ItemPickerBody {...props} /> : null;
}

function ItemPickerBody({ onClose, teamId, chapter }: ChapterDialogBaseProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<KindFilter>("all");
  const [found, setFound] = useState<{ key: string; items: LegacyCandidateDTO[]; error: string | null } | null>(null);
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const searchKey = `${q}|${kind}`;
  const results = found?.key === searchKey ? found.items : null;
  const error = found?.key === searchKey ? found.error : null;

  useEffect(() => {
    let alive = true;
    const t = setTimeout(async () => {
      const res = await searchLegacyCandidates(teamId, chapter.id, { q, kind: kind === "all" ? null : kind });
      if (!alive) return;
      setFound(res.ok ? { key: searchKey, items: res.data, error: null } : { key: searchKey, items: [], error: res.error });
    }, 200);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [q, kind, searchKey, teamId, chapter.id]);

  async function add(c: LegacyCandidateDTO) {
    const k = `${c.kind}:${c.id}`;
    setBusy(k);
    const res = await addLegacyItems(teamId, chapter.id, [{ kind: c.kind, id: c.id }]);
    setBusy(null);
    if (!res.ok) return addToast(res.error, "error");
    setAdded((prev) => new Set(prev).add(k));
  }

  function close() {
    if (added.size) {
      addToast(`${added.size === 1 ? "1 item guardado" : `${added.size} itens guardados`} em “${chapter.title}”.`, "success");
      router.refresh();
    }
    onClose();
  }

  return (
    <ToolDialog
      open
      onClose={close}
      size="md"
      title="Guardar no legado"
      description="Itens da equipe. O que está no seu espaço pessoal precisa ser transferido antes."
      footer={
        <ToolButton variant="primary" onClick={close}>
          Concluir
        </ToolButton>
      }
    >
      <div className="space-y-3 pb-2">
        <ToolInput autoFocus icon={<Search />} placeholder="Buscar pelo nome" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar itens da equipe" />
        <KindFilterBar value={kind} onChange={setKind} />
        {error && <InlineAlert type="error">{error}</InlineAlert>}
        {results === null ? (
          <p className="flex items-center gap-2 py-6 text-[13px] text-base-content/50">
            <Loader2 size={14} className="animate-spin" /> Buscando…
          </p>
        ) : results.length === 0 ? (
          <ToolEmpty icon={<Search />} title="Nada encontrado" description={q ? "Tente outro nome." : "Tudo dessa ferramenta já está nesta aba (ou a equipe ainda não tem itens nela)."} />
        ) : (
          <ul className="max-h-80 space-y-0.5 overflow-y-auto">
            {results.map((c) => {
              const Icon = LEGACY_ICONS[c.kind];
              const k = `${c.kind}:${c.id}`;
              const done = added.has(k);
              return (
                <li key={k}>
                  <ListItem
                    leading={c.icon ? <span className="text-[14px]">{c.icon}</span> : <Icon />}
                    title={c.title}
                    description={[LEGACY_ITEM_LABEL[c.kind].tool, c.reason].filter(Boolean).join(" · ")}
                    onClick={done || busy === k ? undefined : () => add(c)}
                    trailing={
                      busy === k ? (
                        <Loader2 size={14} className="animate-spin text-base-content/50" />
                      ) : done ? (
                        <span className="text-[11px] font-semibold text-success">Guardado</span>
                      ) : (
                        <span className="text-[11px] font-semibold text-primary opacity-0 group-hover:opacity-100">Guardar</span>
                      )
                    }
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </ToolDialog>
  );
}

function SuggestionsDialog(props: ChapterDialogBaseProps) {
  return props.open ? <SuggestionsDialogBody {...props} /> : null;
}

function SuggestionsDialogBody({ onClose, teamId, chapter }: ChapterDialogBaseProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [items, setItems] = useState<LegacyCandidateDTO[] | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [kind, setKind] = useState<KindFilter>("all");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let alive = true;
    getLegacySuggestions(teamId, chapter.id).then((res) => {
      if (!alive) return;
      if (!res.ok) {
        setError(res.error);
        setItems([]);
        return;
      }
      setItems(res.data);
      setPicked(new Set(res.data.map((s) => `${s.kind}:${s.id}`)));
    });
    return () => {
      alive = false;
    };
  }, [teamId, chapter.id]);

  const shown = (items ?? []).filter((s) => kind === "all" || s.kind === kind);
  const toggle = (k: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  function save() {
    const chosen = (items ?? []).filter((s) => picked.has(`${s.kind}:${s.id}`));
    if (!chosen.length) return;
    startTransition(async () => {
      const res = await addLegacyItems(
        teamId,
        chapter.id,
        chosen.map((s) => ({ kind: s.kind, id: s.id })),
      );
      if (!res.ok) return setError(res.error);
      addToast(`${res.data.added === 1 ? "1 item guardado" : `${res.data.added} itens guardados`} em “${chapter.title}”.`, "success");
      onClose();
      router.refresh();
    });
  }

  const hint = chapter.seasonKey
    ? "Itens da mesma temporada FLL ou criados no período desta aba."
    : chapter.startDate
      ? "Itens criados no período desta aba (e entradas do diário dessas datas)."
      : "Defina o período da aba para receber sugestões.";

  return (
    <ToolDialog
      open
      onClose={onClose}
      size="md"
      title="Sincronizar com as ferramentas"
      description={hint}
      footer={
        <>
          <span className="mr-auto self-center text-[12px] text-base-content/55">{picked.size ? `${picked.size} selecionado${picked.size > 1 ? "s" : ""}` : ""}</span>
          <ToolButton onClick={onClose} disabled={pending}>
            Cancelar
          </ToolButton>
          <ToolButton variant="primary" onClick={save} disabled={pending || !picked.size} icon={pending ? <Loader2 className="animate-spin" /> : <Archive />}>
            Guardar {picked.size === 1 ? "1 item" : `${picked.size} itens`}
          </ToolButton>
        </>
      }
    >
      <div className="space-y-3 pb-2">
        {error && <InlineAlert type="error">{error}</InlineAlert>}
        {items === null ? (
          <p className="flex items-center gap-2 py-6 text-[13px] text-base-content/50">
            <Loader2 size={14} className="animate-spin" /> Procurando nas ferramentas…
          </p>
        ) : items.length === 0 ? (
          <ToolEmpty icon={<Sparkles />} title="Nenhuma sugestão" description={chapter.startDate || chapter.seasonKey ? "Tudo o que é desta época já está guardado aqui." : hint} />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <KindFilterBar value={kind} onChange={setKind} />
              <span className="flex gap-1">
                <ToolButton size="xs" variant="ghost" onClick={() => setPicked(new Set(items.map((s) => `${s.kind}:${s.id}`)))}>
                  Todos
                </ToolButton>
                <ToolButton size="xs" variant="ghost" onClick={() => setPicked(new Set())}>
                  Nenhum
                </ToolButton>
              </span>
            </div>
            <ul className="max-h-80 space-y-0.5 overflow-y-auto">
              {shown.map((s) => {
                const Icon = LEGACY_ICONS[s.kind];
                const k = `${s.kind}:${s.id}`;
                const on = picked.has(k);
                return (
                  <li key={k}>
                    <ListItem
                      selected={on}
                      onClick={() => toggle(k)}
                      leading={s.icon ? <span className="text-[14px]">{s.icon}</span> : <Icon />}
                      title={s.title}
                      description={[LEGACY_ITEM_LABEL[s.kind].tool, s.reason].filter(Boolean).join(" · ")}
                      trailing={
                        <span
                          role="checkbox"
                          aria-checked={on}
                          aria-label={`Guardar ${s.title}`}
                          className={cn("grid size-4 shrink-0 place-items-center rounded border", on ? "border-primary bg-primary text-primary-content" : "border-base-content/30 bg-base-100")}
                        >
                          {on && <Check size={11} strokeWidth={3} />}
                        </span>
                      }
                    />
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </ToolDialog>
  );
}

type NoteDialogProps = { item: LegacyItemDTO | null; onClose: () => void; teamId: string; chapterId: string };

function NoteDialog(props: NoteDialogProps) {
  return props.item ? <NoteDialogBody key={props.item.id} {...props} item={props.item} /> : null;
}

function NoteDialogBody({ item, onClose, teamId, chapterId }: NoteDialogProps & { item: LegacyItemDTO }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [note, setNote] = useState(item.note ?? "");
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const res = await updateLegacyItemNote(teamId, chapterId, item.id, note);
      if (!res.ok) return addToast(res.error, "error");
      onClose();
      router.refresh();
    });
  }

  return (
    <ToolDialog
      open
      onClose={onClose}
      title="Legenda"
      description={`Por que “${item.title}” está no legado?`}
      footer={
        <>
          <ToolButton onClick={onClose} disabled={pending}>
            Cancelar
          </ToolButton>
          <ToolButton variant="primary" onClick={save} disabled={pending}>
            Salvar
          </ToolButton>
        </>
      }
    >
      <form
        className="pb-2"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <ToolInput autoFocus maxLength={LEGACY_LIMITS.note} placeholder="Ex.: caderno do robô campeão do regional" value={note} onChange={(e) => setNote(e.target.value)} />
      </form>
    </ToolDialog>
  );
}
