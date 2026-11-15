"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import {
  AlignLeft,
  CalendarClock,
  ChevronDown,
  CircleDot,
  Flag,
  Plus,
  Sparkles,
  Tags,
  TextCursorInput,
  UserRound,
  X,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Propriedades da página no estilo Notion: linhas tipadas (status,     */
/* prioridade, responsável, prazo), descrição, tags e campos livres.    */
/* Tudo continua salvo no JSON `properties` do documento.              */
/* ------------------------------------------------------------------ */

export const PROP_STATUS = "status";
export const PROP_PRIORITY = "prioridade";
export const PROP_OWNER = "responsavel";
export const PROP_DUE = "prazo";
const BUILTIN = new Set([PROP_STATUS, PROP_PRIORITY, PROP_OWNER, PROP_DUE]);

type Option = { value: string; dot: string; badge: string };

export const STATUS_OPTIONS: Option[] = [
  { value: "Rascunho", dot: "bg-base-content/40", badge: "bg-base-200 text-base-content/75" },
  { value: "Em andamento", dot: "bg-info", badge: "bg-info/15 text-info-content dark:text-info" },
  { value: "Em revisão", dot: "bg-warning", badge: "bg-warning/20 text-warning-content dark:text-warning" },
  { value: "Concluído", dot: "bg-success", badge: "bg-success/15 text-success-content dark:text-success" },
];

export const PRIORITY_OPTIONS: Option[] = [
  { value: "Baixa", dot: "bg-base-content/40", badge: "bg-base-200 text-base-content/75" },
  { value: "Média", dot: "bg-warning", badge: "bg-warning/20 text-warning-content dark:text-warning" },
  { value: "Alta", dot: "bg-orange-500", badge: "bg-orange-500/15 text-orange-700 dark:text-orange-300" },
  { value: "Urgente", dot: "bg-error", badge: "bg-error/15 text-error" },
];

const HINT_DISMISSED_KEY = "stagebook:props-hint-dismissed";
const hintListeners = new Set<() => void>();

/** "Agora não" no convite de propriedades — vale para todas as páginas deste navegador. */
function useHintDismissed(): [boolean, () => void] {
  const dismissed = useSyncExternalStore(
    (cb) => {
      hintListeners.add(cb);
      return () => hintListeners.delete(cb);
    },
    () => {
      try {
        return localStorage.getItem(HINT_DISMISSED_KEY) === "1";
      } catch {
        return false;
      }
    },
    () => true, // no servidor não mostra (evita piscar)
  );
  const dismiss = () => {
    try {
      localStorage.setItem(HINT_DISMISSED_KEY, "1");
    } catch {}
    hintListeners.forEach((cb) => cb());
  };
  return [dismissed, dismiss];
}

/** Texto do prazo relativo a hoje ("em 3 dias", "atrasado 2 dias"). */
export function dueLabel(iso: string, today = new Date()): { text: string; tone: "late" | "soon" | "ok" | "done" } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const due = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const days = Math.round((due.getTime() - base.getTime()) / 86_400_000);
  if (days === 0) return { text: "hoje", tone: "soon" };
  if (days === 1) return { text: "amanhã", tone: "soon" };
  if (days > 1) return { text: `em ${days} dias`, tone: days <= 3 ? "soon" : "ok" };
  return { text: days === -1 ? "atrasado 1 dia" : `atrasado ${-days} dias`, tone: "late" };
}

export function formatDue(iso: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Propriedades preenchidas em texto, para PDF/HTML/Markdown. */
export function propertiesForExport(properties: Record<string, unknown>): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = [];
  const str = (k: string) => (typeof properties[k] === "string" ? (properties[k] as string) : "");
  if (str(PROP_STATUS)) out.push({ label: "Status", value: str(PROP_STATUS) });
  if (str(PROP_PRIORITY)) out.push({ label: "Prioridade", value: str(PROP_PRIORITY) });
  if (str(PROP_OWNER)) out.push({ label: "Responsável", value: str(PROP_OWNER) });
  if (str(PROP_DUE)) out.push({ label: "Prazo", value: formatDue(str(PROP_DUE)) });
  for (const [k, v] of Object.entries(properties)) {
    if (!BUILTIN.has(k) && v != null && String(v)) out.push({ label: k, value: String(v) });
  }
  return out;
}

type RowKey = "status" | "prioridade" | "responsavel" | "prazo" | "descricao" | "tags";

