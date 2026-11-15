"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowDownWideNarrow,
  Ban,
  Check,
  ClipboardList,
  Crown,
  Download,
  FileJson,
  Flag,
  Handshake,
  Minus,
  Pencil,
  Plus,
  RotateCcw,
  Swords,
  Table2,
  Trash2,
  Trophy,
  Upload,
  Users,
} from "lucide-react";

import { allianceCountFor, firstRoundPairings } from "@/utils/competitions/ftc/biobuzz";
import {
  allTeamStats,
  bestPartners,
  emptyScouting,
  entriesToCsv,
  entryFoulPoints,
  entryPoints,
  mergeScouting,
  newEntry,
  parseScouting,
  parseTeamList,
  qualificationOrder,
  rankPairs,
  simulateSelection,
  winChance,
  type PairEvaluation,
  type ScoutEntry,
  type ScoutingData,
  type TeamStats,
} from "@/utils/competitions/ftc/scouting";
import { STORAGE_KEYS, downloadFile, slug, usePersistentState } from "@/utils/competitions/ftc/storage";

type Tab = "evento" | "registrar" | "equipes" | "aliancas" | "dados";

const TABS: { key: Tab; label: string; icon: typeof Users }[] = [
  { key: "evento", label: "Evento", icon: Flag },
  { key: "registrar", label: "Registrar", icon: ClipboardList },
  { key: "equipes", label: "Equipes", icon: Table2 },
  { key: "aliancas", label: "Alianças", icon: Handshake },
  { key: "dados", label: "Dados", icon: FileJson },
];

const card = "rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100";
const kicker = "font-mono text-[11px] font-bold tracking-[0.18em]";
const fmt = (n: number, d = 0) => (Number.isFinite(n) ? n.toFixed(d) : "—");
const pct = (n: number) => `${Math.round(n * 100)}%`;

/* ------------------------------------------------------------ controles */

function Counter({ label, value, onChange, max = 30, hint }: { label: string; value: number; onChange: (v: number) => void; max?: number; hint?: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-tl-lg rounded-br-lg bg-base-200/60 px-3 py-2">
      <span className="min-w-0 text-sm leading-tight">
        {label}
        {hint && <span className="block text-[10px] text-base-content/45">{hint}</span>}
      </span>
      <div className="flex shrink-0 items-center gap-1">
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))} className="btn btn-circle btn-sm btn-ghost" aria-label={`Menos ${label}`}>
          <Minus size={15} />
        </button>
        <span className="w-8 text-center font-mono text-lg font-bold tabular-nums">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} className="btn btn-circle btn-sm btn-primary" aria-label={`Mais ${label}`}>
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
}

