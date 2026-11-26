"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlignLeft,
  ArrowDown,
  ArrowUp,
  CalendarDays,
  Code2,
  ExternalLink,
  FileText,
  HeartHandshake,
  Image as ImageIcon,
  Link2,
  ListOrdered,
  Loader2,
  MessageSquareQuote,
  Pencil,
  Plus,
  Settings2,
  Sparkles,
  ThumbsUp,
  Trash2,
  TrendingUp,
  Video,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  IconButton,
  InlineAlert,
  Panel,
  ToolButton,
  ToolDialog,
  ToolInput,
  ToolSection,
  ToolSwitch,
  cn,
  useToolConfirm,
} from "@/components/stage";
import { useToast } from "@/components/providers/ToastContext";
import { updateLegacyChapter } from "@/features/stagebook/actions/legacy";
import { formatJournalDate } from "@/features/stagebook/types/journal";
import {
  LEGACY_LEAGUE_META,
  LEGACY_SECTION_KINDS,
  LEGACY_SECTION_LIMITS,
  LEGACY_SECTION_META,
  LEGACY_SECTION_TEMPLATES,
  formatSeconds,
  linkKind,
  parseSeconds,
  scoreSummary,
  sectionFromTemplate,
  type LegacyChapterDTO,
  type LegacyLeague,
  type LegacyRow,
  type LegacySection,
  type LegacySectionKind,
} from "@/features/stagebook/types/legacy";

export const SECTION_ICONS: Record<LegacySectionKind, LucideIcon> = {
  text: AlignLeft,
  links: Link2,
  scores: ListOrdered,
  specs: Settings2,
  project: FileText,
  feedback: MessageSquareQuote,
  timeline: CalendarDays,
  people: HeartHandshake,
};

const LINK_ICONS: Record<ReturnType<typeof linkKind>, LucideIcon> = {
  video: Video,
  photos: ImageIcon,
  code: Code2,
  doc: FileText,
  link: ExternalLink,
};

const textareaCls =
  "w-full rounded-md border border-base-300 bg-base-100 px-2.5 py-1.5 text-[13px] leading-relaxed outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

const fmtNum = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
let seq = 0;
const rowId = () => `r${Date.now().toString(36)}${(seq++).toString(36)}`;

/**
 * Seções de documentação de uma aba do legado: placar das rodadas, ficha
 * técnica, projeto, avaliação dos juízes, links e mídia, linha do tempo,
 * pessoas e texto livre. Cada liga tem modelos prontos (FLL: Robot Game e
 * Projeto de Inovação; OBR: rodadas do Resgate com tempo, prova teórica…).
 */
