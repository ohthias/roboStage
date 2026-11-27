"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Flame,
  LayoutTemplate,
  Link2,
  ListChecks,
  NotebookPen,
  PenLine,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  Button,
  Chip,
  DisplayHeading,
  EmptyState,
  IconButton,
  InfoTile,
  Panel,
  PlainCard,
  Segmented,
  Sparkle,
  ToolBadge,
  ToolButton,
  ToolDialog,
  ToolEmpty,
  ToolInput,
  ToolSelect,
  cn,
  useToolConfirm,
} from "@/components/stage";
import { useToast } from "@/components/providers/ToastContext";
import { deleteJournalTemplate } from "@/features/stagebook/actions/journal";
import {
  DEFAULT_JOURNAL_TEMPLATE_KEY,
  SECTION_KIND_META,
  addDays,
  formatJournalDate,
  journalStreak,
  localToday,
  type JournalEntryListItem,
  type JournalScopeInfo,
  type JournalTemplate,
} from "@/features/stagebook/types/journal";
import { useClientToday, useStoredValue } from "../hooks/use-client-value";
import { TagList } from "@/features/stagebook/components/labels/tag-chip";
import { MilestoneChip } from "@/features/stagebook/components/labels/milestone-chip";
import { DueBadge, GoalFlag, GoalProgressBar } from "@/features/stagebook/components/goals/goal-ui";
import { resolveLabelColor } from "@/features/stagebook/lib/label-colors";
import { milestoneProgress, type MilestoneDTO } from "@/features/stagebook/types/labels";
import { AuthorChip, TemplateIcon, categoryColor, categoryTone, relativeDay } from "./journal-ui";

const TEMPLATE_PREF = "diario:template";
const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

const shiftMonth = (month: string, delta: number) => {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + delta, 1)).toISOString().slice(0, 7);
};
const upperFirst = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const monthLabel = (month: string) => {
  const [y, m] = month.split("-").map(Number);
  return upperFirst(
    new Date(Date.UTC(y, m - 1, 15)).toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }),
  );
};
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/**
 * Página inicial do Diário: o botão de escrever o dia, a sequência, o
 * calendário do mês e a lista de entradas (no espaço de equipe, de todos).
 */
