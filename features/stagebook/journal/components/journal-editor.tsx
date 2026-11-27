"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookmarkPlus,
  CalendarDays,
  Check,
  CheckCircle2,
  Cloud,
  Copy,
  ListChecks,
  Loader2,
  Plus,
  Sparkles,
  Tag,
  Trash2,
  Type,
  X,
} from "lucide-react";
import {
  IconButton,
  InfoTile,
  InlineAlert,
  Panel,
  ToolBadge,
  ToolButton,
  ToolDialog,
  ToolInput,
  ToolScope,
  ToolSection,
  ToolSelect,
  Toolbar,
  ToolbarDivider,
  ToolbarGroup,
  ToolbarSpacer,
  cn,
  useToolConfirm,
} from "@/components/stage";
import { useToast } from "@/components/providers/ToastContext";
import type { MilestoneDTO } from "@/features/stagebook/types/labels";
import { JournalLabelsPanel, JournalGoalPanel, JournalLinksPanel } from "./journal-links";
import {
  createJournalEntry,
  deleteJournalEntry,
  saveJournalTemplate,
  updateJournalEntry,
} from "@/features/stagebook/actions/journal";
import {
  JOURNAL_LIMITS,
  JOURNAL_TEMPLATE_ICONS,
  SECTION_KIND_META,
  addDays,
  formatJournalDate,
  hasJournalContent,
  isIsoDate,
  journalId,
  journalStats,
  journalToPlainText,
  normalizeCategories,
  type JournalAuthor,
  type JournalContent,
  type JournalEntryDetail,
  type JournalItem,
  type JournalScopeInfo,
  type JournalSection,
  type JournalSectionKind,
  type JournalTemplate,
  type JournalTemplateIcon,
} from "@/features/stagebook/types/journal";
import { useClientToday } from "../hooks/use-client-value";
import { AuthorChip, TemplateIcon, TEMPLATE_ICONS, categoryColor, categoryTone, relativeDay } from "./journal-ui";

type Props = {
  scope: JournalScopeInfo;
  templates: JournalTemplate[];
  author: JournalAuthor;
} & (
  | {
      mode: "new";
      initialTemplateKey: string;
      initialDate: string | null;
      /** Meta já escolhida (ex.: "Registrar no diário" a partir da meta). */
      initialMilestone?: MilestoneDTO | null;
      entry?: undefined;
    }
  | { mode: "edit"; entry: JournalEntryDetail; initialTemplateKey?: undefined; initialDate?: undefined; initialMilestone?: undefined }
);

/** Cópia do conteúdo do template (ids do template são determinísticos: sem diferença servidor × navegador). */
function cloneTemplate(t: JournalTemplate | undefined): JournalContent {
  if (!t) return { categories: [], sections: [] };
  return {
    categories: [...t.content.categories],
    sections: t.content.sections.map((s) => ({
      ...s,
      ...(s.kind === "text" ? { text: "" } : { items: (s.items ?? []).map((it) => ({ ...it, done: false })) }),
    })),
  };
}

const AUTOSAVE_MS = 900;
const fmtClock = (iso: string) => new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

/**
 * Editor do Diário (kit ferramenta da Stage UI).
 *
 * Salva sozinho: cada alteração agenda um salvamento; salvamentos não se
 * sobrepõem (o próximo espera o anterior e leva o estado mais recente). Uma
 * entrada nova só é criada no banco quando tem algo escrito; a URL troca para
 * `/dashboard/diario/:id` sem recarregar o editor.
 */