function Flagbox({ label, checked, onChange, tone = "primary" }: { label: string; checked: boolean; onChange: (v: boolean) => void; tone?: "primary" | "error" }) {
  const on = tone === "error" ? "border-error bg-error text-error-content" : "border-primary bg-primary text-primary-content";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex min-h-11 items-center justify-center gap-1.5 rounded-tl-lg rounded-br-lg border px-3 text-sm font-bold transition-colors ${checked ? on : "border-base-300 bg-base-100 text-base-content/60"}`}
    >
      {checked && <Check size={14} />}
      {label}
    </button>
  );
}

function Segmented({ value, options, onChange, label }: { value: number; options: { v: number; l: string }[]; onChange: (v: number) => void; label: string }) {
  return (
    <div>
      <p className="mb-1 text-xs text-base-content/55">{label}</p>
      <div className="join w-full">
        {options.map((o) => (
          <button key={o.v} type="button" onClick={() => onChange(o.v)} className={`btn join-item btn-sm flex-1 ${value === o.v ? "btn-neutral" : ""}`}>
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- evento */

function EventTab({ data, setData }: { data: ScoutingData; setData: (fn: (d: ScoutingData) => ScoutingData) => void }) {
  const [bulk, setBulk] = useState("");
  const e = data.event;
  const setEvent = (patch: Partial<ScoutingData["event"]>) => setData((d) => ({ ...d, event: { ...d.event, ...patch } }));

  const addTeams = () => {
    const list = parseTeamList(bulk);
    if (!list.length) return;
    setData((d) => {
      const known = new Map(d.teams.map((t) => [t.number, t]));
      for (const t of list) known.set(t.number, { ...known.get(t.number), ...t, name: t.name || known.get(t.number)?.name || "" });
      return { ...d, teams: [...known.values()] };
    });
    setBulk("");
  };

  const sorted = [...data.teams].sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr] [&>*]:min-w-0">
      <div className={`${card} p-5`}>
        <p className={`${kicker} text-primary`}>NOSSA EQUIPE E O EVENTO</p>
        <div className="mt-4 grid grid-cols-[110px_1fr] gap-3">
          <label className="flex flex-col gap-1">
            <span className="label-text text-xs">Nº da equipe</span>
            <input value={e.teamNumber} onChange={(ev) => setEvent({ teamNumber: ev.target.value.replace(/\D/g, "").slice(0, 6) })} inputMode="numeric" placeholder="12345" className="input input-bordered input-sm font-mono" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="label-text text-xs">Nome da equipe</span>
            <input value={e.teamName} onChange={(ev) => setEvent({ teamName: ev.target.value })} placeholder="Ex.: Abelhas Mecânicas" className="input input-bordered input-sm" />
          </label>
          <label className="flex flex-col gap-1 col-span-2">
            <span className="label-text text-xs">Evento</span>
            <input value={e.eventName} onChange={(ev) => setEvent({ eventName: ev.target.value })} placeholder="Ex.: Torneio Regional São Paulo" className="input input-bordered input-sm" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="label-text text-xs">Data</span>
            <input type="date" value={e.eventDate} onChange={(ev) => setEvent({ eventDate: ev.target.value })} className="input input-bordered input-sm" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="label-text text-xs">Seu nome (scout)</span>
            <input value={e.scout} onChange={(ev) => setEvent({ scout: ev.target.value })} placeholder="Quem está anotando" className="input input-bordered input-sm" />
          </label>
        </div>
        <p className="mt-4 text-xs leading-5 text-base-content/50">
          A equipe cadastrada aqui aparece destacada no ranking e é a base das sugestões de aliança.
        </p>

        <p className={`${kicker} mt-6 text-secondary`}>ADICIONAR EQUIPES</p>
        <textarea
          value={bulk}
          onChange={(ev) => setBulk(ev.target.value)}
          rows={4}
          placeholder={"Uma por linha: número e nome\n23456 Robôs do Cerrado\n34567 Colmeia Tech"}
          className="textarea textarea-bordered mt-2 w-full font-mono text-sm"
        />
        <button type="button" onClick={addTeams} disabled={!bulk.trim()} className="btn btn-secondary btn-sm mt-2">
          <Plus size={15} /> Adicionar
        </button>
      </div>

      <div className={`${card} p-5`}>
        <div className="flex items-center justify-between gap-3">
          <p className={`${kicker} text-base-content/50`}>EQUIPES DO EVENTO · {data.teams.length}</p>
          <span className="text-xs text-base-content/50">{allianceCountFor(data.teams.filter((t) => !t.unavailable).length)} alianças nos playoffs</span>
        </div>
        <p className="mt-2 text-xs leading-5 text-base-content/50">
          Preencha a posição do ranking oficial quando sair: ela define os capitães na simulação. Marque <Ban size={11} className="inline" /> quem
          não estará disponível (recusou convite ou não joga os playoffs).
        </p>
        {sorted.length === 0 ? (
          <p className="mt-6 text-sm text-base-content/55">Nenhuma equipe ainda. Adicione a lista do evento ao lado ou registre partidas direto.</p>
        ) : (
          <ul className="mt-4 max-h-[440px] divide-y divide-base-200 overflow-y-auto">
            {sorted.map((t) => (
              <li key={t.number} className={`flex items-center gap-2 py-2 ${t.unavailable ? "opacity-50" : ""}`}>
                <span className={`w-16 shrink-0 font-mono text-sm font-bold ${t.number === e.teamNumber ? "text-primary" : ""}`}>{t.number}</span>
                <input
                  value={t.name}
                  onChange={(ev) => setData((d) => ({ ...d, teams: d.teams.map((x) => (x.number === t.number ? { ...x, name: ev.target.value } : x)) }))}
                  className="input input-ghost input-xs min-w-0 flex-1"
                  placeholder="nome"
                  aria-label={`Nome da equipe ${t.number}`}
                />
                <input
                  type="number"
                  min={1}
                  value={t.rank ?? ""}
                  onChange={(ev) =>
                    setData((d) => ({
                      ...d,
                      teams: d.teams.map((x) => (x.number === t.number ? { ...x, rank: ev.target.value ? Math.max(1, Number(ev.target.value)) : undefined } : x)),
                    }))
                  }
                  placeholder="rank"
                  className="input input-bordered input-xs w-16 font-mono"
                  aria-label={`Ranking oficial da equipe ${t.number}`}
                />
                <button
                  type="button"
                  onClick={() => setData((d) => ({ ...d, teams: d.teams.map((x) => (x.number === t.number ? { ...x, unavailable: !x.unavailable } : x)) }))}
                  className={`btn btn-square btn-xs ${t.unavailable ? "btn-error" : "btn-ghost"}`}
                  aria-label={t.unavailable ? "Marcar como disponível" : "Marcar como indisponível"}
                  title="Indisponível para os playoffs"
                >
                  <Ban size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setData((d) => ({ ...d, teams: d.teams.filter((x) => x.number !== t.number) }))}
                  className="btn btn-ghost btn-square btn-xs text-base-content/40 hover:text-error"
                  aria-label={`Remover equipe ${t.number}`}
                >
                  <Trash2 size={13} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ registrar */

function RecordTab({ data, setData }: { data: ScoutingData; setData: (fn: (d: ScoutingData) => ScoutingData) => void }) {
  const [form, setForm] = useState<ScoutEntry>(() => newEntry({ scout: data.event.scout }));
  const [editing, setEditing] = useState<string | null>(null);
  const [flash, setFlash] = useState("");
  const set = (patch: Partial<ScoutEntry>) => setForm((f) => ({ ...f, ...patch }));
  const points = entryPoints(form);
  const teams = [...data.teams].sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
  const duplicate = !editing && data.entries.some((e) => e.match === form.match && e.team === form.team);

  const save = () => {
    if (!form.team) return;
    const entry = { ...form, scout: form.scout || data.event.scout, createdAt: editing ? form.createdAt : Date.now() };
    setData((d) => ({
      ...d,
      teams: d.teams.some((t) => t.number === entry.team) ? d.teams : [...d.teams, { number: entry.team, name: "" }],
      entries: editing ? d.entries.map((e) => (e.id === editing ? entry : e)) : [...d.entries, entry],
    }));
    setFlash(`Partida ${entry.match} · equipe ${entry.team} salva (${entryPoints(entry)} pts)`);
    setTimeout(() => setFlash(""), 2500);
    setEditing(null);
    // mantém partida e aliança: o scout normalmente anota o próximo robô da mesma partida
    setForm(newEntry({ match: entry.match, alliance: entry.alliance, scout: entry.scout }));
  };

  const recent = [...data.entries].sort((a, b) => b.createdAt - a.createdAt).slice(0, 12);

  return (
    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr] [&>*]:min-w-0">
      <div className={`${card} p-4 sm:p-5`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className={`${kicker} text-primary`}>{editing ? "EDITANDO REGISTRO" : "NOVO REGISTRO"}</p>
          <span className="font-mono text-sm">
            <b className="text-2xl tabular-nums">{points}</b> pts
            {entryFoulPoints(form) > 0 && <span className="ml-2 text-error">−{entryFoulPoints(form)} faltas</span>}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-[140px_1fr_1fr]">
          <Counter label="Partida" value={form.match} onChange={(v) => set({ match: Math.max(1, v) })} max={200} />
          <label className="flex flex-col gap-1">
            <span className="label-text text-xs">Equipe</span>
            <input
              list="ftc-scout-teams"
              value={form.team}
              onChange={(e) => set({ team: e.target.value.replace(/\D/g, "").slice(0, 6) })}
              inputMode="numeric"
              placeholder="nº"
              className="input input-bordered font-mono"
            />
            <datalist id="ftc-scout-teams">
              {teams.map((t) => (
                <option key={t.number} value={t.number}>{t.name}</option>
              ))}
            </datalist>
          </label>
          <div className="col-span-2 sm:col-span-1">
            <span className="label-text text-xs">Aliança</span>
            <div className="join mt-1 w-full">
              {(["red", "blue"] as const).map((c) => (
                <button key={c} type="button" onClick={() => set({ alliance: c })} className={`btn join-item flex-1 ${form.alliance === c ? (c === "red" ? "btn-error" : "btn-info") : ""}`}>
                  {c === "red" ? "Vermelha" : "Azul"}
                </button>
              ))}
            </div>
          </div>
        </div>
        {duplicate && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-warning">
            <AlertTriangle size={13} /> Já existe registro desta equipe nesta partida.
          </p>
        )}

        <p className={`${kicker} mt-5 text-secondary`}>AUTO</p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Flagbox label="LEAVE" checked={form.autoLeave} onChange={(v) => set({ autoLeave: v })} />
          <Flagbox label="PARK" checked={form.autoPark} onChange={(v) => set({ autoPark: v })} />
          <div className="col-span-2 sm:col-span-1">
            <Counter label="TIPs" value={form.autoTips} onChange={(v) => set({ autoTips: v })} max={6} />
          </div>
        </div>

        <p className={`${kicker} mt-5 text-primary`}>TELEOP</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <Counter label="TIPs provocados" hint="lançamento deste robô virou a HIVE" value={form.tips} onChange={(v) => set({ tips: v })} max={20} />
          <Counter label="Na CELL de cima" hint="ao fim da partida" value={form.cell} onChange={(v) => set({ cell: v })} />
          <Counter label="Em FLOWERS" hint="POLLEN/NECTAR colocados" value={form.flower} onChange={(v) => set({ flower: v })} />
          <Counter label="NECTAR mais baixo" hint="bônus por FLOWER" value={form.bottomNectar} onChange={(v) => set({ bottomNectar: v })} max={4} />
          <Counter label="No GARDEN" value={form.garden} onChange={(v) => set({ garden: v })} max={40} />
          <Flagbox label="PARK no fim" checked={form.park} onChange={(v) => set({ park: v })} />
        </div>

        <p className={`${kicker} mt-5 text-base-content/50`}>JOGO</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <Counter label="MINOR fouls" hint="+5 p/ adversário" value={form.minorFouls} onChange={(v) => set({ minorFouls: v })} max={10} />
          <Counter label="MAJOR fouls" hint="+20 p/ adversário" value={form.majorFouls} onChange={(v) => set({ majorFouls: v })} max={10} />
          <Segmented label="Defesa" value={form.defense} onChange={(v) => set({ defense: v })} options={[{ v: 0, l: "Não" }, { v: 1, l: "Leve" }, { v: 2, l: "Média" }, { v: 3, l: "Forte" }]} />
          <Segmented label="Pilotagem" value={form.driver} onChange={(v) => set({ driver: v })} options={[1, 2, 3, 4, 5].map((v) => ({ v, l: String(v) }))} />
          <Flagbox label="Quebrou / travou" tone="error" checked={form.broke} onChange={(v) => set({ broke: v })} />
          <Flagbox label="Não apareceu" tone="error" checked={form.noShow} onChange={(v) => set({ noShow: v })} />
        </div>
        <textarea
          value={form.notes}
          onChange={(e) => set({ notes: e.target.value })}
          rows={2}
          placeholder="Observações: mecanismo, ponto fraco, comunicação…"
          className="textarea textarea-bordered mt-3 w-full text-sm"
        />

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={save} disabled={!form.team} className="btn btn-primary flex-1 rounded-tl-xl rounded-br-xl rounded-tr-none rounded-bl-none">
            <Check size={17} /> {editing ? "Salvar alteração" : "Salvar registro"}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setForm(newEntry({ match: form.match, alliance: form.alliance, scout: data.event.scout }));
            }}
            className="btn btn-ghost"
          >
            <RotateCcw size={16} /> Limpar
          </button>
        </div>
        {flash && <p className="mt-3 rounded-tl-lg rounded-br-lg bg-success/15 px-3 py-2 text-sm text-success">{flash}</p>}
      </div>

      <div className={`${card} p-5`}>
        <p className={`${kicker} text-base-content/50`}>ÚLTIMOS REGISTROS · {data.entries.length}</p>
        {recent.length === 0 ? (
          <p className="mt-4 text-sm text-base-content/55">Os registros aparecem aqui. Toque em um para editar.</p>
        ) : (
          <ul className="mt-3 space-y-1.5">
            {recent.map((e) => (
              <li key={e.id} className={`flex items-center gap-2 rounded-tl-lg rounded-br-lg border px-3 py-2 ${editing === e.id ? "border-primary" : "border-base-300"}`}>
                <span className={`size-2 shrink-0 rounded-full ${e.alliance === "red" ? "bg-error" : "bg-info"}`} />
                <span className="w-10 shrink-0 font-mono text-xs text-base-content/50">Q{e.match}</span>
                <span className="min-w-0 flex-1 truncate font-mono text-sm font-bold">{e.team}</span>
                {(e.broke || e.noShow) && <AlertTriangle size={13} className="text-error" />}
                <span className="font-mono text-sm tabular-nums">{entryPoints(e)}</span>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(e.id);
                    setForm(e);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="btn btn-ghost btn-square btn-xs"
                  aria-label={`Editar partida ${e.match} equipe ${e.team}`}
                >
                  <Pencil size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setData((d) => ({ ...d, entries: d.entries.filter((x) => x.id !== e.id) }))}
                  className="btn btn-ghost btn-square btn-xs text-base-content/40 hover:text-error"
                  aria-label={`Excluir partida ${e.match} equipe ${e.team}`}
                >
                  <Trash2 size={13} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- equipes */

type SortKey = "rating" | "avg" | "auto" | "tipsCount" | "endgame" | "reliability" | "fouls" | "matches";

const COLUMNS: { key: SortKey; label: string; render: (t: TeamStats) => string }[] = [
  { key: "matches", label: "Jogos", render: (t) => String(t.matches) },
  { key: "avg", label: "Média", render: (t) => fmt(t.avg) },
  { key: "auto", label: "AUTO", render: (t) => fmt(t.auto) },
  { key: "tipsCount", label: "TIPs", render: (t) => fmt(t.tipsCount, 1) },
  { key: "endgame", label: "Fecham.", render: (t) => fmt(t.endgame) },
  { key: "reliability", label: "Confiab.", render: (t) => pct(t.reliability) },
  { key: "fouls", label: "Faltas", render: (t) => fmt(t.fouls) },
  { key: "rating", label: "Nota", render: (t) => fmt(t.rating) },
];

function TeamsTab({ stats, data, ours }: { stats: TeamStats[]; data: ScoutingData; ours: string }) {
  const [sort, setSort] = useState<SortKey>("rating");
  const [open, setOpen] = useState<string | null>(null);
  const rows = [...stats].sort((a, b) => (sort === "fouls" ? a.fouls - b.fouls : (b[sort] as number) - (a[sort] as number)));

  if (!stats.length) return <Empty text="Registre partidas para ver o ranking das equipes." />;

  return (
    <div className={`${card} overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="table table-sm">
          <thead>
            <tr className="font-mono text-[11px] uppercase">
              <th>#</th>
              <th>Equipe</th>
              {COLUMNS.map((c) => (
                <th key={c.key} className="text-right">
                  <button type="button" onClick={() => setSort(c.key)} className={`inline-flex items-center gap-1 ${sort === c.key ? "text-primary" : ""}`}>
                    {c.label}
                    {sort === c.key && <ArrowDownWideNarrow size={12} />}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((t, i) => (
              <FragmentRow key={t.number} t={t} i={i} ours={ours} open={open === t.number} onToggle={() => setOpen(open === t.number ? null : t.number)} entries={data.entries} />
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-base-300 px-4 py-3 text-xs leading-5 text-base-content/50">
        Média = pontos que o robô gerou por partida (estimativa do scout). Fechamento = FLOWERS, NECTAR mais baixo, GARDEN e PARK. Nota = média ×
        confiabilidade − pontos entregues em falta. Toque em uma equipe para ver as partidas.
      </p>
    </div>
  );
}

function FragmentRow({ t, i, ours, open, onToggle, entries }: { t: TeamStats; i: number; ours: string; open: boolean; onToggle: () => void; entries: ScoutEntry[] }) {
  const mine = entries.filter((e) => e.team === t.number).sort((a, b) => a.match - b.match);
  return (
    <>
      <tr onClick={onToggle} className={`cursor-pointer hover:bg-base-200/60 ${t.number === ours ? "bg-primary/10" : ""} ${t.unavailable ? "opacity-50" : ""}`}>
        <td className="font-mono text-xs text-base-content/45">{t.rank ?? i + 1}</td>
        <td>
          <span className="font-mono font-bold">{t.number}</span>
          {t.name && <span className="ml-2 text-xs text-base-content/55">{t.name}</span>}
          {t.number === ours && <span className="badge badge-primary badge-xs ml-2">nós</span>}
        </td>
        {COLUMNS.map((c) => (
          <td key={c.key} className="text-right font-mono tabular-nums">{c.render(t)}</td>
        ))}
      </tr>
      {open && (
        <tr>
          <td colSpan={COLUMNS.length + 2} className="bg-base-200/40">
            <div className="flex flex-wrap gap-2 py-1">
              {mine.map((e) => (
                <span key={e.id} className="rounded-tl-md rounded-br-md border border-base-300 bg-base-100 px-2 py-1 font-mono text-xs" title={e.notes}>
                  Q{e.match}: <b>{entryPoints(e)}</b>
                  {e.broke && " ⚠"}
                  {e.noShow && " ausente"}
                </span>
              ))}
            </div>
            {mine.some((e) => e.notes) && (
              <ul className="mt-1 space-y-0.5 text-xs text-base-content/60">
                {mine.filter((e) => e.notes).map((e) => (
                  <li key={e.id}>Q{e.match}: {e.notes}</li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-xs text-base-content/50">
              LEAVE {pct(t.leaveRate)} · PARK {pct(t.parkRate)} · melhor {fmt(t.best)} · variação ±{fmt(t.stdev)} · pilotagem {fmt(t.driver, 1)} · defesa {fmt(t.defense, 1)}
            </p>
          </td>
        </tr>
      )}
    </>
  );
}

/* ------------------------------------------------------------- alianças */

function PairCard({ pair, highlight, index }: { pair: PairEvaluation; highlight?: string; index?: number }) {
  return (
    <li className={`${card} p-4`}>
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-lg font-bold">
          {index != null && <span className="mr-2 text-xs text-base-content/40">#{index + 1}</span>}
          <span className={pair.a.number === highlight ? "text-primary" : ""}>{pair.a.number}</span>
          <span className="mx-1.5 text-base-content/35">+</span>
          <span className={pair.b.number === highlight ? "text-primary" : ""}>{pair.b.number}</span>
        </p>
        <p className="text-right font-mono">
          <span className="text-xl font-bold tabular-nums">{fmt(pair.expected)}</span>
          <span className="block text-[10px] text-base-content/50">piso {fmt(pair.floor)}</span>
        </p>
      </div>
      {(pair.a.name || pair.b.name) && (
        <p className="mt-0.5 truncate text-xs text-base-content/50">{[pair.a.name, pair.b.name].filter(Boolean).join(" · ")}</p>
      )}
      {pair.reasons.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {pair.reasons.map((r) => (
            <li key={r} className={`badge badge-sm h-auto py-0.5 ${r.startsWith("Atenção") || r.startsWith("Perfis") || r.startsWith("Entregam") ? "badge-warning badge-outline" : "badge-ghost"}`}>
              {r}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function AlliancesTab({ stats, ours }: { stats: TeamStats[]; ours: string }) {
  const [forced, setForced] = useState<string>("");
  const ranked = useMemo(() => qualificationOrder(stats), [stats]);
  const eligible = ranked.filter((t) => !t.unavailable);
  const alliances = allianceCountFor(eligible.length);
  const usesOfficial = stats.some((t) => t.rank != null);
  const me = ranked.find((t) => t.number === ours);
  const myPosition = me ? eligible.indexOf(me) + 1 : 0;

  const sim = useMemo(
    () => simulateSelection(ranked, { alliances, forcedPicks: ours && forced ? { [ours]: forced } : undefined }),
    [ranked, alliances, ours, forced],
  );
  const myAlliance = sim.find((a) => a.captain.number === ours || a.pick?.number === ours);
  const iAmCaptain = sim.some((a) => a.captain.number === ours);
  const partners = useMemo(() => (me ? bestPartners(me, eligible).slice(0, 6) : []), [me, eligible]);
  const topPairs = useMemo(() => rankPairs(eligible, 8), [eligible]);
  const byeSeeds = alliances === 6 ? [1, 2] : [];

  if (eligible.length < 2) return <Empty text="Cadastre ao menos duas equipes com partidas registradas para comparar duplas." />;

  return (
    <div className="space-y-6">
      {/* situação */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className={`${card} p-5`}>
          <p className={`${kicker} text-base-content/50`}>PLAYOFFS</p>
          <p className="mt-2 font-mono text-4xl font-bold">{alliances || "—"}</p>
          <p className="text-sm text-base-content/60">alianças de 2 equipes para {eligible.length} equipes elegíveis</p>
          <p className="mt-3 text-xs leading-5 text-base-content/50">
            Dupla eliminação, sem equipe reserva. {usesOfficial ? "Capitães pelo ranking oficial informado." : "Sem ranking oficial: a ordem usa a nota do scouting."}
          </p>
        </div>
        <div className={`${card} p-5 md:col-span-2 ${me ? "border-primary/40" : ""}`}>
          <p className={`${kicker} text-primary`}>NOSSA SITUAÇÃO</p>
          {!ours ? (
            <p className="mt-3 text-sm text-base-content/60">Informe o número da sua equipe na aba Evento para ver as sugestões para vocês.</p>
          ) : !me ? (
            <p className="mt-3 text-sm text-base-content/60">A equipe {ours} ainda não tem registros ou está fora da lista.</p>
          ) : (
            <div className="mt-3 flex flex-wrap items-start gap-6">
              <div>
                <p className="font-mono text-4xl font-bold">{myPosition}º</p>
                <p className="text-xs text-base-content/55">{usesOfficial ? "no ranking" : "na estimativa"}</p>
              </div>
              <div className="min-w-0 flex-1">
                {iAmCaptain ? (
                  <p className="flex items-start gap-2 text-sm leading-6">
                    <Crown size={18} className="mt-0.5 shrink-0 text-warning" />
                    <span>
                      Vocês devem ser <b>capitães da aliança {myAlliance?.seed}</b>. Convidem o melhor parceiro ainda livre na hora — capitães acima de vocês
                      escolhem antes e podem levar a primeira opção.
                    </span>
                  </p>
                ) : myAlliance ? (
                  <p className="flex items-start gap-2 text-sm leading-6">
                    <Handshake size={18} className="mt-0.5 shrink-0 text-primary" />
                    <span>
                      Pela simulação, a <b>aliança {myAlliance.seed}</b> (capitã {myAlliance.captain.number}) deve convidar vocês. Converse com ela antes
                      da seleção e mostre o que completam no robô dela.
                    </span>
                  </p>
                ) : (
                  <p className="flex items-start gap-2 text-sm leading-6">
                    <AlertTriangle size={18} className="mt-0.5 shrink-0 text-warning" />
                    <span>
                      Pela simulação vocês ficam fora das {alliances} alianças. Procurem os capitães com os dados abaixo: mostrem em quais duplas vocês
                      somam mais.
                    </span>
                  </p>
                )}
                {iAmCaptain && partners.length > 0 && (
                  <label className="flex flex-col gap-1 mt-3 max-w-sm">
                    <span className="label-text text-xs">Simular com a nossa escolha</span>
                    <select value={forced} onChange={(e) => setForced(e.target.value)} className="select select-bordered select-sm">
                      <option value="">Melhor disponível (automático)</option>
                      {eligible
                        .filter((t) => t.number !== ours)
                        .map((t) => (
                          <option key={t.number} value={t.number}>
                            {t.number} {t.name && `· ${t.name}`}
                          </option>
                        ))}
                    </select>
                  </label>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* melhores parceiros para nós */}
      {me && partners.length > 0 && (
        <section>
          <h3 className="flex items-center gap-2 text-lg font-bold">
            <Users size={18} /> Melhores parceiros para a {me.number}
          </h3>
          <p className="mt-1 text-sm text-base-content/55">Pontos esperados da dupla nos playoffs, já descontando disputa pela mesma HIVE e faltas.</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((p, i) => (
              <PairCard key={p.b.number} pair={p} highlight={ours} index={i} />
            ))}
          </ul>
        </section>
      )}

      {/* simulação */}
      <section>
        <h3 className="flex items-center gap-2 text-lg font-bold">
          <Trophy size={18} /> Seleção simulada
        </h3>
        <p className="mt-1 text-sm text-base-content/55">
          O capitão da vez é a equipe mais bem colocada ainda livre; cada uma convida o parceiro com o qual soma mais.
        </p>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {sim.map((a) => {
            const isOurs = a.captain.number === ours || a.pick?.number === ours;
            return (
              <li key={a.seed} className={`${card} p-4 ${isOurs ? "border-primary shadow-[5px_5px_0_0_var(--color-primary)]" : ""}`}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-base-content/50">ALIANÇA {a.seed}</span>
                  {byeSeeds.includes(a.seed) && <span className="badge badge-ghost badge-xs">folga na 1ª rodada</span>}
                </div>
                <p className="mt-2 flex items-center gap-1.5 font-mono font-bold">
                  <Crown size={14} className="text-warning" /> {a.captain.number}
                </p>
                <p className="font-mono font-bold text-base-content/80">+ {a.pick?.number ?? "—"}</p>
                {a.pair && <p className="mt-2 font-mono text-sm text-base-content/60">{fmt(a.pair.expected)} pts esperados</p>}
              </li>
            );
          })}
        </ol>

        {firstRoundPairings(sim.length).length > 0 && (
          <div className={`${card} mt-4 p-4`}>
            <p className={`${kicker} text-base-content/50`}>1ª RODADA (CHAVE SUPERIOR)</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {firstRoundPairings(sim.length).map(({ red, blue }) => {
                const r = sim[red - 1];
                const b = sim[blue - 1];
                const chance = winChance(r?.pair, b?.pair);
                return (
                  <li key={`${red}-${blue}`} className="flex items-center gap-3 rounded-tl-lg rounded-br-lg bg-base-200/60 px-3 py-2 text-sm">
                    <Swords size={15} className="shrink-0 text-base-content/40" />
                    <span className="font-mono">
                      <b className="text-error">A{red}</b> × <b className="text-info">A{blue}</b>
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-info/40">
                      <div className="h-full bg-error" style={{ width: `${chance * 100}%` }} />
                    </div>
                    <span className="w-24 text-right font-mono text-xs">{pct(chance)} × {pct(1 - chance)}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>

      {/* melhores duplas do evento */}
      <section>
        <h3 className="flex items-center gap-2 text-lg font-bold">
          <Handshake size={18} /> Melhores duplas do evento
        </h3>
        <p className="mt-1 text-sm text-base-content/55">Todas as combinações possíveis entre as equipes disponíveis, das mais fortes para as mais fracas.</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {topPairs.map((p, i) => (
            <PairCard key={`${p.a.number}-${p.b.number}`} pair={p} highlight={ours} index={i} />
          ))}
        </ul>
      </section>

      <p className="text-xs leading-5 text-base-content/45">
        Sugestões baseadas só nos registros deste aparelho. Quanto mais partidas por equipe (ideal: todas da qualificação), mais confiável. Equipes
        podem recusar convites: marque como indisponível na aba Evento e a simulação refaz a seleção.
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------- dados */

function DataTab({ data, setData }: { data: ScoutingData; setData: (fn: (d: ScoutingData) => ScoutingData) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");
  const base = slug(data.event.eventName || "evento");

  const importFile = async (file: File) => {
    try {
      const parsed = parseScouting(JSON.parse(await file.text()));
      if (!parsed) throw new Error("formato");
      const ids = new Set(data.entries.map((x) => x.id));
      const added = parsed.entries.filter((x) => !ids.has(x.id)).length;
      setData((d) => mergeScouting(d, parsed));
      setMsg(`${added} registro(s) novo(s) importado(s) · ${parsed.entries.length - added} repetido(s) ignorado(s).`);
    } catch {
      setMsg("Não foi possível ler o arquivo. Use um JSON exportado por este scouting.");
    }
  };

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className={`${card} p-5`}>
        <p className={`${kicker} text-primary`}>JUNTAR O TRABALHO DOS SCOUTS</p>
        <p className="mt-2 text-sm leading-6 text-base-content/65">
          Cada scout anota no próprio celular. No fim do bloco de partidas, exporte o arquivo e mande para quem vai consolidar — ao importar, os
          registros se somam e repetidos são ignorados.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => downloadFile(`scouting-ftc-${base}.json`, JSON.stringify(data, null, 2))} className="btn btn-primary btn-sm">
            <Download size={15} /> Exportar JSON
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-sm">
            <Upload size={15} /> Importar e juntar
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void importFile(f);
              e.target.value = "";
            }}
          />
        </div>
        {msg && <p className="mt-3 text-sm text-base-content/70">{msg}</p>}
      </div>

      <div className={`${card} p-5`}>
        <p className={`${kicker} text-secondary`}>PLANILHA</p>
        <p className="mt-2 text-sm leading-6 text-base-content/65">Baixe todos os registros em CSV para abrir no Excel, Google Sheets ou LabTest.</p>
        <button type="button" onClick={() => downloadFile(`scouting-ftc-${base}.csv`, entriesToCsv(data.entries), "text/csv;charset=utf-8")} disabled={!data.entries.length} className="btn btn-secondary btn-sm mt-4">
          <Download size={15} /> Exportar CSV
        </button>

        <p className={`${kicker} mt-8 text-error`}>RECOMEÇAR</p>
        <p className="mt-2 text-sm leading-6 text-base-content/65">Apaga equipes e registros deste aparelho. Exporte antes se quiser guardar.</p>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Apagar todo o scouting deste aparelho?")) setData((d) => ({ ...emptyScouting(), event: { ...d.event, eventName: "", eventDate: "" } }));
          }}
          className="btn btn-outline btn-error btn-sm mt-4"
        >
          <Trash2 size={15} /> Apagar dados do evento
        </button>
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className={`${card} grid place-items-center px-6 py-16 text-center`}>
      <ClipboardList size={28} className="text-base-content/30" />
      <p className="mt-3 max-w-sm text-sm text-base-content/60">{text}</p>
    </div>
  );
}

/* ------------------------------------------------------------- principal */

export default function Scouting() {
  const [data, setDataState] = usePersistentState<ScoutingData>(STORAGE_KEYS.scouting, emptyScouting, parseScouting);
  const [tab, setTab] = useState<Tab>("evento");
  const setData = (fn: (d: ScoutingData) => ScoutingData) => setDataState(fn);
  const stats = useMemo(() => allTeamStats(data), [data]);
  const ours = data.event.teamNumber;

  return (
    <div>
      {/* cabeçalho do evento */}
      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-200/50 px-4 py-3 text-sm">
        <span className="font-mono font-bold">{ours ? `#${ours}` : "Sem equipe"}</span>
        {data.event.teamName && <span className="text-base-content/70">{data.event.teamName}</span>}
        <span className="text-base-content/30">·</span>
        <span className="text-base-content/70">{data.event.eventName || "Evento sem nome"}</span>
        {data.event.eventDate && (
          <span className="font-mono text-xs text-base-content/50">{new Date(`${data.event.eventDate}T12:00:00`).toLocaleDateString("pt-BR")}</span>
        )}
        <span className="ml-auto font-mono text-xs text-base-content/50">
          {data.teams.length} equipes · {data.entries.length} registros
        </span>
      </div>

      <div role="tablist" aria-label="Seções do scouting" className="sticky top-16 z-20 -mx-4 mb-6 flex gap-1 overflow-x-auto border-b border-base-300 bg-base-100/95 px-4 py-2 backdrop-blur sm:mx-0 sm:px-0">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-tl-lg rounded-br-lg px-3 py-2 text-sm font-bold transition-colors ${
              tab === key ? "bg-primary text-primary-content" : "text-base-content/60 hover:bg-base-200"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {tab === "evento" && <EventTab data={data} setData={setData} />}
      {tab === "registrar" && <RecordTab data={data} setData={setData} />}
      {tab === "equipes" && <TeamsTab stats={stats} data={data} ours={ours} />}
      {tab === "aliancas" && <AlliancesTab stats={stats.filter((t) => t.matches > 0)} ours={ours} />}
      {tab === "dados" && <DataTab data={data} setData={setData} />}
    </div>
  );
}