export function LegacySections({
  teamId,
  chapter,
  league,
  canEdit,
}: {
  teamId: string;
  chapter: LegacyChapterDTO;
  league: LegacyLeague | null;
  canEdit: boolean;
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const { confirm, dialog: confirmDialog } = useToolConfirm();
  const sections = chapter.content.sections ?? [];
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<{ section: LegacySection; isNew: boolean } | null>(null);
  const [, startTransition] = useTransition();

  async function persist(next: LegacySection[]): Promise<boolean> {
    const res = await updateLegacyChapter(teamId, chapter.id, { content: { ...chapter.content, sections: next } });
    if (!res.ok) {
      addToast(res.error, "error");
      return false;
    }
    router.refresh();
    return true;
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...sections];
    const [s] = next.splice(index, 1);
    next.splice(index + dir, 0, s);
    startTransition(async () => {
      await persist(next);
    });
  }

  async function remove(section: LegacySection) {
    const ok = await confirm({
      title: `Excluir a seção “${section.title}”?`,
      message: "O conteúdo dela sai do legado. Não pode ser desfeito.",
      intent: "danger",
      confirmLabel: "Excluir",
    });
    if (!ok) return;
    if (await persist(sections.filter((s) => s.id !== section.id))) addToast("Seção excluída.", "success");
  }

  return (
    <div className="space-y-4">
      {sections.map((section, i) => {
        const Icon = SECTION_ICONS[section.kind];
        return (
          <Panel
            key={section.id}
            title={section.title}
            icon={<Icon />}
            actions={
              canEdit ? (
                <>
                  <IconButton size="xs" label="Subir seção" icon={<ArrowUp />} disabled={i === 0} onClick={() => move(i, -1)} />
                  <IconButton size="xs" label="Descer seção" icon={<ArrowDown />} disabled={i === sections.length - 1} onClick={() => move(i, 1)} />
                  <IconButton size="xs" label={`Editar ${section.title}`} icon={<Pencil />} onClick={() => setEditing({ section, isNew: false })} />
                  <IconButton size="xs" label={`Excluir ${section.title}`} icon={<Trash2 />} className="hover:text-error" onClick={() => remove(section)} />
                </>
              ) : undefined
            }
          >
            <SectionView section={section} />
          </Panel>
        );
      })}

      {canEdit && (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-base-300 px-4 py-3 text-[13px] font-semibold text-base-content/60 transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
        >
          <Plus size={15} />
          {sections.length ? "Adicionar seção" : "Documentar mais: placar, ficha técnica, projeto, links, avaliação…"}
        </button>
      )}

      <AddSectionDialog
        open={adding}
        league={league}
        full={sections.length >= LEGACY_SECTION_LIMITS.sections}
        onClose={() => setAdding(false)}
        onPick={(section) => {
          setAdding(false);
          setEditing({ section, isNew: true });
        }}
      />
      {editing && (
        <SectionEditor
          key={editing.section.id}
          section={editing.section}
          isNew={editing.isNew}
          onClose={() => setEditing(null)}
          onSave={async (saved) => {
            const next = editing.isNew ? [...sections, saved] : sections.map((s) => (s.id === saved.id ? saved : s));
            const ok = await persist(next);
            if (ok) {
              addToast(editing.isNew ? "Seção adicionada." : "Seção atualizada.", "success");
              setEditing(null);
            }
            return ok;
          }}
        />
      )}
      {confirmDialog}
    </div>
  );
}

// ============================================================================
// Exibição
// ============================================================================