export function JournalEditor(props: Props) {
  const { scope, templates, author } = props;
  const router = useRouter();
  const { addToast } = useToast();
  const { confirm, dialog: confirmDialog } = useToolConfirm();

  const readOnly = props.mode === "edit" && !props.entry.canEdit;
  const canDelete = props.mode === "edit" ? props.entry.canDelete : false;

  const [entryId, setEntryId] = useState<string | null>(props.mode === "edit" ? props.entry.id : null);
  const [templateKey, setTemplateKey] = useState<string | null>(
    props.mode === "edit" ? props.entry.templateKey : props.initialTemplateKey,
  );
  const [pickedDate, setDate] = useState(props.mode === "edit" ? props.entry.entryDate : (props.initialDate ?? ""));
  const [title, setTitle] = useState(props.mode === "edit" ? (props.entry.title ?? "") : "");
  const [content, setContent] = useState<JournalContent>(() =>
    props.mode === "edit" ? props.entry.content : cloneTemplate(templates.find((t) => t.key === props.initialTemplateKey)),
  );

  const [milestone, setMilestone] = useState<MilestoneDTO | null>(
    props.mode === "edit" ? props.entry.milestone : (props.initialMilestone ?? null),
  );

  // "hoje" e "ontem" no fuso do navegador (o servidor não sabe). Sem `?data=`,
  // a entrada nova fica com o hoje local até a pessoa escolher outra data.
  const today = useClientToday();
  const yesterday = today ? addDays(today, -1) : null;
  const date = pickedDate || today || "";

  // ---------------------------------------------------------------- salvamento
  const [version, setVersion] = useState(0);
  const [saving, setSaving] = useState(false);
  const [savedVersion, setSavedVersion] = useState(0);
  const [savedAt, setSavedAt] = useState<string | null>(props.mode === "edit" ? props.entry.updatedAt : null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const latest = useRef({ date, title, content, templateKey, milestoneId: milestone?.id ?? null });
  const idRef = useRef(entryId);
  const versionRef = useRef(version);
  const savedRef = useRef(0);
  const inFlight = useRef<Promise<void> | null>(null);
  useEffect(() => {
    latest.current = { date, title, content, templateKey, milestoneId: milestone?.id ?? null };
    versionRef.current = version;
  });

  const flush = useCallback(async (): Promise<void> => {
    if (readOnly) return;
    // um salvamento por vez: espera o que estiver em andamento e salva o que sobrou
    while (inFlight.current) await inFlight.current;
    if (versionRef.current === savedRef.current) return;
    const run = (async () => {
      setSaving(true);
      try {
        while (versionRef.current !== savedRef.current) {
          const v = versionRef.current;
          const snap = latest.current;
          if (!isIsoDate(snap.date)) break;
          if (!idRef.current) {
            // Entrada nova: só vai para o banco quando tiver algo escrito.
            if (!hasJournalContent(snap.content, snap.title)) {
              savedRef.current = v;
              break;
            }
            const res = await createJournalEntry({
              entryDate: snap.date,
              title: snap.title,
              templateKey: snap.templateKey,
              milestoneId: snap.milestoneId,
              content: snap.content,
            });
            if (!res.ok) throw new Error(res.error);
            idRef.current = res.data.id;
            setEntryId(res.data.id);
            setSavedAt(res.data.updatedAt);
            window.history.replaceState(null, "", `/dashboard/diario/${res.data.id}`);
          } else {
            const res = await updateJournalEntry(idRef.current, {
              entryDate: snap.date,
              title: snap.title,
              content: snap.content,
            });
            if (!res.ok) throw new Error(res.error);
            setSavedAt(res.data.updatedAt);
          }
          savedRef.current = v;
        }
        setSaveError(null);
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : "Não foi possível salvar.");
      } finally {
        setSavedVersion(savedRef.current);
        setSaving(false);
        inFlight.current = null;
      }
    })();
    inFlight.current = run;
    return run;
  }, [readOnly]);

  // agenda o salvamento depois de cada alteração
  useEffect(() => {
    if (version === 0 || readOnly) return;
    const t = setTimeout(() => void flush(), AUTOSAVE_MS);
    return () => clearTimeout(t);
  }, [version, flush, readOnly]);

  const dirty = version !== savedVersion;
  const unsaved = !readOnly && (dirty || saving) && (entryId !== null || hasJournalContent(content, title));

  // Ctrl/Cmd+S salva agora; sair com alteração pendente pede confirmação do navegador.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void flush();
      }
    };
    const onUnload = (e: BeforeUnloadEvent) => {
      if (unsaved) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onUnload);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [flush, unsaved]);

  const touch = () => setVersion((v) => v + 1);

  // ---------------------------------------------------------------- edição
  const updateContent = (fn: (c: JournalContent) => JournalContent) => {
    setContent(fn);
    touch();
  };
  const updateSection = (id: string, fn: (s: JournalSection) => JournalSection) =>
    updateContent((c) => ({ ...c, sections: c.sections.map((s) => (s.id === id ? fn(s) : s)) }));

  const addSection = (kind: JournalSectionKind) => {
    if (content.sections.length >= JOURNAL_LIMITS.sections) return;
    const meta = SECTION_KIND_META[kind];
    const section: JournalSection = {
      id: journalId("s"),
      kind,
      title: meta.defaultTitle,
      ...(kind === "text" ? { text: "" } : { items: [{ id: journalId("i"), text: "", done: false, category: null }] }),
    };
    updateContent((c) => ({ ...c, sections: [...c.sections, section] }));
    setFocusTarget(kind === "text" ? `text:${section.id}` : `item:${section.items![0].id}`);
  };
  const moveSection = (id: string, dir: -1 | 1) =>
    updateContent((c) => {
      const i = c.sections.findIndex((s) => s.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= c.sections.length) return c;
      const sections = [...c.sections];
      [sections[i], sections[j]] = [sections[j], sections[i]];
      return { ...c, sections };
    });
  const removeSection = async (section: JournalSection) => {
    const filled = section.kind === "text" ? !!section.text?.trim() : (section.items ?? []).some((i) => i.text.trim());
    if (filled && !(await confirm({ title: `Remover “${section.title}”?`, message: "O que foi escrito nesta seção será apagado.", intent: "danger", confirmLabel: "Remover" }))) return;
    updateContent((c) => ({ ...c, sections: c.sections.filter((s) => s.id !== section.id) }));
  };

  const addCategory = (name: string) => {
    const next = normalizeCategories([...content.categories, name]);
    if (next.length === content.categories.length) return false;
    updateContent((c) => ({ ...c, categories: next }));
    return true;
  };
  const removeCategory = (name: string) =>
    updateContent((c) => ({
      categories: c.categories.filter((x) => x !== name),
      sections: c.sections.map((s) =>
        s.kind === "resolved" ? { ...s, items: (s.items ?? []).map((it) => (it.category === name ? { ...it, category: null } : it)) } : s,
      ),
    }));

  // Troca de template: só numa entrada nova ainda intocada.
  const canSwitchTemplate = props.mode === "new" && !entryId && !hasJournalContent(content, title);
  const switchTemplate = (key: string) => {
    const t = templates.find((x) => x.key === key);
    if (!t) return;
    setTemplateKey(key);
    setContent(cloneTemplate(t));
    try {
      localStorage.setItem("diario:template", key);
    } catch {}
  };

  // foco depois de criar item/seção
  const [focusTarget, setFocusTarget] = useState<string | null>(null);
  useEffect(() => {
    if (!focusTarget) return;
    const el = document.querySelector<HTMLElement>(`[data-focus="${CSS.escape(focusTarget)}"]`);
    el?.focus();
    setFocusTarget(null);
  }, [focusTarget]);

  // ---------------------------------------------------------------- ações
  const goBack = async (e: MouseEvent) => {
    if (!unsaved) return;
    e.preventDefault();
    await flush();
    router.push("/dashboard/diario");
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(journalToPlainText({ title, entryDate: date, content }));
      addToast("Texto copiado.", "success");
    } catch {
      addToast("Não foi possível copiar.", "error");
    }
  };

  const remove = async () => {
    if (!entryId) return;
    const ok = await confirm({
      title: "Excluir esta entrada?",
      message: "A entrada do diário será apagada para sempre.",
      intent: "danger",
      confirmLabel: "Excluir",
    });
    if (!ok) return;
    const res = await deleteJournalEntry(entryId);
    if (!res.ok) return addToast(res.error, "error");
    savedRef.current = versionRef.current; // nada pendente: não perguntar ao sair
    setSavedVersion(versionRef.current);
    addToast("Entrada excluída.", "success");
    router.push("/dashboard/diario");
  };

  const [templateDialog, setTemplateDialog] = useState(false);

  // ---------------------------------------------------------------- render
  const stats = useMemo(() => journalStats(content), [content]);
  const rel = today && yesterday && date ? relativeDay(date, today, yesterday) : null;
  const futureDate = !!today && !!date && date > today;
  const templateName = templates.find((t) => t.key === templateKey)?.name;
  const placeholderTitle = date ? `Diário de ${formatJournalDate(date, "long")}` : "Diário do dia";

  return (
    <ToolScope className="min-h-[calc(100dvh-3.5rem)]">
      <Toolbar label="Diário" className="sticky top-14 z-10 gap-y-1.5 px-3">
        <ToolbarGroup>
          <Link
            href="/dashboard/diario"
            onClick={goBack}
            className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-[13px] font-semibold text-base-content/70 hover:bg-base-content/[0.06] hover:text-base-content"
          >
            <ArrowLeft size={16} /> Diário
          </Link>
        </ToolbarGroup>
        <ToolbarDivider />
        <ToolbarGroup className="gap-1.5">
          <label className="sr-only" htmlFor="journal-date">
            Data da entrada
          </label>
          <ToolInput
            id="journal-date"
            type="date"
            value={date}
            max={today ? addDays(today, 7) : undefined}
            disabled={readOnly}
            icon={<CalendarDays />}
            className="w-[11.5rem]"
            onChange={(e) => {
              if (!isIsoDate(e.target.value)) return;
              setDate(e.target.value);
              touch();
            }}
          />
          {rel && <ToolBadge tone="primary">{rel}</ToolBadge>}
          {futureDate && <ToolBadge tone="warning">Data futura</ToolBadge>}
        </ToolbarGroup>
        {canSwitchTemplate ? (
          <>
            <ToolbarDivider />
            <ToolbarGroup>
              <label className="sr-only" htmlFor="journal-template">
                Template
              </label>
              <ToolSelect
                id="journal-template"
                value={templateKey ?? ""}
                onChange={(e) => switchTemplate(e.target.value)}
                className="w-48"
              >
                {templates.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.name}
                  </option>
                ))}
              </ToolSelect>
            </ToolbarGroup>
          </>
        ) : (
          templateName && (
            <span className="hidden items-center gap-1.5 pl-1 text-xs text-base-content/50 md:inline-flex">
              <TemplateIcon icon={templates.find((t) => t.key === templateKey)?.icon} className="size-3.5" />
              {templateName}
            </span>
          )
        )}
        <ToolbarSpacer />
        {!readOnly && <SaveStatus saving={saving} dirty={unsaved} isNew={!entryId} savedAt={savedAt} error={saveError} onRetry={flush} />}
        <ToolbarGroup>
          <IconButton label="Copiar como texto" icon={<Copy />} onClick={copyText} />
          {!readOnly && <IconButton label="Salvar como template" icon={<BookmarkPlus />} onClick={() => setTemplateDialog(true)} />}
          {canDelete && entryId && <IconButton label="Excluir entrada" icon={<Trash2 />} variant="ghost" className="hover:text-error" onClick={remove} />}
        </ToolbarGroup>
      </Toolbar>

      <div className="mx-auto grid w-full max-w-6xl gap-5 px-3 py-6 sm:px-5 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <main className="min-w-0 space-y-3">
          {readOnly && (
            <InlineAlert type="info" title={`Diário de ${author.name ?? "outro membro"}`}>
              Você está lendo. Só quem escreveu pode editar esta entrada.
            </InlineAlert>
          )}

          <header className="space-y-1.5 pb-1">
            {readOnly ? (
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{title || placeholderTitle}</h1>
            ) : (
              <input
                aria-label="Título"
                value={title}
                maxLength={JOURNAL_LIMITS.title}
                placeholder={placeholderTitle}
                onChange={(e) => {
                  setTitle(e.target.value);
                  touch();
                }}
                className="w-full bg-transparent text-2xl font-black tracking-tight outline-none placeholder:text-base-content/30 sm:text-3xl"
              />
            )}
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-base-content/55">
              <span suppressHydrationWarning>{date ? formatJournalDate(date, "long") : "…"}</span>
              {scope.type === "team" && (
                <>
                  <span aria-hidden>·</span>
                  <AuthorChip author={author} size={18} />
                  <span aria-hidden>·</span>
                  <span>{scope.teamName}</span>
                </>
              )}
            </p>
          </header>

          {content.sections.length === 0 && (
            <p className="rounded-lg border border-dashed border-base-300 px-4 py-6 text-center text-[13px] text-base-content/55">
              {readOnly ? "Esta entrada está vazia." : "Sem seções. Adicione uma abaixo."}
            </p>
          )}

          {content.sections.map((section, index) => (
            <SectionPanel
              key={section.id}
              section={section}
              categories={content.categories}
              readOnly={readOnly}
              first={index === 0}
              last={index === content.sections.length - 1}
              onChange={(fn) => updateSection(section.id, fn)}
              onMove={(dir) => moveSection(section.id, dir)}
              onRemove={() => removeSection(section)}
              onFocus={setFocusTarget}
            />
          ))}

          {!readOnly && content.sections.length < JOURNAL_LIMITS.sections && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-base-content/45">Adicionar seção</span>
              <ToolButton size="xs" icon={<Type />} onClick={() => addSection("text")}>
                Texto
              </ToolButton>
              <ToolButton size="xs" icon={<ListChecks />} onClick={() => addSection("checklist")}>
                Tarefas
              </ToolButton>
              <ToolButton size="xs" icon={<CheckCircle2 />} onClick={() => addSection("resolved")}>
                Resolvido
              </ToolButton>
            </div>
          )}
        </main>

        <aside className="space-y-3 lg:sticky lg:top-[7.5rem] lg:self-start">
          <div className="grid grid-cols-2 gap-2">
            <InfoTile
              label="Tarefas"
              value={stats.tasksTotal ? `${stats.tasksDone}/${stats.tasksTotal}` : "—"}
              hint={stats.tasksTotal ? `${Math.round((stats.tasksDone / stats.tasksTotal) * 100)}% feitas` : "nenhuma"}
              trend={stats.tasksTotal && stats.tasksDone === stats.tasksTotal ? "up" : undefined}
            />
            <InfoTile label="Resolvidos" value={stats.resolved} hint={stats.words ? `${stats.words} palavras` : undefined} />
          </div>

          <Panel title="Por tipo" icon={<Tag />}>
            {stats.resolved === 0 ? (
              <p className="text-xs text-base-content/50">Os itens resolvidos aparecem aqui, agrupados por tipo.</p>
            ) : (
              <ul className="space-y-2">
                {[...stats.byCategory, ...(stats.uncategorized ? [{ category: "Sem tipo", count: stats.uncategorized }] : [])].map((c) => (
                  <li key={c.category} className="text-xs">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="truncate font-semibold">{c.category}</span>
                      <span className="font-mono text-base-content/55">{c.count}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-base-200">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(c.count / stats.resolved) * 100}%`,
                          background: c.category === "Sem tipo" ? "var(--color-base-300)" : categoryColor(c.category),
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <JournalLabelsPanel
            entryId={entryId}
            readOnly={readOnly}
            initialTags={props.mode === "edit" ? props.entry.tags : []}
            milestone={milestone}
            onMilestoneChange={setMilestone}
          />
          {milestone && <JournalGoalPanel milestone={milestone} today={today} scope={scope} onChange={setMilestone} />}
          <JournalLinksPanel entryId={entryId} readOnly={readOnly} initialLinks={props.mode === "edit" ? props.entry.links : []} />

          <CategoriesPanel categories={content.categories} readOnly={readOnly} onAdd={addCategory} onRemove={removeCategory} />
        </aside>
      </div>

      <SaveTemplateDialog
        key={templateDialog ? "open" : "closed"}
        open={templateDialog}
        onClose={() => setTemplateDialog(false)}
        content={content}
        defaultName={title.trim() || templateName || ""}
        onSaved={(name) => {
          setTemplateDialog(false);
          addToast(`Template “${name}” salvo${scope.type === "team" ? " para a equipe" : ""}.`, "success");
          router.refresh();
        }}
      />
      {confirmDialog}
    </ToolScope>
  );
}

// ============================================================================
// Status de salvamento
// ============================================================================

function SaveStatus({
  saving,
  dirty,
  isNew,
  savedAt,
  error,
  onRetry,
}: {
  saving: boolean;
  dirty: boolean;
  isNew: boolean;
  savedAt: string | null;
  error: string | null;
  onRetry: () => void;
}) {
  let body;
  if (error) {
    body = (
      <button type="button" onClick={onRetry} className="inline-flex items-center gap-1.5 text-error hover:underline" title={error}>
        <AlertCircle size={14} /> Não salvou · tentar de novo
      </button>
    );
  } else if (saving) {
    body = (
      <>
        <Loader2 size={14} className="animate-spin" /> Salvando…
      </>
    );
  } else if (dirty) {
    body = (
      <>
        <Cloud size={14} /> Alterações pendentes
      </>
    );
  } else if (isNew) {
    body = (
      <>
        <Sparkles size={14} /> Começa a salvar quando você escrever
      </>
    );
  } else {
    body = (
      <>
        <Check size={14} className="text-success" /> Salvo{savedAt && <span suppressHydrationWarning> às {fmtClock(savedAt)}</span>}
      </>
    );
  }
  return (
    <span role="status" aria-live="polite" className="mr-1 hidden items-center gap-1.5 text-xs text-base-content/55 sm:inline-flex">
      {body}
    </span>
  );
}

// ============================================================================
// Seção
// ============================================================================

function SectionPanel({
  section,
  categories,
  readOnly,
  first,
  last,
  onChange,
  onMove,
  onRemove,
  onFocus,
}: {
  section: JournalSection;
  categories: string[];
  readOnly: boolean;
  first: boolean;
  last: boolean;
  onChange: (fn: (s: JournalSection) => JournalSection) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  onFocus: (target: string) => void;
}) {
  const Icon = section.kind === "text" ? Type : section.kind === "checklist" ? ListChecks : CheckCircle2;
  const items = section.items ?? [];
  const filled = items.filter((i) => i.text.trim());
  const done = filled.filter((i) => i.done).length;

  const titleNode = readOnly ? (
    section.title
  ) : (
    <input
      aria-label="Título da seção"
      value={section.title}
      maxLength={JOURNAL_LIMITS.sectionTitle}
      onChange={(e) => onChange((s) => ({ ...s, title: e.target.value }))}
      className="w-full min-w-0 rounded bg-transparent px-1 -mx-1 outline-none hover:bg-base-content/[0.04] focus:bg-base-content/[0.05]"
    />
  );

  const counter =
    section.kind === "checklist" && filled.length > 0 ? (
      <ToolBadge tone={done === filled.length ? "success" : "ink"}>
        {done}/{filled.length}
      </ToolBadge>
    ) : section.kind === "resolved" && filled.length > 0 ? (
      <ToolBadge tone="info">{filled.length}</ToolBadge>
    ) : null;

  return (
    <Panel
      title={titleNode}
      icon={<Icon />}
      actions={
        <>
          {counter}
          {!readOnly && (
            <span className="ml-1 flex items-center opacity-60 transition-opacity focus-within:opacity-100 hover:opacity-100">
              <IconButton label="Mover para cima" icon={<ArrowUp />} size="xs" disabled={first} onClick={() => onMove(-1)} />
              <IconButton label="Mover para baixo" icon={<ArrowDown />} size="xs" disabled={last} onClick={() => onMove(1)} />
              <IconButton label="Remover seção" icon={<X />} size="xs" onClick={onRemove} />
            </span>
          )}
        </>
      }
    >
      {section.kind === "text" ? (
        readOnly ? (
          <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-base-content/85">
            {section.text?.trim() || <span className="text-base-content/40">—</span>}
          </p>
        ) : (
          <textarea
            data-focus={`text:${section.id}`}
            aria-label={section.title}
            value={section.text ?? ""}
            maxLength={JOURNAL_LIMITS.text}
            placeholder={section.placeholder ?? SECTION_KIND_META.text.placeholder}
            onChange={(e) => onChange((s) => ({ ...s, text: e.target.value }))}
            rows={3}
            className="block min-h-20 w-full resize-none bg-transparent text-[14px] leading-relaxed outline-none placeholder:text-base-content/35 [field-sizing:content]"
          />
        )
      ) : (
        <ItemList section={section} categories={categories} readOnly={readOnly} onChange={onChange} onFocus={onFocus} />
      )}
    </Panel>
  );
}

// ============================================================================
// Itens (tarefas e resolvidos)
// ============================================================================

function ItemList({
  section,
  categories,
  readOnly,
  onChange,
  onFocus,
}: {
  section: JournalSection;
  categories: string[];
  readOnly: boolean;
  onChange: (fn: (s: JournalSection) => JournalSection) => void;
  onFocus: (target: string) => void;
}) {
  const isChecklist = section.kind === "checklist";
  const items = section.items ?? [];
  const visible = readOnly ? items.filter((i) => i.text.trim()) : items;

  const setItems = (fn: (items: JournalItem[]) => JournalItem[]) => onChange((s) => ({ ...s, items: fn(s.items ?? []) }));
  const patch = (id: string, p: Partial<JournalItem>) => setItems((list) => list.map((it) => (it.id === id ? { ...it, ...p } : it)));

  const insertAfter = (index: number) => {
    if (items.length >= JOURNAL_LIMITS.items) return;
    // novo resolvido herda o tipo do item anterior (registrar vários do mesmo tipo é o comum)
    const prevCategory = !isChecklist ? (items[index]?.category ?? items[items.length - 1]?.category ?? null) : null;
    const item: JournalItem = isChecklist ? { id: journalId("i"), text: "", done: false } : { id: journalId("i"), text: "", category: prevCategory };
    setItems((list) => [...list.slice(0, index + 1), item, ...list.slice(index + 1)]);
    onFocus(`item:${item.id}`);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number, item: JournalItem) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      insertAfter(index);
    } else if (e.key === "Backspace" && item.text === "" && items.length > 1) {
      e.preventDefault();
      const prev = items[index - 1] ?? items[index + 1];
      setItems((list) => list.filter((it) => it.id !== item.id));
      if (prev) onFocus(`item:${prev.id}`);
    }
  };

  if (readOnly && visible.length === 0) return <p className="text-[13px] text-base-content/40">—</p>;

  return (
    <div>
      <ul className="space-y-0.5">
        {visible.map((item, index) => (
          <li key={item.id} className="group flex items-center gap-2 rounded-md px-1 py-0.5 hover:bg-base-content/[0.03]">
            {isChecklist ? (
              <input
                type="checkbox"
                aria-label={item.done ? "Marcar como não feita" : "Marcar como feita"}
                className="checkbox checkbox-primary checkbox-sm rounded"
                checked={!!item.done}
                disabled={readOnly}
                onChange={(e) => patch(item.id, { done: e.target.checked })}
              />
            ) : (
              <CategoryPicker
                value={item.category ?? null}
                categories={categories}
                readOnly={readOnly}
                onChange={(category) => patch(item.id, { category })}
              />
            )}
            {readOnly ? (
              <span className={cn("min-w-0 flex-1 text-[14px]", isChecklist && item.done && "text-base-content/50 line-through")}>{item.text}</span>
            ) : (
              <input
                data-focus={`item:${item.id}`}
                aria-label={isChecklist ? "Tarefa" : "Item resolvido"}
                value={item.text}
                maxLength={JOURNAL_LIMITS.itemText}
                placeholder={SECTION_KIND_META[section.kind].placeholder}
                onChange={(e) => patch(item.id, { text: e.target.value })}
                onKeyDown={(e) => onKeyDown(e, index, item)}
                className={cn(
                  "h-8 min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-base-content/35",
                  isChecklist && item.done && "text-base-content/50 line-through",
                )}
              />
            )}
            {!readOnly && (
              <IconButton
                label="Remover item"
                icon={<X />}
                size="xs"
                className="opacity-0 focus-visible:opacity-100 group-hover:opacity-100"
                onClick={() => setItems((list) => list.filter((it) => it.id !== item.id))}
              />
            )}
          </li>
        ))}
      </ul>
      {!readOnly && items.length < JOURNAL_LIMITS.items && (
        <button
          type="button"
          onClick={() => insertAfter(items.length - 1)}
          className="mt-1 inline-flex h-7 items-center gap-1.5 rounded-md px-1.5 text-[13px] font-semibold text-base-content/50 hover:bg-base-content/[0.05] hover:text-base-content"
        >
          <Plus size={14} /> {isChecklist ? "Adicionar tarefa" : "Adicionar resolvido"}
        </button>
      )}
    </div>
  );
}

/** Seletor do tipo de um item resolvido: um selo colorido que é um <select> por baixo. */
function CategoryPicker({
  value,
  categories,
  readOnly,
  onChange,
}: {
  value: string | null;
  categories: string[];
  readOnly: boolean;
  onChange: (v: string | null) => void;
}) {
  const label = value ?? "Tipo";
  if (readOnly) {
    return value ? <ToolBadge tone={categoryTone(value)}>{value}</ToolBadge> : <ToolBadge tone="ink">Sem tipo</ToolBadge>;
  }
  return (
    <span className="relative inline-flex shrink-0">
      <ToolBadge tone={value ? categoryTone(value) : "ink"} className={cn("pr-1", !value && "border border-dashed border-base-content/25 bg-transparent text-base-content/50")}>
        <span className="max-w-[9rem] truncate">{label}</span>
        <svg viewBox="0 0 10 10" className="size-2.5 opacity-60" aria-hidden>
          <path d="M2 4l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </ToolBadge>
      <select
        aria-label="Tipo do item resolvido"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        <option value="">Sem tipo</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </span>
  );
}

// ============================================================================
// Categorias da entrada
// ============================================================================

function CategoriesPanel({
  categories,
  readOnly,
  onAdd,
  onRemove,
}: {
  categories: string[];
  readOnly: boolean;
  onAdd: (name: string) => boolean;
  onRemove: (name: string) => void;
}) {
  const [draft, setDraft] = useState("");
  if (readOnly && categories.length === 0) return null;
  return (
    <Panel title="Tipos de resolvido" icon={<CheckCircle2 />} collapsible defaultOpen={!readOnly}>
      <div className="flex flex-wrap gap-1.5">
        {categories.length === 0 && <p className="text-xs text-base-content/50">Nenhum tipo. Crie um abaixo.</p>}
        {categories.map((c) => (
          <ToolBadge key={c} tone={categoryTone(c)} className="pr-0.5">
            {c}
            {!readOnly && (
              <button
                type="button"
                aria-label={`Remover o tipo ${c}`}
                onClick={() => onRemove(c)}
                className="grid size-4 place-items-center rounded hover:bg-base-content/10"
              >
                <X size={10} />
              </button>
            )}
          </ToolBadge>
        ))}
      </div>
      {!readOnly && categories.length < JOURNAL_LIMITS.categories && (
        <form
          className="mt-2.5"
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.trim() && onAdd(draft)) setDraft("");
          }}
        >
          <ToolInput
            value={draft}
            maxLength={JOURNAL_LIMITS.category}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Novo tipo e Enter"
            icon={<Plus />}
            aria-label="Novo tipo de resolvido"
          />
        </form>
      )}
    </Panel>
  );
}