const SUGGESTIONS: { key: RowKey; label: string; icon: ReactNode; why: string }[] = [
  { key: "status", label: "Status", icon: <CircleDot size={13} />, why: "Saiba em que pé está" },
  { key: "prazo", label: "Prazo", icon: <CalendarClock size={13} />, why: "Avisa quando atrasar" },
  { key: "responsavel", label: "Responsável", icon: <UserRound size={13} />, why: "Quem cuida da página" },
  { key: "prioridade", label: "Prioridade", icon: <Flag size={13} />, why: "O que vem primeiro" },
  { key: "descricao", label: "Descrição", icon: <AlignLeft size={13} />, why: "Resumo em uma linha" },
  { key: "tags", label: "Tags e marco", icon: <Tags size={13} />, why: "Agrupe com Kanban e Calendário" },
];

/* ---------- pedaços ---------- */

function Row({
  icon,
  label,
  children,
  onRemove,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
  onRemove?: () => void;
}) {
  return (
    <div className="group/row flex min-h-9 items-start gap-2 rounded-lg px-1.5 py-1 hover:bg-base-200/50">
      <div className="flex w-32 shrink-0 items-center gap-1.5 pt-1 text-[13px] text-base-content/55 sm:w-36">
        <span className="text-base-content/45">{icon}</span>
        <span className="truncate">{label}</span>
      </div>
      <div className="min-w-0 flex-1 text-sm">{children}</div>
      {onRemove && (
        <button
          type="button"
          className="no-print mt-1 rounded p-1 text-base-content/35 opacity-100 transition hover:bg-base-300/60 hover:text-base-content md:opacity-0 md:group-hover/row:opacity-100"
          aria-label={`Remover ${label}`}
          title={`Remover ${label}`}
          onClick={onRemove}
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}

function OptionPicker({
  value,
  options,
  placeholder,
  autoOpen,
  onChange,
}: {
  value: string;
  options: Option[];
  placeholder: string;
  autoOpen?: boolean;
  onChange: (value: string | null) => void;
}) {
  const [open, setOpen] = useState(Boolean(autoOpen));
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[13px] transition ${
          current ? current.badge : "text-base-content/40 hover:bg-base-200"
        }`}
        onClick={() => setOpen((v) => !v)}
      >
        {current && <span className={`h-2 w-2 rounded-full ${current.dot}`} />}
        {current?.value ?? (value || placeholder)}
        <ChevronDown size={12} className="no-print opacity-60" />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute left-0 top-full z-50 mt-1 w-48 rounded-xl border border-base-300 bg-base-100 p-1 shadow-xl"
        >
          {options.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                role="option"
                aria-selected={o.value === value}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-base-200 ${
                  o.value === value ? "bg-base-200 font-medium" : ""
                }`}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
              >
                <span className={`h-2 w-2 rounded-full ${o.dot}`} />
                {o.value}
              </button>
            </li>
          ))}
          {value && (
            <li className="mt-1 border-t border-base-300 pt-1">
              <button
                type="button"
                className="w-full rounded-lg px-2 py-1.5 text-left text-xs text-base-content/55 hover:bg-base-200"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
              >
                Limpar
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

function TextValue({
  value,
  placeholder,
  autoFocus,
  multiline,
  onCommit,
}: {
  value: string;
  placeholder: string;
  autoFocus?: boolean;
  multiline?: boolean;
  onCommit: (value: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const [prev, setPrev] = useState(value);
  const ref = useRef<HTMLTextAreaElement>(null);
  if (prev !== value) {
    setPrev(value);
    setDraft(value);
  }
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [draft]);
  return (
    <textarea
      ref={ref}
      rows={1}
      autoFocus={autoFocus}
      value={draft}
      placeholder={placeholder}
      className="block w-full resize-none overflow-hidden rounded-md bg-transparent px-1 py-0.5 text-sm leading-6 outline-none placeholder:text-base-content/35 focus:bg-base-200/70"
      onChange={(e) => setDraft(multiline ? e.target.value : e.target.value.replace(/\n/g, " "))}
      onBlur={() => draft.trim() !== value && onCommit(draft.trim())}
      onKeyDown={(e) => {
        if (e.key === "Enter" && (!multiline || !e.shiftKey)) {
          e.preventDefault();
          (e.target as HTMLTextAreaElement).blur();
        }
        if (e.key === "Escape") {
          setDraft(value);
          requestAnimationFrame(() => ref.current?.blur());
        }
      }}
    />
  );
}

/* ---------- painel ---------- */

export function DocProperties({
  properties,
  onSet,
  description,
  onDescriptionCommit,
  hasLabels,
  labels,
  open,
  onOpenChange,
}: {
  properties: Record<string, unknown>;
  onSet: (key: string, value: string | null) => void;
  description: string;
  onDescriptionCommit: (value: string) => void;
  hasLabels: boolean;
  /** Tags/marco e fixar (componentes do StageBook). */
  labels: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const str = (k: string) => (typeof properties[k] === "string" ? (properties[k] as string) : properties[k] != null ? String(properties[k]) : "");
  // Linhas abertas agora mas ainda vazias (o usuário acabou de pedir).
  const [pending, setPending] = useState<Set<RowKey>>(new Set());
  const [justAdded, setJustAdded] = useState<RowKey | null>(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [customKey, setCustomKey] = useState("");
  const [customValue, setCustomValue] = useState("");
  const [hintDismissed, dismissHint] = useHintDismissed();

  const filled: Record<RowKey, boolean> = {
    status: !!str(PROP_STATUS),
    prioridade: !!str(PROP_PRIORITY),
    responsavel: !!str(PROP_OWNER),
    prazo: !!str(PROP_DUE),
    descricao: !!description.trim(),
    tags: hasLabels,
  };
  const visible = (k: RowKey) => filled[k] || pending.has(k);
  const custom = Object.entries(properties).filter(([k]) => !BUILTIN.has(k));
  const anyFilled = Object.values(filled).some(Boolean) || custom.length > 0;
  const missing = SUGGESTIONS.filter((s) => !visible(s.key));
  const core: RowKey[] = ["status", "prazo", "responsavel", "prioridade"];
  const coreDone = core.filter((k) => filled[k]).length;

  const addRow = (key: RowKey) => {
    onOpenChange(true);
    setPending((prev) => new Set(prev).add(key));
    setJustAdded(key);
  };
  const removeRow = (key: RowKey) => {
    setPending((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    if (key === "descricao") onDescriptionCommit("");
    else if (key !== "tags") onSet(key, null);
  };

  // Nada preenchido e painel fechado: convite para organizar a página.
  if (!open && !anyFilled) {
    if (hintDismissed) return null;
    return (
      <div className="no-print mt-4 rounded-xl border border-dashed border-base-300 bg-base-200/25 p-3">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles size={15} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Organize esta página</p>
            <p className="text-xs text-base-content/55">
              Status, prazo e responsável ajudam a equipe a achar e acompanhar o que importa.
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {SUGGESTIONS.slice(0, 4).map((s) => (
                <button
                  key={s.key}
                  type="button"
                  title={s.why}
                  className="inline-flex items-center gap-1 rounded-full border border-base-300 bg-base-100 px-2.5 py-1 text-xs text-base-content/70 transition hover:border-primary/50 hover:text-primary"
                  onClick={() => addRow(s.key)}
                >
                  <Plus size={11} />
                  {s.icon}
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            className="rounded-md px-2 py-1 text-xs text-base-content/45 hover:bg-base-200 hover:text-base-content/70"
            onClick={dismissHint}
          >
            Agora não
          </button>
        </div>
      </div>
    );
  }

  if (!open) return null;

  return (
    <section aria-label="Propriedades da página" className="doc-properties mt-4 rounded-xl border border-base-300/70 p-1.5 sm:p-2">
      <div className="flex items-center justify-between px-1.5 pb-1 pt-0.5">
        <span className="text-[11px] font-medium uppercase tracking-wider text-base-content/45">Propriedades</span>
        <span className="no-print flex items-center gap-2 text-[11px] text-base-content/45" title="Status, prazo, responsável e prioridade">
          <span className="flex gap-0.5" aria-hidden>
            {core.map((k) => (
              <span key={k} className={`h-1.5 w-4 rounded-full ${filled[k] ? "bg-primary" : "bg-base-300"}`} />
            ))}
          </span>
          {coreDone === core.length ? "Página organizada" : `${coreDone} de ${core.length}`}
        </span>
      </div>

      {visible("status") && (
        <Row icon={<CircleDot size={14} />} label="Status" onRemove={() => removeRow("status")}>
          <OptionPicker
            value={str(PROP_STATUS)}
            options={STATUS_OPTIONS}
            placeholder="Escolher status"
            autoOpen={justAdded === "status" && !filled.status}
            onChange={(v) => onSet(PROP_STATUS, v)}
          />
        </Row>
      )}
      {visible("prazo") && (
        <Row icon={<CalendarClock size={14} />} label="Prazo" onRemove={() => removeRow("prazo")}>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              autoFocus={justAdded === "prazo" && !filled.prazo}
              value={str(PROP_DUE)}
              onChange={(e) => onSet(PROP_DUE, e.target.value || null)}
              className="rounded-md bg-transparent px-1 py-0.5 text-sm outline-none focus:bg-base-200/70"
              aria-label="Prazo"
            />
            {(() => {
              const d = str(PROP_DUE) ? dueLabel(str(PROP_DUE)) : null;
              if (!d) return null;
              const done = str(PROP_STATUS) === "Concluído";
              const tone = done ? "bg-success/15 text-success" : d.tone === "late" ? "bg-error/15 text-error" : d.tone === "soon" ? "bg-warning/20 text-warning-content dark:text-warning" : "bg-base-200 text-base-content/60";
              return <span className={`rounded-full px-2 py-0.5 text-xs ${tone}`}>{done ? "entregue" : d.text}</span>;
            })()}
          </div>
        </Row>
      )}
      {visible("responsavel") && (
        <Row icon={<UserRound size={14} />} label="Responsável" onRemove={() => removeRow("responsavel")}>
          <TextValue
            value={str(PROP_OWNER)}
            placeholder="Quem cuida desta página?"
            autoFocus={justAdded === "responsavel" && !filled.responsavel}
            onCommit={(v) => onSet(PROP_OWNER, v || null)}
          />
        </Row>
      )}
      {visible("prioridade") && (
        <Row icon={<Flag size={14} />} label="Prioridade" onRemove={() => removeRow("prioridade")}>
          <OptionPicker
            value={str(PROP_PRIORITY)}
            options={PRIORITY_OPTIONS}
            placeholder="Escolher prioridade"
            autoOpen={justAdded === "prioridade" && !filled.prioridade}
            onChange={(v) => onSet(PROP_PRIORITY, v)}
          />
        </Row>
      )}
      {visible("descricao") && (
        <Row icon={<AlignLeft size={14} />} label="Descrição" onRemove={() => removeRow("descricao")}>
          <TextValue
            value={description}
            multiline
            placeholder="Resumo da página em uma ou duas linhas"
            autoFocus={justAdded === "descricao" && !filled.descricao}
            onCommit={onDescriptionCommit}
          />
        </Row>
      )}
      {visible("tags") && (
        <Row icon={<Tags size={14} />} label="Tags e marco">
          <div className="flex flex-wrap items-center gap-2">{labels}</div>
        </Row>
      )}
      {custom.map(([key, value]) => (
        <Row key={key} icon={<TextCursorInput size={14} />} label={key} onRemove={() => onSet(key, null)}>
          <TextValue value={String(value ?? "")} placeholder="Vazio" onCommit={(v) => onSet(key, v || null)} />
        </Row>
      ))}

      {/* Adicionar: sugestões do que falta + campo livre */}
      <div className="no-print flex flex-wrap items-center gap-1 px-1 pb-0.5 pt-1.5">
        {missing.map((s) => (
          <button
            key={s.key}
            type="button"
            title={s.why}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-base-content/45 transition hover:bg-base-200 hover:text-base-content/80"
            onClick={() => addRow(s.key)}
          >
            <Plus size={11} />
            {s.label}
          </button>
        ))}
        <div className="relative">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-base-content/45 transition hover:bg-base-200 hover:text-base-content/80"
            onClick={() => setCustomOpen((v) => !v)}
          >
            <Plus size={11} />
            Personalizada
          </button>
          {customOpen && (
            <form
              className="absolute left-0 top-full z-50 mt-1 flex w-60 flex-col gap-2 rounded-xl border border-base-300 bg-base-100 p-3 shadow-xl"
              onSubmit={(e) => {
                e.preventDefault();
                const key = customKey.trim();
                if (!key || BUILTIN.has(key.toLowerCase())) return;
                onSet(key, customValue.trim() || "—");
                setCustomKey("");
                setCustomValue("");
                setCustomOpen(false);
              }}
            >
              <input
                autoFocus
                className="input input-xs input-bordered"
                placeholder="Nome (ex.: Versão do robô)"
                value={customKey}
                maxLength={60}
                onChange={(e) => setCustomKey(e.target.value)}
              />
              <input
                className="input input-xs input-bordered"
                placeholder="Valor (ex.: v3.2)"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
              />
              <button type="submit" className="btn btn-xs btn-primary">
                Adicionar
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
