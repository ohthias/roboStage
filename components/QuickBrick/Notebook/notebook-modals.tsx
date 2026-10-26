"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeftRight, ImagePlus } from "lucide-react";
import { Modal } from "@/components/stagebook/modal";
import { formatBytes } from "@/utils/format-bytes";
import {
  confirmPhotoUpload,
  createDiagram,
  requestPhotoUpload,
} from "@/app/(protected)/dashboard/quickbrick/actions";
import {
  DIAGRAM_KINDS,
  DIAGRAM_META,
  NOTEBOOK_SEASONS,
  type DiagramKind,
  type NotebookPhotoDTO,
} from "@/utils/quickbrick/notebook";
import { DiagramIcon } from "./diagram-icon";
import { fmtDelta, fmtFull, putToSignedUrl, toLocalInput } from "./upload";

// ---------------------------------------------------------------------------
// Nova versão (foto + data/hora + observações)
// ---------------------------------------------------------------------------

export function PhotoUploadModal({
  notebookId,
  file,
  versionNumber,
  onClose,
  onUploaded,
}: {
  notebookId: string;
  file: File | null;
  versionNumber: number;
  onClose: () => void;
  onUploaded: (photo: NotebookPhotoDTO) => void;
}) {
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  // O pai monta o modal com `key` por arquivo, então o estado nasce limpo.
  // A data sugerida é a de modificação do arquivo (normalmente a da foto).
  const [title, setTitle] = useState(`Versão ${versionNumber}`);
  const [notes, setNotes] = useState("");
  const [takenAt, setTakenAt] = useState(() => toLocalInput(new Date(file?.lastModified || Date.now())));
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const busy = progress !== null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setError(null);
    setProgress(0);
    try {
      const req = await requestPhotoUpload(notebookId, { fileName: file.name, contentType: file.type, size: file.size });
      if (!req.ok) throw new Error(req.error);
      await putToSignedUrl(req.data.uploadUrl, file, setProgress);
      const done = await confirmPhotoUpload(notebookId, {
        key: req.data.key,
        fileName: file.name,
        contentType: file.type,
        title,
        notes,
        takenAt: new Date(takenAt).toISOString(),
      });
      if (!done.ok) throw new Error(done.error);
      onUploaded(done.data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao enviar a foto.");
      setProgress(null);
    }
  };

  return (
    <Modal
      open={Boolean(file)}
      onClose={busy ? () => {} : onClose}
      title="Nova versão do robô"
      description="A foto fica salva com data e hora. Anote o que mudou desde a versão anterior."
      size="lg"
    >
      <form onSubmit={submit} className="grid gap-5 sm:grid-cols-[200px_1fr]">
        <figure className="qb-polaroid relative self-start">
          <span className="qb-tape" aria-hidden />
          {preview && (
            <Image
              src={preview}
              alt="Pré-visualização"
              width={200}
              height={200}
              unoptimized
              className="aspect-square w-full rounded object-cover"
            />
          )}
          <figcaption className="qb-hand mt-1 truncate text-center text-base text-base-content/60">
            {file ? formatBytes(file.size) : ""}
          </figcaption>
        </figure>

        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Nome da versão</span>
            <input
              className="input input-bordered w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
              disabled={busy}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Data e hora</span>
            <input
              type="datetime-local"
              className="input input-bordered w-full"
              value={takenAt}
              onChange={(e) => setTakenAt(e.target.value)}
              required
              disabled={busy}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Mudanças nesta versão</span>
            <textarea
              className="textarea textarea-bordered qb-ruled min-h-28 w-full"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={4000}
              placeholder="Ex.: troquei a garra por um anexo passivo, motor C mais baixo…"
              disabled={busy}
            />
          </label>

          {progress !== null && (
            <progress className="progress progress-primary w-full" value={Math.round(progress * 100)} max={100} />
          )}
          {error && <p className="text-sm text-error">{error}</p>}

          <div className="modal-action mt-2">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={busy}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={busy || !takenAt}>
              {busy ? <span className="loading loading-spinner loading-xs" /> : <ImagePlus className="size-4" />}
              Salvar versão
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Novo diagrama
// ---------------------------------------------------------------------------

export function NewDiagramModal({
  open,
  notebookId,
  defaultSeason,
  onClose,
}: {
  open: boolean;
  notebookId: string;
  defaultSeason: string | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [kind, setKind] = useState<DiagramKind>("estrategia");
  const [title, setTitle] = useState("");
  const [season, setSeason] = useState(defaultSeason ?? "bioglow");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const meta = DIAGRAM_META[kind];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await createDiagram(notebookId, { kind, title, season });
      if (!res.ok) return setError(res.error);
      router.push(`/dashboard/quickbrick/${notebookId}/diagramas/${res.data.id}`);
    });
  };

  return (
    <Modal open={open} onClose={pending ? () => {} : onClose} title="Novo diagrama" size="lg"
      description="As mesmas ferramentas do QuickBrick, salvas dentro do caderno.">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Tipo de diagrama">
          {DIAGRAM_KINDS.map((k) => {
            const m = DIAGRAM_META[k];
            const active = k === kind;
            return (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setKind(k)}
                className={`flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition ${
                  active ? "border-primary bg-primary/5" : "border-base-300 hover:bg-base-200/60"
                }`}
              >
                <span className="grid size-8 place-items-center rounded-lg text-white" style={{ background: m.color }}>
                  <DiagramIcon kind={k} className="size-4" />
                </span>
                <span className="text-sm font-semibold leading-tight">{m.label}</span>
              </button>
            );
          })}
        </div>
        <p className="qb-hand text-base text-base-content/60">{meta.description}</p>

        <div className={`grid gap-4 ${meta.needsSeason ? "sm:grid-cols-2" : ""}`}>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Título</span>
            <input
              className="input input-bordered w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
              placeholder={meta.label}
            />
          </label>
          {meta.needsSeason && (
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Temporada</span>
              <select className="select select-bordered w-full" value={season} onChange={(e) => setSeason(e.target.value)}>
                {NOTEBOOK_SEASONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        {error && <p className="text-sm text-error">{error}</p>}
        <div className="modal-action">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={pending}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending && <span className="loading loading-spinner loading-xs" />}
            Criar e abrir
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Comparar versões
// ---------------------------------------------------------------------------

export function CompareModal({
  open,
  photos,
  initial,
  onClose,
}: {
  open: boolean;
  photos: NotebookPhotoDTO[];
  initial: [string | null, string | null];
  onClose: () => void;
}) {
  // Montado só quando aberto: o par inicial vale para esta abertura.
  const [leftId, setLeftId] = useState(initial[0]);
  const [rightId, setRightId] = useState(initial[1]);

  const left = photos.find((p) => p.id === leftId) ?? null;
  const right = photos.find((p) => p.id === rightId) ?? null;

  return (
    <Modal open={open} onClose={onClose} title="Comparar versões" size="lg">
      <div className="grid items-start gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <CompareSide photos={photos} photo={left} value={leftId} onChange={setLeftId} />
        <div className="hidden flex-col items-center gap-1 self-center text-base-content/50 sm:flex">
          <span className="grid size-10 place-items-center rounded-full bg-primary text-primary-content">
            <ArrowLeftRight className="size-4" />
          </span>
          {left && right && <span className="qb-hand text-sm">{fmtDelta(left.takenAt, right.takenAt)}</span>}
        </div>
        <CompareSide photos={photos} photo={right} value={rightId} onChange={setRightId} />
      </div>
    </Modal>
  );
}

function CompareSide({
  photos,
  photo,
  value,
  onChange,
}: {
  photos: NotebookPhotoDTO[];
  photo: NotebookPhotoDTO | null;
  value: string | null;
  onChange: (id: string) => void;
}) {
  return (
    <div className="min-w-0 space-y-2">
      <select
        className="select select-bordered select-sm w-full"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Versão para comparar"
      >
        {photos.map((p, i) => (
          <option key={p.id} value={p.id}>
            {p.title || `Versão ${i + 1}`}
          </option>
        ))}
      </select>
      {photo && (
        <>
          <div className="qb-stage grid aspect-[4/3] place-items-center overflow-hidden rounded-xl border border-base-300">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.url} alt={photo.title ?? "Foto do robô"} className="max-h-full max-w-full object-contain" />
          </div>
          <p className="qb-hand text-base text-base-content/60">{fmtFull(photo.takenAt)}</p>
          <p className="qb-ruled min-h-24 whitespace-pre-wrap rounded-lg border border-base-300 px-3 text-sm">
            {photo.notes || "Sem observações."}
          </p>
        </>
      )}
    </div>
  );
}