// ============================================================================
// Salvar como template
// ============================================================================

function SaveTemplateDialog({
  open,
  onClose,
  content,
  defaultName,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  content: JournalContent;
  defaultName: string;
  onSaved: (name: string) => void;
}) {
  const [name, setName] = useState(defaultName);
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState<JournalTemplateIcon>("NotebookPen");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async () => {
    setPending(true);
    setError(null);
    const res = await saveJournalTemplate({ name, description, icon, content });
    setPending(false);
    if (!res.ok) return setError(res.error);
    onSaved(name.trim());
  };

  const tasks = content.sections.filter((s) => s.kind === "checklist").flatMap((s) => s.items ?? []).filter((i) => i.text.trim()).length;

  return (
    <ToolDialog
      open={open}
      onClose={onClose}
      title="Salvar como template"
      description="Use esta estrutura nas próximas entradas."
      size="md"
      footer={
        <>
          <ToolButton onClick={onClose}>Cancelar</ToolButton>
          <ToolButton variant="primary" disabled={pending || !name.trim()} onClick={submit} icon={pending ? <Loader2 className="animate-spin" /> : <BookmarkPlus />}>
            Salvar template
          </ToolButton>
        </>
      }
    >
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        {error && <InlineAlert type="error">{error}</InlineAlert>}
        <ToolSection title="Nome">
          <ToolInput autoFocus value={name} maxLength={JOURNAL_LIMITS.templateName} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Treino de sábado" />
        </ToolSection>
        <ToolSection title="Descrição (opcional)">
          <ToolInput value={description} maxLength={JOURNAL_LIMITS.templateDescription} onChange={(e) => setDescription(e.target.value)} placeholder="Quando usar este template" />
        </ToolSection>
        <ToolSection title="Ícone">
          <div role="radiogroup" aria-label="Ícone" className="flex flex-wrap gap-1">
            {JOURNAL_TEMPLATE_ICONS.map((key) => {
              const Icon = TEMPLATE_ICONS[key];
              return (
                <IconButton key={key} label={key} icon={<Icon />} variant="outline" active={icon === key} role="radio" aria-checked={icon === key} onClick={() => setIcon(key)} />
              );
            })}
          </div>
        </ToolSection>
        <InlineAlert type="info">
          Vão junto: {content.sections.length} {content.sections.length === 1 ? "seção" : "seções"}, {content.categories.length} tipos
          {tasks > 0 && `, ${tasks} ${tasks === 1 ? "tarefa fixa" : "tarefas fixas"} (desmarcadas)`}. O texto do dia e os itens resolvidos não vão.
        </InlineAlert>
      </form>
    </ToolDialog>
  );
}