export function JournalHome({
  viewerId,
  scope,
  month,
  query,
  entries,
  myDates,
  templates,
  goal = null,
}: {
  goal?: MilestoneDTO | null;
  viewerId: string;
  scope: JournalScopeInfo;
  month: string;
  query: string;
  entries: JournalEntryListItem[];
  myDates: string[];
  templates: JournalTemplate[];
}) {
  const router = useRouter();
  const isTeam = scope.type === "team";

  // "hoje" vem do navegador (fuso de quem usa); o template padrão é o último usado.
  const today = useClientToday();
  const storedTemplate = useStoredValue(TEMPLATE_PREF);
  const [pickedTemplate, setTemplateKey] = useState<string | null>(null);
  const templateKey =
    pickedTemplate ?? (storedTemplate && templates.some((t) => t.key === storedTemplate) ? storedTemplate : DEFAULT_JOURNAL_TEMPLATE_KEY);
  const yesterday = today ? addDays(today, -1) : null;

  const [who, setWho] = useState<"all" | "me">("all");
  const [member, setMember] = useState<string>("");
  const [category, setCategory] = useState<string | null>(null);
  const [goalFilter, setGoalFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [day, setDay] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState(query);

  // filtro de pessoa (antes de dia/tipo: o calendário e o resumo seguem a pessoa)
  const byPerson = useMemo(
    () => entries.filter((e) => (who === "me" ? e.isMine : member ? e.author.id === member : true)),
    [entries, who, member],
  );
  const visible = useMemo(
    () =>
      byPerson.filter(
        (e) =>
          (!day || e.entryDate === day) &&
          (!category || e.stats.byCategory.some((c) => c.category === category)) &&
          (!goalFilter || e.milestone?.id === goalFilter) &&
          (!tagFilter || e.tags.some((t) => t.id === tagFilter)),
      ),
    [byPerson, day, category, goalFilter, tagFilter],
  );

  const monthStats = useMemo(() => {
    let tasksDone = 0;
    let tasksTotal = 0;
    let resolved = 0;
    const cats = new Map<string, number>();
    for (const e of byPerson) {
      tasksDone += e.stats.tasksDone;
      tasksTotal += e.stats.tasksTotal;
      resolved += e.stats.resolved;
      for (const c of e.stats.byCategory) cats.set(c.category, (cats.get(c.category) ?? 0) + c.count);
    }
    const categories = [...cats.entries()].sort((a, b) => b[1] - a[1]);
    return {
      tasksDone,
      tasksTotal,
      resolved,
      categories,
      days: new Set(byPerson.map((e) => e.entryDate)).size,
    };
  }, [byPerson]);

  const goalOptions = useMemo(() => {
    const map = new Map<string, MilestoneDTO>();
    for (const e of entries) if (e.milestone) map.set(e.milestone.id, e.milestone);
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [entries]);
  const tagOptions = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    for (const e of entries) for (const t of e.tags) map.set(t.id, t);
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [entries]);

  const streak = today ? journalStreak(myDates, today) : 0;
  const wroteToday = !!today && myDates.includes(today);

  const write = (
    opts: {
      date?: string;
      template?: string;
      another?: boolean;
      goal?: string;
    } = {},
  ) => {
    const date = opts.date ?? today ?? localToday();
    const tpl = opts.template ?? templateKey;
    if (opts.template) {
      try {
        localStorage.setItem(TEMPLATE_PREF, opts.template);
      } catch {}
    }
    const params = new URLSearchParams({ data: date, template: tpl });
    if (opts.another) params.set("nova", "1");
    if (opts.goal) params.set("marco", opts.goal);
    router.push(`/dashboard/diario/novo?${params}`);
  };

  const groups = useMemo(() => {
    const map = new Map<string, JournalEntryListItem[]>();
    for (const e of visible) map.set(e.entryDate, [...(map.get(e.entryDate) ?? []), e]);
    return [...map.entries()];
  }, [visible]);

  const currentTemplate = templates.find((t) => t.key === templateKey);
  const filtering = !!day || !!category || who === "me" || !!member || !!goalFilter || !!tagFilter;
  const listMode = goal ? "goal" : query ? "search" : "month";

  return (
    <div className="min-h-full bg-base-100 px-4 py-8 text-base-content sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-7">
        {/* ---------------------------------------------------------- cabeçalho */}
        <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="relative inline-block pr-9">
              <DisplayHeading as="h1" size="sm" tag={isTeam ? `Diário · ${scope.teamName}` : "Diário pessoal"} highlight="hoje?">
                O que rolou
              </DisplayHeading>
              <Sparkle size={30} tone="accent" motion="wiggle" className="absolute right-0 top-5 hidden sm:block" />
            </div>
            <p className="mt-2 max-w-xl text-sm text-base-content/60">
              {isTeam
                ? "Cada membro registra o que fez no dia. Todo mundo da equipe lê, cada um edita o seu."
                : "Registre o que você fez, as tarefas e o que conseguiu resolver. Só você vê."}
            </p>
          </div>

          <div className="flex items-stretch">
            <Button size="lg" iconLeft={<PenLine size={20} />} onClick={() => write()} className="rounded-r-none! pr-4">
              {wroteToday ? "Continuar o de hoje" : "Escrever hoje"}
            </Button>
            <Button
              size="lg"
              shape="square"
              tone="primary"
              aria-label="Escolher template"
              title="Escolher template"
              onClick={() => setPickerOpen(true)}
              className="ml-px rounded-l-none! rounded-tr-none!"
            >
              <ChevronDown size={20} />
            </Button>
          </div>
        </header>

        {goal && <GoalBanner goal={goal} today={today} count={entries.length} onWrite={() => write({ goal: goal.id, another: true })} />}

        {/* ---------------------------------------------------------- números */}
        <section aria-label="Resumo" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <InfoTile
            label="Sequência"
            value={
              <span className="inline-flex items-center gap-1.5">
                <Flame className={cn("size-5", streak > 0 ? "text-primary" : "text-base-content/30")} />
                {streak}
              </span>
            }
            unit={streak === 1 ? "dia" : "dias"}
            hint={!today ? " " : wroteToday ? "Hoje já foi" : streak > 0 ? "Escreva hoje para manter" : "Comece hoje"}
            trend={wroteToday ? "up" : undefined}
          />
          <InfoTile
            label={listMode === "month" ? `Dias com registro · ${monthLabel(month).split(" ")[0]}` : "Dias com registro"}
            value={monthStats.days}
            hint={plural(byPerson.length, "entrada", "entradas")}
          />
          <InfoTile
            label="Tarefas feitas"
            value={monthStats.tasksDone}
            unit={monthStats.tasksTotal ? `/ ${monthStats.tasksTotal}` : undefined}
            hint={
              monthStats.tasksTotal
                ? `${Math.round((monthStats.tasksDone / monthStats.tasksTotal) * 100)}% concluídas`
                : listMode === "month"
                  ? "no mês"
                  : "nesta lista"
            }
          />
          <InfoTile
            label="Coisas resolvidas"
            value={monthStats.resolved}
            hint={monthStats.categories[0] ? `Mais: ${monthStats.categories[0][0]}` : "no mês"}
          />
        </section>

        <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
          {/* ---------------------------------------------------------- lateral */}
          <aside className="order-2 space-y-4 lg:order-none lg:sticky lg:top-20 lg:self-start">
            <MonthCalendar
              month={month}
              today={today}
              entries={byPerson}
              selected={day}
              onSelect={(d) => setDay((cur) => (cur === d ? null : d))}
              disabled={listMode !== "month"}
            />
            <Panel title={listMode === "month" ? "Tipos resolvidos no mês" : "Tipos resolvidos"} icon={<CheckCircle2 />}>
              {monthStats.categories.length === 0 ? (
                <p className="text-xs text-base-content/50">Quando você marcar o tipo de cada coisa resolvida, o resumo aparece aqui.</p>
              ) : (
                <ul className="space-y-1">
                  {monthStats.categories.map(([name, count]) => {
                    const on = category === name;
                    return (
                      <li key={name}>
                        <button
                          type="button"
                          aria-pressed={on}
                          onClick={() => setCategory(on ? null : name)}
                          className={cn(
                            "w-full rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-base-content/[0.05]",
                            on && "bg-primary/10",
                          )}
                        >
                          <span className="mb-1 flex items-center justify-between gap-2">
                            <span className={cn("truncate font-semibold", on && "text-primary")}>{name}</span>
                            <span className="font-mono text-base-content/55">{count}</span>
                          </span>
                          <span className="block h-1.5 overflow-hidden rounded-full bg-base-200">
                            <span
                              className="block h-full rounded-full"
                              style={{
                                width: `${(count / monthStats.categories[0][1]) * 100}%`,
                                background: categoryColor(name),
                              }}
                            />
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>
          </aside>

          {/* ---------------------------------------------------------- lista */}
          <section aria-label="Entradas" className="order-1 min-w-0 space-y-4 lg:order-none">
            <div className="flex flex-wrap items-center gap-2">
              {listMode === "goal" ? (
                <h2 className="mr-auto text-lg font-black tracking-tight">
                  Entradas da meta <span className="text-base-content/45">· {entries.length}</span>
                </h2>
              ) : query ? (
                <h2 className="mr-auto text-lg font-black tracking-tight">
                  Resultados para “{query}” <span className="text-base-content/45">· {entries.length}</span>
                </h2>
              ) : (
                <div className="mr-auto flex items-center gap-1">
                  <Link
                    href={`/dashboard/diario?mes=${shiftMonth(month, -1)}`}
                    aria-label="Mês anterior"
                    className="grid size-8 place-items-center rounded-md hover:bg-base-content/[0.06]"
                  >
                    <ChevronLeft size={18} />
                  </Link>
                  <h2 className="min-w-[10.5rem] text-center text-lg font-black tracking-tight">{monthLabel(month)}</h2>
                  <Link
                    href={`/dashboard/diario?mes=${shiftMonth(month, 1)}`}
                    aria-label="Próximo mês"
                    className="grid size-8 place-items-center rounded-md hover:bg-base-content/[0.06]"
                  >
                    <ChevronRight size={18} />
                  </Link>
                  {today && month !== today.slice(0, 7) && (
                    <Link href="/dashboard/diario" className="ml-1 text-xs font-semibold text-primary hover:underline">
                      Ir para hoje
                    </Link>
                  )}
                </div>
              )}

              {isTeam && (
                <>
                  <Segmented
                    label="De quem"
                    size="sm"
                    value={who}
                    onChange={(v) => {
                      setWho(v);
                      if (v === "me") setMember("");
                    }}
                    options={[
                      { value: "all", label: "Equipe" },
                      { value: "me", label: "Meus" },
                    ]}
                  />
                  {who === "all" && (
                    <ToolSelect aria-label="Filtrar por membro" value={member} onChange={(e) => setMember(e.target.value)} className="w-40">
                      <option value="">Todos os membros</option>
                      {scope.members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.id === viewerId ? `${m.name ?? "Você"} (você)` : (m.name ?? "Membro")}
                        </option>
                      ))}
                    </ToolSelect>
                  )}
                </>
              )}

              {goalOptions.length > 0 && !goal && (
                <ToolSelect
                  aria-label="Filtrar por meta"
                  value={goalFilter}
                  onChange={(e) => setGoalFilter(e.target.value)}
                  className="w-40"
                >
                  <option value="">Todas as metas</option>
                  {goalOptions.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </ToolSelect>
              )}
              {tagOptions.length > 0 && (
                <ToolSelect aria-label="Filtrar por tag" value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} className="w-36">
                  <option value="">Todas as tags</option>
                  {tagOptions.map((t) => (
                    <option key={t.id} value={t.id}>
                      #{t.name}
                    </option>
                  ))}
                </ToolSelect>
              )}

              <form
                role="search"
                className="w-full sm:w-56"
                onSubmit={(e) => {
                  e.preventDefault();
                  const q = search.trim();
                  router.push(q ? `/dashboard/diario?q=${encodeURIComponent(q)}` : `/dashboard/diario?mes=${month}`);
                }}
              >
                <ToolInput
                  type="search"
                  aria-label="Buscar no diário"
                  placeholder="Buscar em todas as datas"
                  icon={<Search />}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </form>
            </div>

            {(filtering || query) && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-base-content/50">Filtros:</span>
                {query && <FilterChip onClear={() => router.push(`/dashboard/diario?mes=${month}`)}>busca “{query}”</FilterChip>}
                {day && <FilterChip onClear={() => setDay(null)}>{formatJournalDate(day, "weekday")}</FilterChip>}
                {category && <FilterChip onClear={() => setCategory(null)}>{category}</FilterChip>}
                {goalFilter && (
                  <FilterChip onClear={() => setGoalFilter("")}>meta: {goalOptions.find((m) => m.id === goalFilter)?.name}</FilterChip>
                )}
                {tagFilter && <FilterChip onClear={() => setTagFilter("")}>#{tagOptions.find((t) => t.id === tagFilter)?.name}</FilterChip>}
                {who === "me" && <FilterChip onClear={() => setWho("all")}>só os meus</FilterChip>}
                {member && (
                  <FilterChip onClear={() => setMember("")}>
                    {isTeam ? (scope.members.find((m) => m.id === member)?.name ?? "membro") : "membro"}
                  </FilterChip>
                )}
              </div>
            )}

            {entries.length === 0 && listMode === "month" ? (
              <EmptyState
                title={isTeam ? "O diário da equipe está em branco" : "Seu diário está em branco"}
                description="Clique em escrever: a data de hoje já vem preenchida e você pode mudar depois. Comece por um template ou em branco."
                action={
                  <div className="flex flex-wrap justify-center gap-2">
                    {templates.slice(0, 4).map((t) => (
                      <Chip
                        key={t.key}
                        icon={<TemplateIcon icon={t.icon} className="size-3.5" />}
                        onClick={() => write({ template: t.key })}
                      >
                        {t.name}
                      </Chip>
                    ))}
                  </div>
                }
              />
            ) : visible.length === 0 ? (
              <ToolEmpty
                icon={<NotebookPen />}
                title={
                  goal && entries.length === 0
                    ? "Ninguém escreveu sobre esta meta ainda"
                    : query
                      ? "Nada encontrado"
                      : "Nenhuma entrada com esses filtros"
                }
                description={
                  day && today && day <= today && !query ? "Ninguém escreveu neste dia ainda." : "Tente outro filtro ou outro mês."
                }
                action={
                  day && today && day <= today && !query ? (
                    <ToolButton variant="primary" icon={<Plus />} onClick={() => write({ date: day, another: true })}>
                      Escrever em {formatJournalDate(day, "weekday")}
                    </ToolButton>
                  ) : undefined
                }
              />
            ) : (
              <ol className="space-y-6">
                {groups.map(([date, list]) => {
                  const rel = today && yesterday ? relativeDay(date, today, yesterday) : null;
                  return (
                    <li key={date}>
                      <h3 className="mb-2 flex items-baseline gap-2 border-b border-base-300 pb-1.5" suppressHydrationWarning>
                        <span className="text-sm font-black tracking-tight">
                          {upperFirst(formatJournalDate(date, "long").split(",")[0])}
                        </span>
                        <span className="font-mono text-xs text-base-content/50">{formatJournalDate(date, "short")}</span>
                        {rel && <ToolBadge tone="primary">{rel}</ToolBadge>}
                      </h3>
                      <div className="grid gap-3 xl:grid-cols-2">
                        {list.map((e) => (
                          <EntryCard
                            key={e.id}
                            entry={e}
                            templates={templates}
                            showAuthor={isTeam}
                            onOpen={() => router.push(`/dashboard/diario/${e.id}`)}
                          />
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </div>
      </div>

      <TemplatePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        templates={templates}
        current={currentTemplate?.key ?? null}
        wroteToday={wroteToday}
        onPick={(key) => {
          setPickerOpen(false);
          setTemplateKey(key);
          write({ template: key, another: wroteToday });
        }}
      />
    </div>
  );
}

// ============================================================================

function FilterChip({ children, onClear }: { children: React.ReactNode; onClear: () => void }) {
  return (
    <span className="inline-flex h-6 items-center gap-1 rounded-full border border-base-300 bg-base-100 pl-2.5 pr-1 font-semibold">
      {children}
      <button
        type="button"
        aria-label="Remover filtro"
        onClick={onClear}
        className="grid size-4 place-items-center rounded-full hover:bg-base-content/10"
      >
        <X size={11} />
      </button>
    </span>
  );
}

function EntryCard({
  entry,
  templates,
  showAuthor,
  onOpen,
}: {
  entry: JournalEntryListItem;
  templates: JournalTemplate[];
  showAuthor: boolean;
  onOpen: () => void;
}) {
  const { stats } = entry;
  const tpl = templates.find((t) => t.key === entry.templateKey);
  return (
    <PlainCard
      onClick={onOpen}
      title={
        <span className="flex items-center gap-1.5">
          <TemplateIcon icon={tpl?.icon} className="size-3.5 shrink-0 text-base-content/45" />
          <span className="text-[14px]">{entry.title || `Diário de ${formatJournalDate(entry.entryDate, "weekday")}`}</span>
        </span>
      }
      description={entry.excerpt || <span className="italic text-base-content/40">Sem texto ainda.</span>}
      meta={
        <>
          {showAuthor && <AuthorChip author={entry.author} size={18} className="font-semibold text-base-content/70" />}
          {stats.tasksTotal > 0 && (
            <span className={cn("inline-flex items-center gap-1", stats.tasksDone === stats.tasksTotal && "text-success")}>
              <ListChecks size={12} /> {stats.tasksDone}/{stats.tasksTotal}
            </span>
          )}
          {stats.resolved > 0 && (
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 size={12} /> {plural(stats.resolved, "resolvido", "resolvidos")}
            </span>
          )}
          {entry.linkCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <Link2 size={12} /> {plural(entry.linkCount, "vínculo", "vínculos")}
            </span>
          )}
        </>
      }
    >
      {(entry.milestone || entry.tags.length > 0) && (
        <div className="mb-1.5 flex flex-wrap items-center gap-1">
          {entry.milestone && <MilestoneChip milestone={entry.milestone} size="xs" showDate={false} />}
          <TagList tags={entry.tags} size="xs" max={3} />
        </div>
      )}
      {stats.byCategory.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {stats.byCategory.slice(0, 4).map((c) => (
            <ToolBadge key={c.category} tone={categoryTone(c.category)}>
              {c.category}
              {c.count > 1 && <span className="opacity-70">×{c.count}</span>}
            </ToolBadge>
          ))}
          {stats.byCategory.length > 4 && <ToolBadge>+{stats.byCategory.length - 4}</ToolBadge>}
        </div>
      )}
    </PlainCard>
  );
}

// ============================================================================

function MonthCalendar({
  month,
  today,
  entries,
  selected,
  onSelect,
  disabled,
}: {
  month: string;
  today: string | null;
  entries: JournalEntryListItem[];
  selected: string | null;
  onSelect: (date: string) => void;
  disabled?: boolean;
}) {
  const [y, m] = month.split("-").map(Number);
  const firstWeekday = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();

  const byDay = new Map<string, { total: number; mine: boolean }>();
  for (const e of entries) {
    const cur = byDay.get(e.entryDate) ?? { total: 0, mine: false };
    byDay.set(e.entryDate, {
      total: cur.total + 1,
      mine: cur.mine || e.isMine,
    });
  }

  const cells: (string | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`),
  ];

  return (
    <Panel title="Calendário" icon={<CalendarDays />} className={cn(disabled && "opacity-50")}>
      <div className="grid grid-cols-7 gap-0.5 text-center" role="grid" aria-label="Dias do mês">
        {WEEKDAYS.map((d, i) => (
          <span key={i} className="pb-1 text-[10px] font-semibold text-base-content/40">
            {d}
          </span>
        ))}
        {cells.map((date, i) => {
          if (!date) return <span key={`e${i}`} />;
          const info = byDay.get(date);
          const isToday = date === today;
          const future = !!today && date > today;
          const on = selected === date;
          return (
            <button
              key={date}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(date)}
              aria-pressed={on}
              aria-label={`${formatJournalDate(date, "long")}${info ? `, ${plural(info.total, "entrada", "entradas")}` : ""}`}
              className={cn(
                "relative grid aspect-square place-items-center rounded-md text-[12px] tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-primary",
                on
                  ? "bg-primary font-bold text-primary-content"
                  : info
                    ? "bg-primary/10 font-bold text-base-content hover:bg-primary/20"
                    : "hover:bg-base-content/[0.06]",
                future && !on && "text-base-content/30",
                isToday && !on && "ring-2 ring-inset ring-primary",
              )}
            >
              {Number(date.slice(8))}
              {info && (
                <span className="absolute bottom-1 flex gap-0.5" aria-hidden>
                  {Array.from({ length: Math.min(info.total, 3) }).map((_, k) => (
                    <span
                      key={k}
                      className={cn(
                        "size-1 rounded-full",
                        on ? "bg-primary-content" : info.mine && k === 0 ? "bg-primary" : "bg-base-content/40",
                      )}
                    />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {disabled && <p className="mt-2 text-[11px] text-base-content/50">O calendário mostra um mês; esta lista junta várias datas.</p>}
    </Panel>
  );
}

// ============================================================================

function TemplatePicker({
  open,
  onClose,
  templates,
  current,
  wroteToday,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  templates: JournalTemplate[];
  current: string | null;
  wroteToday: boolean;
  onPick: (key: string) => void;
}) {
  const router = useRouter();
  const { confirm, dialog: confirmDialog } = useToolConfirm();
  const { addToast } = useToast();
  const saved = templates.filter((t) => !t.builtin);
  const builtin = templates.filter((t) => t.builtin);

  const remove = async (t: JournalTemplate) => {
    const ok = await confirm({
      title: `Excluir o template “${t.name}”?`,
      message: "As entradas já escritas com ele não mudam.",
      intent: "danger",
      confirmLabel: "Excluir",
    });
    if (!ok) return;
    const res = await deleteJournalTemplate(t.key);
    if (!res.ok) return addToast(res.error, "error");
    addToast("Template excluído.", "success");
    router.refresh();
  };

  const card = (t: JournalTemplate) => (
    <li key={t.key} className="relative">
      <button
        type="button"
        onClick={() => onPick(t.key)}
        className={cn(
          "flex h-full w-full items-start gap-3 rounded-lg border bg-base-100 p-3 text-left transition-colors hover:border-primary/50 hover:bg-primary/[0.03] focus-visible:outline-2 focus-visible:outline-primary",
          current === t.key ? "border-primary/60 ring-2 ring-primary/15" : "border-base-300",
        )}
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-tl-lg rounded-br-lg bg-primary/10 text-primary">
          <TemplateIcon icon={t.icon} className="size-[18px]" />
        </span>
        <span className="min-w-0 flex-1 pr-6">
          <span className="block text-[13px] font-bold">{t.name}</span>
          {t.description && <span className="mt-0.5 block text-xs text-base-content/60">{t.description}</span>}
          <span className="mt-2 flex flex-wrap gap-1">
            {t.content.sections.map((s) => (
              <span key={s.id} className="rounded bg-base-200 px-1.5 py-0.5 text-[10px] font-semibold text-base-content/60">
                {s.title || SECTION_KIND_META[s.kind].label}
              </span>
            ))}
          </span>
        </span>
      </button>
      {t.canManage && (
        <IconButton
          label={`Excluir ${t.name}`}
          icon={<Trash2 />}
          size="xs"
          className="absolute right-2 top-2 hover:text-error"
          onClick={() => remove(t)}
        />
      )}
    </li>
  );

  return (
    <>
      <ToolDialog
        open={open}
        onClose={onClose}
        size="lg"
        title="Escolher template"
        description={
          wroteToday
            ? "Você já escreveu hoje: o template escolhido abre uma entrada nova para hoje."
            : "A data de hoje já vem preenchida; dá para mudar dentro da entrada."
        }
      >
        <div className="space-y-4 pb-2">
          {saved.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-base-content/50">Salvos neste espaço</p>
              <ul className="grid gap-2 sm:grid-cols-2">{saved.map(card)}</ul>
            </div>
          )}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-base-content/50">Prontos</p>
            <ul className="grid gap-2 sm:grid-cols-2">{builtin.map(card)}</ul>
          </div>
          <p className="flex items-center gap-1.5 text-xs text-base-content/55">
            <LayoutTemplate size={14} /> Para criar o seu, abra uma entrada e use “Salvar como template”.
          </p>
        </div>
      </ToolDialog>
      {confirmDialog}
    </>
  );
}

// ============================================================================

/** Cabeçalho do modo "entradas de uma meta" (?marco=). */
function GoalBanner({ goal, today, count, onWrite }: { goal: MilestoneDTO; today: string | null; count: number; onWrite: () => void }) {
  const color = resolveLabelColor(goal.color, goal.name);
  return (
    <section
      className="flex flex-col gap-4 rounded-lg border border-base-300 bg-base-100 p-4 sm:flex-row sm:items-center"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <GoalFlag milestone={goal} size={40} />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-base-content/50">Meta</p>
          <h2 className="truncate text-xl font-black tracking-tight">{goal.name}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-base-content/55">
            <DueBadge milestone={goal} today={today} />
            <span>{plural(count, "entrada no diário", "entradas no diário")}</span>
          </div>
          {goal.criteria.length > 0 && (
            <GoalProgressBar progress={milestoneProgress(goal.criteria)} color={color} className="mt-2 max-w-sm" />
          )}
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <Link
          href="/dashboard/diario"
          className="inline-flex h-9 items-center rounded-md px-3 text-[13px] font-semibold text-base-content/60 hover:bg-base-content/[0.06]"
        >
          Ver tudo
        </Link>
        <ToolButton variant="primary" size="md" icon={<PenLine />} onClick={onWrite} disabled={!!goal.completedAt}>
          Registrar para esta meta
        </ToolButton>
      </div>
    </section>
  );
}
