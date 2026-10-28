"use client";

import {
  AlertTriangle,
  BookOpen,
  Bot,
  Star,
  Box,
  Circle,
  Eraser,
  Info,
  MousePointer2,
  Pencil,
  Spline,
  Square,
  Trash2,
  Type,
  User,
  X,
  XCircle,
} from "lucide-react";
import {
  ACTOR_DEFAULT_SIZE,
  ACTOR_KIND_LABEL,
  fmtClock,
  INK_COLORS,
  MARKING_LABEL,
  newActor,
  newResource,
  OBR,
  OBR_DOCS,
  showDuration,
  normAngle,
  segmentSpeed,
  type Issue,
} from "@/utils/quickbrick/StageMap/stage";
import type { Actor, ActorKind, Pose, StageDoc } from "@/utils/quickbrick/StageMap/types";
import { setPose, type StageSelection, type Tool, type ViewOptions } from "./StageCanvas";

/* ------------------------------------------------------------------ */
/*                           ferramentas                              */
/* ------------------------------------------------------------------ */

const TOOLS: { id: Tool; label: string; icon: React.ReactNode; hint: string }[] = [
  { id: "select", label: "Mover", icon: <MousePointer2 size={16} />, hint: "Clique para selecionar. Arraste atores, marcações e desenhos. A bolinha azul gira o ator." },
  { id: "tape", label: "Fita", icon: <Spline size={16} />, hint: "Clique ponto a ponto. Duplo clique ou Enter termina; Backspace desfaz o último ponto; Esc cancela." },
  { id: "rect", label: "Área", icon: <Square size={16} />, hint: "Arraste para marcar uma área retangular no chão." },
  { id: "circle", label: "Círculo", icon: <Circle size={16} />, hint: "Arraste do centro para fora." },
  { id: "cross", label: "Marca X", icon: <X size={16} />, hint: "Clique para marcar uma posição (spike mark)." },
  { id: "text", label: "Texto", icon: <Type size={16} />, hint: "Clique para inserir um texto; edite-o no painel ao lado." },
  { id: "pen", label: "Lápis", icon: <Pencil size={16} />, hint: "Desenho livre: arraste para rabiscar ideias sobre o palco." },
  { id: "eraser", label: "Borracha", icon: <Eraser size={16} />, hint: "Clique ou arraste sobre marcações e desenhos para apagá-los." },
];

interface ToolsProps {
  doc: StageDoc;
  commit: (d: StageDoc) => void;
  live: (d: StageDoc) => void;
  checkpoint: () => void;
  tool: Tool;
  setTool: (t: Tool) => void;
  ink: { color: string; width: number };
  setInk: (i: { color: string; width: number }) => void;
  view: ViewOptions;
  setView: (v: ViewOptions) => void;
}

