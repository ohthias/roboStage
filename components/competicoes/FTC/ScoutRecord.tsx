"use client";

import { useState } from "react";
import { AlertTriangle, Check, Minus, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";

import { entryFoulPoints, entryPoints, newEntry, type ScoutEntry, type ScoutingData } from "@/utils/competitions/ftc/scouting";
import { FtcScoutBadge } from "./FtcScoutPanel";

/**
 * Aba "Anotar": o que a FTCScout não mede (TIPs por robô, quebras, defesa,
 * faltas, observações). Com a agenda importada, o scout só toca na partida e
 * no robô que vai acompanhar.
 */

const card = "rounded-2xl border border-base-300 bg-base-100";
const kicker = "text-xs font-semibold uppercase tracking-wider";

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

function useScoutEntry(data: ScoutingData, setData: (fn: (d: ScoutingData) => ScoutingData) => void) {
  const [form, setForm] = useState<ScoutEntry>(() => newEntry({ scout: data.event.scout }));
  const [editing, setEditing] = useState<string | null>(null);
  const [flash, setFlash] = useState("");

  const set = (patch: Partial<ScoutEntry>) => setForm((f) => ({ ...f, ...patch }));
  const clear = () => {
    setEditing(null);
    setForm(newEntry({ match: form.match, alliance: form.alliance, scout: data.event.scout }));
  };
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
    setForm(newEntry({ match: entry.match, alliance: entry.alliance, scout: entry.scout }));
  };

  return { form, set, editing, setEditing, setForm, flash, save, clear };
}

function OfficialSchedule({ data, form, onPick }: { data: ScoutingData; form: ScoutEntry; onPick: (patch: Partial<ScoutEntry>) => void }) {
  const schedule = (data.official?.matches ?? []).filter((m) => m.level === "Q");
  const current = schedule.find((m) => m.number === form.match);

  if (schedule.length === 0) return null;

  return (
    <div className="mt-4 rounded-tl-xl rounded-br-xl border border-base-300 p-3">
      <p className="flex items-center gap-2 text-xs text-base-content/60">
        Agenda oficial <FtcScoutBadge />
        <span className="ml-auto">toque na partida e no robô que você vai anotar</span>
      </p>
      <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
        {schedule.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onPick({ match: m.number })}
            className={`btn btn-xs shrink-0 font-mono ${form.match === m.number ? "btn-neutral" : m.played ? "btn-ghost text-base-content/40" : "btn-ghost"}`}
          >
            {m.label}
          </button>
        ))}
      </div>
      {current && (
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(["red", "blue"] as const).flatMap((color) =>
            current[color].teams.map((n) => {
              const done = data.entries.some((x) => x.match === current.number && x.team === n);
              const active = form.team === n;
              return (
                <button
                  key={color + n}
                  type="button"
                  onClick={() => onPick({ team: n, alliance: color })}
                  className={`btn btn-sm font-mono ${active ? (color === "red" ? "btn-error" : "btn-info") : color === "red" ? "border-error/40 text-error" : "border-info/40 text-info"}`}
                >
                  {done && <Check size={13} />}
                  {n}
                </button>
              );
            }),
          )}
        </div>
      )}
    </div>
  );
}

function RecentRecords({ data, editing, onEdit, onDelete }: { data: ScoutingData; editing: string | null; onEdit: (entry: ScoutEntry) => void; onDelete: (id: string) => void }) {
  const recent = [...data.entries].sort((a, b) => b.createdAt - a.createdAt).slice(0, 12);

  return (
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
              <button type="button" onClick={() => onEdit(e)} className="btn btn-ghost btn-square btn-xs" aria-label={`Editar partida ${e.match} equipe ${e.team}`}>
                <Pencil size={13} />
              </button>
              <button type="button" onClick={() => onDelete(e.id)} className="btn btn-ghost btn-square btn-xs text-base-content/40 hover:text-error" aria-label={`Excluir partida ${e.match} equipe ${e.team}`}>
                <Trash2 size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ScoutRecord({ data, setData }: { data: ScoutingData; setData: (fn: (d: ScoutingData) => ScoutingData) => void }) {
  const { form, set, editing, setEditing, setForm, flash, save, clear } = useScoutEntry(data, setData);
  const points = entryPoints(form);
  const teams = [...data.teams].sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
  const duplicate = !editing && data.entries.some((e) => e.match === form.match && e.team === form.team);

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

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-[180px_1fr_1fr]">
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
        <OfficialSchedule data={data} form={form} onPick={set} />
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
            onClick={clear}
            className="btn btn-ghost"
          >
            <RotateCcw size={16} /> Limpar
          </button>
        </div>
        {flash && <p className="mt-3 rounded-tl-lg rounded-br-lg bg-success/15 px-3 py-2 text-sm text-success">{flash}</p>}
      </div>

      <RecentRecords
        data={data}
        editing={editing}
        onEdit={(entry) => {
          setEditing(entry.id);
          setForm(entry);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onDelete={(id) => setData((d) => ({ ...d, entries: d.entries.filter((x) => x.id !== id) }))}
      />
    </div>
  );
}