export function SectionView({ section }: { section: LegacySection }) {
  const rows = section.rows ?? [];
  const empty = <p className="text-[12px] text-base-content/50">Nada preenchido ainda.</p>;

  switch (section.kind) {
    case "text":
      return section.text ? <p className="whitespace-pre-line text-[13px] leading-relaxed">{section.text}</p> : empty;

    case "links":
      return rows.length ? (
        <ul className="grid gap-1.5 sm:grid-cols-2">
          {rows.map((r) => {
            const Icon = LINK_ICONS[linkKind(r.url ?? "")];
            const host = (() => {
              try {
                return new URL(r.url ?? "").hostname.replace(/^www\./, "");
              } catch {
                return "";
              }
            })();
            return (
              <li key={r.id}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 rounded-md border border-base-300 px-2.5 py-2 hover:border-primary/40 hover:bg-primary/5"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-md bg-base-200 text-base-content/70">
                    <Icon size={15} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold">{r.label}</span>
                    <span className="block truncate text-[11px] text-base-content/50">{host}</span>
                  </span>
                  <ExternalLink size={13} className="shrink-0 text-base-content/40" />
                </a>
              </li>
            );
          })}
        </ul>
      ) : (
        empty
      );

    case "scores": {
      if (!rows.length) return empty;
      const sum = scoreSummary(rows);
      const max = Math.max(1, ...rows.map((r) => r.points ?? 0));
      return (
        <div className="space-y-3">
          {sum && (
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-[12px]">
              <span className="inline-flex items-center gap-1 font-semibold text-primary">
                <TrendingUp size={13} /> Melhor: {fmtNum(sum.best)} pts{section.showTime && sum.bestTime !== null ? ` em ${formatSeconds(sum.bestTime)}` : ""}
              </span>
              <span className="text-base-content/60">Média: {fmtNum(sum.avg)} pts</span>
              <span className="text-base-content/60">
                {sum.count} {sum.count === 1 ? "registro" : "registros"}
              </span>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-base-300 text-left text-[11px] uppercase tracking-wider text-base-content/50">
                  <th className="py-1.5 pr-3 font-semibold">Rodada</th>
                  <th className="py-1.5 pr-3 text-right font-semibold">Pontos</th>
                  {section.showTime && <th className="py-1.5 pr-3 text-right font-semibold">Tempo</th>}
                  <th className="hidden w-1/3 py-1.5 pr-3 font-semibold sm:table-cell" aria-hidden />
                  <th className="py-1.5 font-semibold">Observação</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const best = sum && r.points === sum.best;
                  return (
                    <tr key={r.id} className="border-b border-base-300/60 last:border-0">
                      <td className="py-1.5 pr-3 font-medium">{r.label || "—"}</td>
                      <td className={cn("py-1.5 pr-3 text-right font-mono tabular-nums", best && "font-bold text-primary")}>{r.points === null || r.points === undefined ? "—" : fmtNum(r.points)}</td>
                      {section.showTime && <td className="py-1.5 pr-3 text-right font-mono tabular-nums text-base-content/70">{formatSeconds(r.time)}</td>}
                      <td className="hidden py-1.5 pr-3 sm:table-cell">
                        <span className="block h-1.5 rounded-full bg-base-200">
                          <span className={cn("block h-full rounded-full", best ? "bg-primary" : "bg-base-content/25")} style={{ width: `${Math.max(0, ((r.points ?? 0) / max) * 100)}%` }} />
                        </span>
                      </td>
                      <td className="py-1.5 text-[12px] text-base-content/60">{r.value}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    case "specs":
      return rows.length ? (
        <dl className="grid gap-x-6 gap-y-1.5 text-[13px] sm:grid-cols-2">
          {rows.map((r) => (
            <div key={r.id} className="flex gap-3 border-b border-base-300/60 pb-1.5">
              <dt className="w-32 shrink-0 text-base-content/55">{r.label}</dt>
              <dd className="min-w-0 font-medium">{r.value || "—"}</dd>
            </div>
          ))}
        </dl>
      ) : (
        empty
      );

    case "project":
      return rows.some((r) => r.value) ? (
        <div className="space-y-3 text-[13px] leading-relaxed">
          {rows
            .filter((r) => r.value)
            .map((r) => (
              <div key={r.id}>
                <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-base-content/50">{r.label}</p>
                <p className="whitespace-pre-line">{r.value}</p>
              </div>
            ))}
        </div>
      ) : (
        empty
      );

    case "feedback":
      return rows.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {rows.map((r) => (
            <div key={r.id} className="rounded-md border border-base-300 p-3 text-[13px]">
              <p className="font-bold">{r.label || "Avaliação"}</p>
              {r.value && (
                <p className="mt-1.5 flex gap-1.5 whitespace-pre-line">
                  <ThumbsUp size={13} className="mt-0.5 shrink-0 text-success" />
                  <span>{r.value}</span>
                </p>
              )}
              {r.extra && (
                <p className="mt-1.5 flex gap-1.5 whitespace-pre-line text-base-content/70">
                  <TrendingUp size={13} className="mt-0.5 shrink-0 text-warning" />
                  <span>{r.extra}</span>
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        empty
      );

    case "timeline": {
      const sorted = [...rows].sort((a, b) => (a.date ?? "9999").localeCompare(b.date ?? "9999"));
      return sorted.length ? (
        <ol className="relative space-y-2.5 border-l border-base-300 pl-4 text-[13px]">
          {sorted.map((r) => (
            <li key={r.id} className="relative">
              <span aria-hidden className="absolute -left-[21px] top-1.5 size-2.5 rounded-full border-2 border-base-100 bg-primary" />
              {r.date && <span className="mr-2 font-mono text-[11px] text-base-content/50">{formatJournalDate(r.date, "short")}</span>}
              {r.label}
            </li>
          ))}
        </ol>
      ) : (
        empty
      );
    }

    case "people":
      return rows.length ? (
        <ul className="flex flex-wrap gap-1.5">
          {rows.map((r) => (
            <li key={r.id} className="rounded-full border border-base-300 px-2.5 py-1 text-[12px]">
              <span className="font-semibold">{r.label}</span>
              {r.value && <span className="text-base-content/55"> · {r.value}</span>}
            </li>
          ))}
        </ul>
      ) : (
        empty
      );
  }
}

// ============================================================================
// Adicionar
// ============================================================================

function AddSectionDialog({
  open,
  league,
  full,
  onClose,
  onPick,
}: {
  open: boolean;
  league: LegacyLeague | null;
  full: boolean;
  onClose: () => void;
  onPick: (section: LegacySection) => void;
}) {
  if (!open) return null;
  const leagueTemplates = league ? LEGACY_SECTION_TEMPLATES.filter((t) => t.leagues.includes(league)) : [];
  const general = LEGACY_SECTION_TEMPLATES.filter((t) => t.leagues.length === 0);

  const pickTemplate = (id: string) => {
    const s = sectionFromTemplate(id);
    if (s) onPick(s);
  };
  const pickBlank = (kind: LegacySectionKind) =>
    onPick({ id: rowId(), kind, title: LEGACY_SECTION_META[kind].defaultTitle, ...(kind === "text" ? { text: "" } : { rows: [] }) });

  return (
    <ToolDialog open onClose={onClose} size="lg" title="Adicionar seção" description="Escolha um modelo pronto ou comece em branco.">
      <div className="space-y-4 pb-2">
        {full && <InlineAlert type="warning">Esta aba já tem {LEGACY_SECTION_LIMITS.sections} seções, o máximo.</InlineAlert>}
        {leagueTemplates.length > 0 && (
          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-base-content/50">
              <Sparkles size={12} /> Modelos {LEGACY_LEAGUE_META[league!].label}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {leagueTemplates.map((t) => (
                <TemplateCard key={t.id} kind={t.kind} title={t.title} description={t.description} disabled={full} onClick={() => pickTemplate(t.id)} />
              ))}
            </div>
          </div>
        )}
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-base-content/50">Para qualquer competição</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {general.map((t) => (
              <TemplateCard key={t.id} kind={t.kind} title={t.title} description={t.description} disabled={full} onClick={() => pickTemplate(t.id)} />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-base-content/50">Em branco</p>
          <div className="flex flex-wrap gap-1.5">
            {LEGACY_SECTION_KINDS.map((kind) => {
              const Icon = SECTION_ICONS[kind];
              return (
                <ToolButton key={kind} size="xs" icon={<Icon />} disabled={full} onClick={() => pickBlank(kind)}>
                  {LEGACY_SECTION_META[kind].label}
                </ToolButton>
              );
            })}
          </div>
        </div>
      </div>
    </ToolDialog>
  );
}

function TemplateCard({ kind, title, description, disabled, onClick }: { kind: LegacySectionKind; title: string; description: string; disabled: boolean; onClick: () => void }) {
  const Icon = SECTION_ICONS[kind];
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex items-start gap-2.5 rounded-md border border-base-300 p-2.5 text-left transition-colors hover:border-primary/50 hover:bg-primary/5 disabled:pointer-events-none disabled:opacity-40"
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-md bg-base-200 text-base-content/70">
        <Icon size={16} />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold">{title}</span>
        <span className="block text-[11px] leading-snug text-base-content/55">{description}</span>
        <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-base-content/40">{LEGACY_SECTION_META[kind].label}</span>
      </span>
    </button>
  );
}

// ============================================================================
// Editor de uma seção
// ============================================================================

type DraftRow = LegacyRow & { pointsText: string; timeText: string };

const toDraft = (r: LegacyRow): DraftRow => ({
  ...r,
  pointsText: r.points === null || r.points === undefined ? "" : String(r.points).replace(".", ","),
  timeText: r.time === null || r.time === undefined ? "" : formatSeconds(r.time),
});

const blankRow = (): DraftRow => ({ id: rowId(), label: "", value: "", extra: "", url: "", points: null, time: null, pointsText: "", timeText: "" });

/** Rótulos dos campos de cada tipo de seção. */
const FIELDS: Partial<Record<LegacySectionKind, { label: string; value?: string; extra?: string; long?: boolean }>> = {
  links: { label: "Nome (opcional)" },
  scores: { label: "Rodada", value: "Observação" },
  specs: { label: "Item", value: "Valor" },
  project: { label: "Tópico", value: "Texto", long: true },
  feedback: { label: "Área", value: "O que foi elogiado", extra: "O que melhorar", long: true },
  timeline: { label: "O que aconteceu" },
  people: { label: "Nome", value: "Papel (mentor, patrocinador…)" },
};

function SectionEditor({
  section,
  isNew,
  onClose,
  onSave,
}: {
  section: LegacySection;
  isNew: boolean;
  onClose: () => void;
  onSave: (section: LegacySection) => Promise<boolean>;
}) {
  const [title, setTitle] = useState(section.title);
  const [text, setText] = useState(section.text ?? "");
  const [showTime, setShowTime] = useState(Boolean(section.showTime));
  const [rows, setRows] = useState<DraftRow[]>(() => {
    const r = (section.rows ?? []).map(toDraft);
    return r.length || section.kind === "text" ? r : [blankRow()];
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const kind = section.kind;
  const f = FIELDS[kind];
  const L = LEGACY_SECTION_LIMITS;

  const setRow = (i: number, patch: Partial<DraftRow>) => setRows((all) => all.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const addRow = () => rows.length < L.rows && setRows((all) => [...all, blankRow()]);

  function save() {
    setError(null);
    const cleanRows: LegacyRow[] = [];
    for (const r of rows) {
      const row: LegacyRow = { id: r.id, label: r.label.trim() };
      if (r.value?.trim()) row.value = r.value.trim();
      if (r.extra?.trim()) row.extra = r.extra.trim();
      if (kind === "links") {
        const url = (r.url ?? "").trim();
        if (!url && !row.label) continue;
        const withProto = url && !/^https?:\/\//i.test(url) ? `https://${url}` : url;
        try {
          const u = new URL(withProto);
          if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error();
        } catch {
          return setError(`Endereço inválido: “${url || row.label}”.`);
        }
        row.url = withProto;
      }
      if (kind === "scores") {
        row.points = r.pointsText.trim() ? Number(r.pointsText.replace(",", ".")) : null;
        if (row.points !== null && !Number.isFinite(row.points)) return setError(`Pontuação inválida em “${row.label || "rodada"}”.`);
        row.time = showTime ? parseSeconds(r.timeText) : null;
        if (showTime && r.timeText.trim() && row.time === null) return setError(`Tempo inválido em “${row.label || "rodada"}”. Use m:ss.`);
      }
      if (kind === "timeline" && r.date) row.date = r.date;
      cleanRows.push(row);
    }
    const out: LegacySection = { id: section.id, kind, title: title.trim() || LEGACY_SECTION_META[kind].defaultTitle };
    if (kind === "text") out.text = text;
    else out.rows = cleanRows;
    if (kind === "scores" && showTime) out.showTime = true;
    startTransition(async () => {
      await onSave(out);
    });
  }

  const Icon = SECTION_ICONS[kind];
  return (
    <ToolDialog
      open
      onClose={onClose}
      size="lg"
      title={isNew ? `Nova seção · ${LEGACY_SECTION_META[kind].label}` : `Editar “${section.title}”`}
      description={LEGACY_SECTION_META[kind].description}
      footer={
        <>
          <ToolButton onClick={onClose} disabled={pending}>
            Cancelar
          </ToolButton>
          <ToolButton variant="primary" onClick={save} disabled={pending} icon={pending ? <Loader2 className="animate-spin" /> : <Icon />}>
            {isNew ? "Adicionar ao legado" : "Salvar"}
          </ToolButton>
        </>
      }
    >
      <form
        className="space-y-3 pb-2"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        {error && <InlineAlert type="error">{error}</InlineAlert>}
        <ToolSection title="Título da seção">
          <ToolInput autoFocus maxLength={L.title} value={title} onChange={(e) => setTitle(e.target.value)} />
        </ToolSection>

        {kind === "text" ? (
          <ToolSection title="Texto">
            <textarea className={cn(textareaCls, "min-h-40")} maxLength={L.text} value={text} onChange={(e) => setText(e.target.value)} />
          </ToolSection>
        ) : (
          <ToolSection title="Itens">
            {kind === "scores" && <ToolSwitch label="Registrar o tempo de cada rodada (m:ss)" checked={showTime} onChange={setShowTime} />}
            <ul className="space-y-2">
              {rows.map((r, i) => (
                <li key={r.id} className="flex items-start gap-1.5 rounded-md border border-base-300 bg-base-200/30 p-2">
                  <div
                    className={cn(
                      "grid min-w-0 flex-1 gap-1.5",
                      kind === "scores" ? (showTime ? "sm:grid-cols-[1.2fr_0.7fr_0.7fr_1.4fr]" : "sm:grid-cols-[1.2fr_0.7fr_1.6fr]") : kind === "timeline" ? "sm:grid-cols-[10rem_1fr]" : f?.long ? "" : "sm:grid-cols-2",
                    )}
                  >
                    {kind === "timeline" && (
                      <ToolInput type="date" aria-label={`Data ${i + 1}`} value={r.date ?? ""} onChange={(e) => setRow(i, { date: e.target.value })} />
                    )}
                    {kind === "links" && (
                      <ToolInput aria-label={`Endereço ${i + 1}`} placeholder="https://…" maxLength={L.url} value={r.url ?? ""} onChange={(e) => setRow(i, { url: e.target.value })} icon={<Link2 />} />
                    )}
                    <ToolInput aria-label={`${f?.label ?? "Item"} ${i + 1}`} placeholder={f?.label} maxLength={L.label} value={r.label} onChange={(e) => setRow(i, { label: e.target.value })} />
                    {kind === "scores" && (
                      <ToolInput aria-label={`Pontos ${i + 1}`} inputMode="decimal" placeholder="Pontos" value={r.pointsText} onChange={(e) => setRow(i, { pointsText: e.target.value })} />
                    )}
                    {kind === "scores" && showTime && (
                      <ToolInput aria-label={`Tempo ${i + 1}`} placeholder="m:ss" value={r.timeText} onChange={(e) => setRow(i, { timeText: e.target.value })} />
                    )}
                    {f?.value &&
                      (f.long ? (
                        <textarea
                          aria-label={`${f.value} ${i + 1}`}
                          placeholder={f.value}
                          className={cn(textareaCls, "min-h-16")}
                          maxLength={L.longValue}
                          value={r.value ?? ""}
                          onChange={(e) => setRow(i, { value: e.target.value })}
                        />
                      ) : (
                        <ToolInput aria-label={`${f.value} ${i + 1}`} placeholder={f.value} maxLength={L.value} value={r.value ?? ""} onChange={(e) => setRow(i, { value: e.target.value })} />
                      ))}
                    {f?.extra && (
                      <textarea
                        aria-label={`${f.extra} ${i + 1}`}
                        placeholder={f.extra}
                        className={cn(textareaCls, "min-h-16")}
                        maxLength={L.longValue}
                        value={r.extra ?? ""}
                        onChange={(e) => setRow(i, { extra: e.target.value })}
                      />
                    )}
                  </div>
                  <IconButton size="xs" label="Remover item" icon={<X />} onClick={() => setRows((all) => all.filter((_, j) => j !== i))} />
                </li>
              ))}
            </ul>
            {rows.length < L.rows && (
              <ToolButton size="xs" variant="ghost" icon={<Plus />} onClick={addRow}>
                {kind === "scores" ? "Adicionar rodada" : kind === "links" ? "Adicionar link" : "Adicionar item"}
              </ToolButton>
            )}
          </ToolSection>
        )}
      </form>
    </ToolDialog>
  );
}