export function ToolsPanel({ doc, commit, live, checkpoint, tool, setTool, ink, setInk, view, setView }: ToolsProps) {
  const current = TOOLS.find((t) => t.id === tool)!;
  const toggles: { key: keyof ViewOptions; label: string; hint: string }[] = [
    { key: "trajectories", label: "Trajetórias", hint: "Caminho de cada ator na cena, com o número de cada quadro" },
    { key: "onion", label: "Papel-cebola", hint: "Mostra o quadro anterior (tracejado) e o seguinte (pontilhado)" },
    { key: "grid", label: "Quadrícula 30 cm", hint: "Mesma medida dos ladrilhos da pista" },
    { key: "snap", label: "Ímã de 5 cm", hint: "Alinha posições a cada 5 cm (segure Alt para desligar)" },
  ];
  return (
    <aside className="card card-border h-fit bg-base-100">
      <div className="card-body gap-3 p-4">
        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-60">Ferramenta</div>
          <div className="grid grid-cols-4 gap-1.5">
            {TOOLS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTool(t.id)}
                title={t.label}
                className={`flex flex-col items-center gap-0.5 rounded-box border-2 p-1.5 text-[10px] transition ${
                  tool === t.id ? "border-primary bg-primary/10" : "border-base-300 hover:border-primary/50"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-snug opacity-70">{current.hint}</p>
        </div>

        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-60">Cor e espessura</div>
          <div className="flex flex-wrap items-center gap-1.5">
            {INK_COLORS.map((c) => (
              <button
                key={c}
                aria-label={`Cor ${c}`}
                onClick={() => setInk({ ...ink, color: c })}
                className={`size-6 rounded-full border-2 ${ink.color === c ? "border-primary ring-2 ring-primary/30" : "border-base-300"}`}
                style={{ background: c }}
              />
            ))}
            <input
              type="color"
              aria-label="Outra cor"
              className="size-6 cursor-pointer rounded-full"
              value={ink.color}
              onChange={(e) => setInk({ ...ink, color: e.target.value })}
            />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="range"
              min={0.5}
              max={10}
              step={0.5}
              value={ink.width}
              className="range range-xs flex-1"
              onChange={(e) => setInk({ ...ink, width: Number(e.target.value) })}
              aria-label="Espessura"
            />
            <span className="w-12 text-right text-xs tabular-nums">{ink.width} cm</span>
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-60">Exibir</div>
          <ul className="flex flex-col gap-1">
            {toggles.map((tg) => (
              <li key={tg.key}>
                <label className="flex cursor-pointer items-center gap-2 text-sm" title={tg.hint}>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm checkbox-primary"
                    checked={view[tg.key]}
                    onChange={() => setView({ ...view, [tg.key]: !view[tg.key] })}
                  />
                  {tg.label}
                </label>
              </li>
            ))}
            <li>
              <label className="flex cursor-pointer items-center gap-2 text-sm" title="Pista criada na aba “Seguidor de linha”">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm checkbox-primary"
                  checked={doc.trackVisible}
                  onChange={() => commit({ ...doc, trackVisible: !doc.trackVisible })}
                />
                Pista de seguidor de linha
              </label>
            </li>
          </ul>
        </div>

        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-60">Palco</div>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["width", "Largura (cm)"],
                ["depth", "Profundidade (cm)"],
              ] as const
            ).map(([k, label]) => (
              <label key={k} className="floating-label">
                <span>{label}</span>
                <input
                  type="number"
                  min={60}
                  max={2000}
                  step={10}
                  className="input input-sm"
                  value={doc.stage[k]}
                  onFocus={checkpoint}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (Number.isFinite(v) && v >= 60 && v <= 2000) live({ ...doc, stage: { ...doc.stage, [k]: v } });
                  }}
                />
              </label>
            ))}
          </div>
          <label className="floating-label mt-3">
            <span>Folga mínima entre atores (cm)</span>
            <input
              type="number"
              min={0}
              max={200}
              className="input input-sm w-full"
              value={doc.safety}
              onFocus={checkpoint}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (Number.isFinite(v) && v >= 0 && v <= 200) live({ ...doc, safety: v });
              }}
            />
          </label>
          {(doc.stage.width !== OBR.stage || doc.stage.depth !== OBR.stage) && (
            <button
              className="btn btn-xs btn-outline btn-primary mt-2 w-full"
              onClick={() => commit({ ...doc, stage: { width: OBR.stage, depth: OBR.stage } })}
            >
              Voltar ao padrão OBR (2,70 × 2,70 m)
            </button>
          )}
          <p className="mt-1 text-[11px] opacity-60">
            Palco oficial: 2,70 × 2,70 m, branco fosco, com fita preta de 5 cm no contorno. A tela de projeção fica ao fundo; a
            frente (jurados e plateia), embaixo.
          </p>
        </div>

        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-60">Janela de 7 min no palco</div>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["setupTime", "Montagem (s)"],
                ["teardownTime", "Desmontar e limpar (s)"],
              ] as const
            ).map(([k, label]) => (
              <label key={k} className="floating-label">
                <span>{label}</span>
                <input
                  type="number"
                  min={0}
                  max={600}
                  step={5}
                  className="input input-sm"
                  value={doc[k]}
                  onFocus={checkpoint}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (Number.isFinite(v) && v >= 0 && v <= 600) live({ ...doc, [k]: v });
                  }}
                />
              </label>
            ))}
          </div>
          {(() => {
            const used = doc.setupTime + showDuration(doc) + doc.teardownTime;
            const over = used > OBR.slot;
            return (
              <>
                <progress
                  className={`progress mt-2 w-full ${over ? "progress-error" : "progress-success"}`}
                  value={Math.min(used, OBR.slot)}
                  max={OBR.slot}
                />
                <p className={`text-[11px] ${over ? "text-error" : "opacity-60"}`}>
                  {fmtClock(used)} de {fmtClock(OBR.slot)} — o cronômetro só para com o palco limpo.
                </p>
              </>
            );
          })()}
        </div>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/*                          inspetor / elenco                         */
/* ------------------------------------------------------------------ */

const KIND_ICON: Record<ActorKind, React.ReactNode> = {
  robot: <Bot size={14} />,
  human: <User size={14} />,
  prop: <Box size={14} />,
};

interface SideProps {
  doc: StageDoc;
  commit: (d: StageDoc) => void;
  live: (d: StageDoc) => void;
  checkpoint: () => void;
  sceneIdx: number;
  frameIdx: number | null;
  selection: StageSelection;
  setSelection: (s: StageSelection) => void;
  issues: Issue[];
  goTo: (sceneIdx: number, t: number) => void;
}

export function SidePanel(props: SideProps) {
  const { doc, commit, live, checkpoint, sceneIdx, frameIdx, selection, setSelection, issues, goTo } = props;
  const scene = doc.scenes[sceneIdx];
  const frame = frameIdx !== null ? scene.frames[frameIdx] : null;

  function addActor(kind: ActorKind) {
    const a = newActor(kind, doc.actors.length);
    const count = doc.actors.length;
    const pose: Pose = {
      x: Math.round(doc.stage.width / 2 + ((count % 5) - 2) * 40),
      y: Math.round(doc.stage.depth / 2 + (Math.floor(count / 5) % 3) * 40 - 40),
      angle: 0,
    };
    // entra parado em todos os quadros da cena atual
    commit({
      ...doc,
      actors: [...doc.actors, a],
      scenes: doc.scenes.map((s, i) =>
        i !== sceneIdx ? s : { ...s, frames: s.frames.map((f) => ({ ...f, poses: { ...f.poses, [a.id]: { ...pose } } })) },
      ),
    });
    setSelection({ type: "actor", id: a.id });
  }

  return (
    <div className="flex flex-col gap-4">
      <Inspector {...props} frame={frame} />

      {/* elenco */}
      <div className="card card-border bg-base-100">
        <div className="card-body gap-2 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">Elenco</h3>
            <span className="badge badge-ghost badge-sm">{doc.actors.length}</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {(["robot", "human", "prop"] as ActorKind[]).map((k) => (
              <button key={k} className="btn btn-xs" onClick={() => addActor(k)}>
                {KIND_ICON[k]} + {ACTOR_KIND_LABEL[k]}
              </button>
            ))}
          </div>
          {doc.actors.length === 0 ? (
            <p className="text-xs opacity-60">Adicione robôs, atores e objetos de cena. Eles entram parados em todos os quadros da cena atual.</p>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {doc.actors.map((a) => {
                const on = !!frame?.poses[a.id];
                const sel = selection?.type === "actor" && selection.id === a.id;
                return (
                  <li key={a.id}>
                    <button
                      onClick={() => setSelection({ type: "actor", id: a.id })}
                      className={`flex w-full items-center gap-2 rounded-field px-2 py-1 text-left text-sm ${sel ? "bg-primary/10" : "hover:bg-base-200"}`}
                    >
                      <span className="size-3 shrink-0 rounded-full" style={{ background: a.color }} />
                      <span className="opacity-60">{KIND_ICON[a.kind]}</span>
                      <span className="flex-1 truncate">{a.name}</span>
                      <span className={`text-[10px] ${on ? "text-success" : "opacity-40"}`}>{on ? "em cena" : "fora"}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <ResourcesPanel doc={doc} commit={commit} live={live} checkpoint={checkpoint} />

      {/* verificação */}
      <IssuesPanel doc={doc} issues={issues} goTo={goTo} setSelection={setSelection} />

      <RulesCard />

      {/* notas da cena */}
      <div className="card card-border bg-base-100">
        <div className="card-body gap-2 p-4">
          <h3 className="text-sm font-bold">Roteiro da cena</h3>
          <textarea
            className="textarea textarea-sm h-20 w-full"
            placeholder="Falas, deixas, música, luz…"
            value={scene.notes}
            onFocus={checkpoint}
            onChange={(e) => live({ ...doc, scenes: doc.scenes.map((s, i) => (i === sceneIdx ? { ...s, notes: e.target.value } : s)) })}
          />
        </div>
      </div>
    </div>
  );
}

function Inspector({
  doc,
  commit,
  live,
  checkpoint,
  sceneIdx,
  frameIdx,
  selection,
  setSelection,
  frame,
}: SideProps & { frame: StageDoc["scenes"][number]["frames"][number] | null }) {
  const scene = doc.scenes[sceneIdx];
  if (!selection) {
    return (
      <div className="card card-border bg-base-100">
        <div className="card-body p-4">
          <h3 className="text-sm font-bold">Propriedades</h3>
          <p className="text-xs opacity-60">
            Selecione um ator, uma marcação ou um desenho no palco. Atalhos: <kbd className="kbd kbd-xs">Del</kbd> apaga,
            setas movem (Shift = 10 cm), <kbd className="kbd kbd-xs">Q</kbd>/<kbd className="kbd kbd-xs">E</kbd> giram,{" "}
            <kbd className="kbd kbd-xs">espaço</kbd> toca, <kbd className="kbd kbd-xs">,</kbd>/<kbd className="kbd kbd-xs">.</kbd> trocam de quadro.
          </p>
        </div>
      </div>
    );
  }

  if (selection.type === "actor") {
    const a = doc.actors.find((x) => x.id === selection.id);
    if (!a) return null;
    const pose = frame?.poses[a.id];
    const patchActor = (p: Partial<Actor>, mode: "live" | "commit" = "live") => {
      const next = { ...doc, actors: doc.actors.map((x) => (x.id === a.id ? { ...x, ...p } : x)) };
      if (mode === "commit") commit(next);
      else live(next);
    };
    const patchPose = (p: Partial<Pose>) => {
      if (frameIdx === null || !pose) return;
      live(setPose(doc, sceneIdx, frameIdx, a.id, { ...pose, ...p }));
    };
    const placeHere = () => {
      if (frameIdx === null) return;
      let src: Pose | undefined;
      for (let i = frameIdx - 1; i >= 0 && !src; i--) src = scene.frames[i].poses[a.id];
      for (let i = frameIdx + 1; i < scene.frames.length && !src; i++) src = scene.frames[i].poses[a.id];
      commit(setPose(doc, sceneIdx, frameIdx, a.id, src ? { ...src } : { x: doc.stage.width / 2, y: doc.stage.depth / 2, angle: 0 }));
    };
    const removeActor = () => {
      if (!window.confirm(`Excluir “${a.name}” de toda a apresentação?`)) return;
      commit({
        ...doc,
        actors: doc.actors.filter((x) => x.id !== a.id),
        scenes: doc.scenes.map((s) => ({
          ...s,
          frames: s.frames.map((f) => {
            const poses = { ...f.poses };
            delete poses[a.id];
            return { ...f, poses };
          }),
        })),
      });
      setSelection(null);
    };
    const speed = frameIdx !== null ? segmentSpeed(scene, a.id, frameIdx) : null;

    return (
      <div className="card card-border bg-base-100">
        <div className="card-body gap-3 p-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-bold">
              {KIND_ICON[a.kind]} {ACTOR_KIND_LABEL[a.kind]}
            </h3>
            <button className="btn btn-ghost btn-xs btn-square" onClick={() => setSelection(null)} aria-label="Fechar">
              <X size={14} />
            </button>
          </div>
          <div className="flex gap-2">
            <label className="floating-label flex-1">
              <span>Nome</span>
              <input className="input input-sm w-full" value={a.name} onFocus={checkpoint} onChange={(e) => patchActor({ name: e.target.value })} />
            </label>
            <input
              type="color"
              aria-label="Cor"
              className="h-8 w-10 cursor-pointer rounded-field"
              value={a.color}
              onFocus={checkpoint}
              onChange={(e) => patchActor({ color: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="select select-sm flex-1"
              aria-label="Tipo"
              value={a.kind}
              onChange={(e) => {
                const kind = e.target.value as ActorKind;
                patchActor({ kind, size: ACTOR_DEFAULT_SIZE[kind] }, "commit");
              }}
            >
              {(["robot", "human", "prop"] as ActorKind[]).map((k) => (
                <option key={k} value={k}>
                  {ACTOR_KIND_LABEL[k]}
                </option>
              ))}
            </select>
            <label className="floating-label w-28">
              <span>{a.kind === "robot" ? "Lado (cm)" : "Diâmetro (cm)"}</span>
              <input
                type="number"
                min={5}
                max={300}
                className="input input-sm w-full"
                value={a.size}
                onFocus={checkpoint}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (Number.isFinite(v) && v >= 5 && v <= 300) patchActor({ size: v });
                }}
              />
            </label>
          </div>

          <div className="divider my-0 text-[11px] opacity-60">
            {frameIdx !== null ? `Quadro ${frameIdx + 1} de “${scene.name}”` : "Entre quadros"}
          </div>

          {frameIdx === null ? (
            <p className="text-xs opacity-60">Pare num quadro para editar a posição.</p>
          ) : pose ? (
            <>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    ["x", "X (cm)"],
                    ["y", "Y (cm)"],
                    ["angle", "Giro (°)"],
                  ] as const
                ).map(([k, label]) => (
                  <label key={k} className="floating-label">
                    <span>{label}</span>
                    <input
                      type="number"
                      step={k === "angle" ? 15 : 1}
                      className="input input-sm w-full"
                      value={Math.round(pose[k] * 10) / 10}
                      onFocus={checkpoint}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (Number.isFinite(v)) patchPose({ [k]: k === "angle" ? normAngle(v) : v });
                      }}
                    />
                  </label>
                ))}
              </div>
              <p className="text-[11px] opacity-60">
                Giro 0° = de frente para a plateia.
                {speed !== null && (
                  <>
                    {" "}
                    Até o próximo quadro: <b>{speed.toFixed(0)} cm/s</b>.
                  </>
                )}
              </p>
              <button className="btn btn-xs btn-ghost" onClick={() => commit(setPose(doc, sceneIdx, frameIdx, a.id, null))}>
                Tirar de cena neste quadro
              </button>
            </>
          ) : (
            <button className="btn btn-sm btn-primary" onClick={placeHere}>
              Colocar em cena neste quadro
            </button>
          )}

          <button className="btn btn-xs btn-ghost text-error" onClick={removeActor}>
            <Trash2 size={12} /> Excluir do elenco
          </button>
        </div>
      </div>
    );
  }

  if (selection.type === "marking") {
    const m = doc.markings.find((x) => x.id === selection.id);
    if (!m) return null;
    const patch = (p: Partial<typeof m>) => live({ ...doc, markings: doc.markings.map((x) => (x.id === m.id ? { ...x, ...p } : x)) });
    return (
      <div className="card card-border bg-base-100">
        <div className="card-body gap-3 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">Marcação · {MARKING_LABEL[m.kind]}</h3>
            <button className="btn btn-ghost btn-xs btn-square" onClick={() => setSelection(null)} aria-label="Fechar">
              <X size={14} />
            </button>
          </div>
          <div className="flex gap-2">
            <label className="floating-label flex-1">
              <span>{m.kind === "text" ? "Texto" : "Rótulo"}</span>
              <input className="input input-sm w-full" value={m.label} onFocus={checkpoint} onChange={(e) => patch({ label: e.target.value })} />
            </label>
            <input
              type="color"
              aria-label="Cor"
              className="h-8 w-10 cursor-pointer rounded-field"
              value={m.color}
              onFocus={checkpoint}
              onChange={(e) => patch({ color: e.target.value })}
            />
          </div>
          <label className="flex items-center gap-2 text-xs">
            {m.kind === "text" ? "Tamanho" : "Espessura"}
            <input
              type="range"
              min={m.kind === "text" ? 4 : 0.5}
              max={m.kind === "text" ? 40 : 10}
              step={0.5}
              value={m.width}
              className="range range-xs flex-1"
              onPointerDown={checkpoint}
              onChange={(e) => patch({ width: Number(e.target.value) })}
            />
            <span className="w-12 text-right tabular-nums">{m.width} cm</span>
          </label>
          {m.kind === "rect" && (
            <p className="text-[11px] opacity-60">
              {Math.abs(m.points[0].x - m.points[1].x).toFixed(0)} × {Math.abs(m.points[0].y - m.points[1].y).toFixed(0)} cm
            </p>
          )}
          {m.kind === "circle" && (
            <p className="text-[11px] opacity-60">
              Raio {Math.hypot(m.points[0].x - m.points[1].x, m.points[0].y - m.points[1].y).toFixed(0)} cm
            </p>
          )}
          <button
            className="btn btn-xs btn-ghost text-error"
            onClick={() => {
              commit({ ...doc, markings: doc.markings.filter((x) => x.id !== m.id) });
              setSelection(null);
            }}
          >
            <Trash2 size={12} /> Apagar marcação
          </button>
        </div>
      </div>
    );
  }

  const d = doc.drawings.find((x) => x.id === selection.id);
  if (!d) return null;
  const patch = (p: Partial<typeof d>) => live({ ...doc, drawings: doc.drawings.map((x) => (x.id === d.id ? { ...x, ...p } : x)) });
  return (
    <div className="card card-border bg-base-100">
      <div className="card-body gap-3 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold">Desenho livre</h3>
          <button className="btn btn-ghost btn-xs btn-square" onClick={() => setSelection(null)} aria-label="Fechar">
            <X size={14} />
          </button>
        </div>
        <label className="flex items-center gap-2 text-xs">
          Cor
          <input type="color" className="h-7 w-10 cursor-pointer rounded-field" value={d.color} onFocus={checkpoint} onChange={(e) => patch({ color: e.target.value })} />
          Espessura
          <input
            type="range"
            min={0.5}
            max={10}
            step={0.5}
            value={d.width}
            className="range range-xs flex-1"
            onPointerDown={checkpoint}
            onChange={(e) => patch({ width: Number(e.target.value) })}
          />
        </label>
        <button
          className="btn btn-xs btn-ghost text-error"
          onClick={() => {
            commit({ ...doc, drawings: doc.drawings.filter((x) => x.id !== d.id) });
            setSelection(null);
          }}
        >
          <Trash2 size={12} /> Apagar desenho
        </button>
      </div>
    </div>
  );
}

function IssuesPanel({
  doc,
  issues,
  goTo,
  setSelection,
}: {
  doc: StageDoc;
  issues: Issue[];
  goTo: (sceneIdx: number, t: number) => void;
  setSelection: (s: StageSelection) => void;
}) {
  const errors = issues.filter((i) => i.level === "error").length;
  const warns = issues.filter((i) => i.level === "warn").length;
  const icon = {
    error: <XCircle size={14} className="mt-0.5 shrink-0 text-error" />,
    warn: <AlertTriangle size={14} className="mt-0.5 shrink-0 text-warning" />,
    info: <Info size={14} className="mt-0.5 shrink-0 text-info" />,
  };
  return (
    <div className="card card-border bg-base-100">
      <div className="card-body gap-2 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold">Verificação</h3>
          <div className="flex gap-1">
            {errors > 0 && <span className="badge badge-error badge-sm">{errors} erro{errors > 1 ? "s" : ""}</span>}
            {warns > 0 && <span className="badge badge-warning badge-sm">{warns} alerta{warns > 1 ? "s" : ""}</span>}
          </div>
        </div>
        {doc.actors.length < 1 ? (
          <p className="text-xs opacity-60">Adicione atores para verificar colisões.</p>
        ) : errors + warns === 0 ? (
          <p className="text-xs text-success">Sem colisões nem alertas de regras. 👏</p>
        ) : null}
        <ul className="flex max-h-72 flex-col gap-1 overflow-auto">
          {issues.map((i) => {
            const si = doc.scenes.findIndex((s) => s.id === i.sceneId);
            return (
              <li key={i.id}>
                <button
                  className="flex w-full gap-2 rounded-field px-1.5 py-1 text-left hover:bg-base-200"
                  onClick={() => {
                    if (si >= 0) goTo(si, Math.round(i.t));
                    if (i.actors[0]) setSelection({ type: "actor", id: i.actors[0] });
                  }}
                >
                  {icon[i.level]}
                  <span className="flex flex-col">
                    <span className="text-xs font-semibold">{i.title}</span>
                    <span className="text-[11px] opacity-70">{i.detail}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*                       recursos e regras rápidas                    */
/* ------------------------------------------------------------------ */

function ResourcesPanel({
  doc,
  commit,
  live,
  checkpoint,
}: {
  doc: StageDoc;
  commit: (d: StageDoc) => void;
  live: (d: StageDoc) => void;
  checkpoint: () => void;
}) {
  const robots = doc.actors.filter((a) => a.kind === "robot");
  const shownIn = (id: string) => {
    const out: string[] = [];
    doc.scenes.forEach((s, si) =>
      s.frames.forEach((f, fi) => {
        if (f.resources.includes(id)) out.push(`${si + 1}.${fi + 1}`);
      }),
    );
    return out;
  };
  const patch = (id: string, p: Partial<StageDoc["resources"][number]>, mode: "live" | "commit" = "live") => {
    const next = { ...doc, resources: doc.resources.map((r) => (r.id === id ? { ...r, ...p } : r)) };
    if (mode === "commit") commit(next);
    else live(next);
  };
  const remove = (id: string) =>
    commit({
      ...doc,
      resources: doc.resources.filter((r) => r.id !== id),
      scenes: doc.scenes.map((s) => ({ ...s, frames: s.frames.map((f) => ({ ...f, resources: f.resources.filter((x) => x !== id) })) })),
    });

  return (
    <div className="card card-border bg-base-100">
      <div className="card-body gap-2 p-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-sm font-bold">
            <Star size={14} className="text-accent" /> Recursos avaliados
          </h3>
          <span className="badge badge-ghost badge-sm">
            {doc.resources.length}/{OBR.resources} · 10 pts cada
          </span>
        </div>
        <p className="text-[11px] opacity-60">
          Cada recurso deve ser uma <b>ação visível do robô</b> (não só um sensor). Marque nos quadros, pela linha do tempo, quando ele
          aparece.
        </p>
        <ul className="flex flex-col gap-2">
          {doc.resources.map((r, i) => {
            const where = shownIn(r.id);
            return (
              <li key={r.id} className="flex flex-col gap-1 rounded-field bg-base-200/60 p-2">
                <div className="flex items-center gap-1">
                  <span className="w-4 text-xs font-bold opacity-50">{i + 1}</span>
                  <input
                    className="input input-xs flex-1"
                    value={r.name}
                    placeholder="Ex.: seguir a linha, reagir ao som…"
                    onFocus={checkpoint}
                    onChange={(e) => patch(r.id, { name: e.target.value })}
                    aria-label={`Recurso ${i + 1}`}
                  />
                  <button className="btn btn-ghost btn-xs btn-square text-error" onClick={() => remove(r.id)} aria-label="Remover recurso">
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="flex items-center gap-1 pl-5">
                  <select
                    className="select select-xs flex-1"
                    value={r.actorId ?? ""}
                    onChange={(e) => patch(r.id, { actorId: e.target.value || null }, "commit")}
                    aria-label="Robô que demonstra"
                  >
                    <option value="">Robô: —</option>
                    {robots.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                  <span className={`text-[10px] ${where.length ? "text-success" : "text-warning"}`} title="cena.quadro">
                    {where.length ? `quadros ${where.slice(0, 4).join(", ")}${where.length > 4 ? "…" : ""}` : "não demonstrado"}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
        {doc.resources.length < OBR.resources && (
          <button className="btn btn-xs" onClick={() => commit({ ...doc, resources: [...doc.resources, newResource()] })}>
            + Recurso
          </button>
        )}
      </div>
    </div>
  );
}

function RulesCard() {
  return (
    <div className="card card-border bg-base-100">
      <div className="card-body gap-2 p-4">
        <h3 className="flex items-center gap-1.5 text-sm font-bold">
          <BookOpen size={14} /> Regras rápidas · OBR Artística 2026
        </h3>
        <ul className="list-disc space-y-0.5 pl-4 text-[11px] leading-snug opacity-80">
          <li>Palco de 2,70 × 2,70 m; robôs que começam fora dele não são avaliados.</li>
          <li>Apresentação de 1:30 a 5:00, incluindo recomeços; abaixo de 1:30 vale zero.</li>
          <li>7 min no palco para montar, apresentar, desmontar e limpar.</li>
          <li>−3 pts por intervenção não planejada, por recomeço e a cada 10 s de atraso.</li>
          <li>Robôs autônomos: nada de controle remoto nem Wi-Fi externo.</li>
          <li>Ao menos um integrante em cena com os robôs, sem tapar a visão nem ficar de costas.</li>
          <li>Proibido: drones, líquidos, fogo, fumaça e qualquer risco ao palco.</li>
          <li>Palco: 30 visual · 30 interação e integração · 40 recursos (4 × 10). Nota final = 0,4 entrevista + 0,6 palco.</li>
        </ul>
        <div className="flex flex-col gap-0.5">
          {OBR_DOCS.map((d) => (
            <a key={d.url} href={d.url} target="_blank" rel="noreferrer" className="link link-primary text-[11px]">
              {d.label} ↗
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
