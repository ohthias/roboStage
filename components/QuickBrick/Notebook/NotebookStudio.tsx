"use client";

import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Box,
  Camera,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileBox,
  ImagePlus,
  Images,
  Layers3,
  NotebookPen,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Rotate3d,
  Trash2,
  Upload,
} from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import { ConfirmDialog } from "@/components/stagebook/modal";
import { ResourceLabels } from "@/components/stagebook/labels/resource-labels";
import { formatBytes } from "@/utils/format-bytes";
import {
  DIAGRAM_META,
  NOTEBOOK_MAX_PHOTOS,
  PHOTO_MAX_BYTES,
  PHOTO_TYPES,
  STUDIO_MAX_BYTES,
  seasonName,
  type NotebookDiagramDTO,
  type NotebookPhotoDTO,
} from "@/utils/quickbrick/notebook";
import {
  confirmStudioUpload,
  deleteDiagram,
  deleteNotebook,
  deletePhoto,
  getStudioFileUrl,
  removeStudioFile,
  requestStudioUpload,
  updatePhoto,
  type NotebookDetail,
} from "@/app/(protected)/dashboard/quickbrick/actions";
import { DiagramIcon } from "./diagram-icon";
import { NotebookFormModal } from "./notebook-form";
import { CompareModal, NewDiagramModal, PhotoUploadModal } from "./notebook-modals";
import { StudioViewer, type StudioViewerHandle } from "./StudioViewer";
import { fmtDate, fmtFull, fmtTime, putToSignedUrl, toLocalInput } from "./upload";

type View = "3d" | "photo";
type Focus = { type: "photo"; id: string } | { type: "diagram"; id: string } | { type: "notebook" };

export function NotebookStudio({ detail }: { detail: NotebookDetail }) {
  const router = useRouter();
  const { addToast } = useToast();
  const { notebook, storageReady } = detail;

  const [photos, setPhotos] = useState(detail.photos);
  const [studio, setStudio] = useState(notebook.studio);
  const diagrams = detail.diagrams;

  const latest = photos.at(-1) ?? null;
  const [view, setView] = useState<View>(studio ? "3d" : "photo");
  const [focus, setFocus] = useState<Focus>(latest ? { type: "photo", id: latest.id } : { type: "notebook" });
  const [activePhotoId, setActivePhotoId] = useState<string | null>(latest?.id ?? null);

  const activeIndex = photos.findIndex((p) => p.id === activePhotoId);
  const activePhoto = activeIndex >= 0 ? photos[activeIndex] : null;
  const focusedDiagram = focus.type === "diagram" ? (diagrams.find((d) => d.id === focus.id) ?? null) : null;

  // Visualizador 3D
  const viewerRef = useRef<StudioViewerHandle>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showEdges, setShowEdges] = useState(true);
  const [viewerKey, setViewerKey] = useState(0);

  // Modais
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [newDiagramOpen, setNewDiagramOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [confirm, setConfirm] = useState<null | { kind: "notebook" | "photo" | "studio" | "diagram"; id: string }>(null);
  const [pending, start] = useTransition();

  const photoInput = useRef<HTMLInputElement>(null);
  const studioInput = useRef<HTMLInputElement>(null);
  const [studioProgress, setStudioProgress] = useState<number | null>(null);

  const selectPhoto = (id: string) => {
    setActivePhotoId(id);
    setFocus({ type: "photo", id });
    setView("photo");
  };

  const stepPhoto = (dir: -1 | 1) => {
    if (!photos.length) return;
    const next = photos[(Math.max(activeIndex, 0) + dir + photos.length) % photos.length];
    selectPhoto(next.id);
  };

  // Só ligas com suporte (hoje, FLL Challenge) aceitam conteúdo novo.
  const league = notebook.league;
  const locked = !league?.supported;
  const lockedMessage = league
    ? `O QuickBrick Studio ainda não tem suporte para ${league.code}. Por enquanto só a FLL.`
    : "Defina a competição do caderno em “Editar” para continuar.";
  const openNewDiagram = () => (locked ? addToast(lockedMessage, "warning") : setNewDiagramOpen(true));
  const pickStudio = () => (locked ? addToast(lockedMessage, "warning") : studioInput.current?.click());

  const pickPhoto = () => {
    if (locked) return addToast(lockedMessage, "warning");
    if (!storageReady) return addToast("O armazenamento de arquivos não está configurado.", "error");
    if (photos.length >= NOTEBOOK_MAX_PHOTOS)
      return addToast(`Limite de ${NOTEBOOK_MAX_PHOTOS} fotos por caderno. Remova uma para adicionar outra.`, "warning");
    photoInput.current?.click();
  };

  const onPhotoChosen = (file: File | undefined) => {
    if (!file) return;
    if (!(PHOTO_TYPES as readonly string[]).includes(file.type))
      return addToast("Use uma imagem JPG, PNG ou WEBP.", "error");
    if (file.size > PHOTO_MAX_BYTES) return addToast("A foto pode ter no máximo 12 MB.", "error");
    setUploadFile(file);
  };

  const onStudioChosen = async (file: File | undefined) => {
    if (!file) return;
    if (!/\.io$/i.test(file.name)) return addToast("Envie um arquivo .io do BrickLink Studio 2.0.", "error");
    if (file.size > STUDIO_MAX_BYTES) return addToast("O arquivo do Studio pode ter no máximo 60 MB.", "error");
    setStudioProgress(0);
    try {
      const req = await requestStudioUpload(notebook.id, { fileName: file.name, size: file.size });
      if (!req.ok) throw new Error(req.error);
      await putToSignedUrl(req.data.uploadUrl, file, setStudioProgress);
      const done = await confirmStudioUpload(notebook.id, { key: req.data.key, fileName: file.name });
      if (!done.ok) throw new Error(done.error);
      setStudio(done.data);
      setViewerKey((k) => k + 1);
      setView("3d");
      addToast("Projeto do Studio enviado!", "success");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Falha ao enviar o arquivo.", "error");
    } finally {
      setStudioProgress(null);
    }
  };

  const getStudioUrl = useCallback(async () => {
    const res = await getStudioFileUrl(notebook.id);
    if (!res.ok) throw new Error(res.error);
    return res.data.url;
  }, [notebook.id]);

  const downloadStudio = async () => {
    const res = await getStudioFileUrl(notebook.id);
    if (!res.ok) return addToast(res.error, "error");
    window.open(res.data.url, "_blank", "noopener");
  };

  const screenshot = () => {
    const data = view === "3d" ? viewerRef.current?.screenshot() : activePhoto?.url;
    if (!data) return;
    const a = document.createElement("a");
    a.href = data;
    a.download = view === "3d" ? `${notebook.name}-3d.png` : (activePhoto?.fileName ?? "foto.png");
    a.target = "_blank";
    a.click();
  };

  const runConfirm = () => {
    if (!confirm) return;
    start(async () => {
      if (confirm.kind === "notebook") {
        const res = await deleteNotebook(confirm.id);
        if (!res.ok) return addToast(res.error, "error");
        router.push("/dashboard/quickbrick");
        return;
      }
      if (confirm.kind === "photo") {
        const res = await deletePhoto(confirm.id);
        if (!res.ok) return addToast(res.error, "error");
        const rest = photos.filter((p) => p.id !== confirm.id);
        setPhotos(rest);
        const fallback = rest.at(-1) ?? null;
        setActivePhotoId(fallback?.id ?? null);
        setFocus(fallback ? { type: "photo", id: fallback.id } : { type: "notebook" });
        if (!fallback && studio) setView("3d");
      }
      if (confirm.kind === "studio") {
        const res = await removeStudioFile(confirm.id);
        if (!res.ok) return addToast(res.error, "error");
        setStudio(null);
        setView("photo");
      }
      if (confirm.kind === "diagram") {
        const res = await deleteDiagram(confirm.id);
        if (!res.ok) return addToast(res.error, "error");
        setFocus({ type: "notebook" });
        router.refresh();
      }
      setConfirm(null);
    });
  };

  // Par inicial da comparação: versão anterior × versão ativa.
  const compareInitial = useMemo<[string | null, string | null]>(() => {
    const i = activeIndex >= 0 ? activeIndex : photos.length - 1;
    return [photos[Math.max(0, i - 1)]?.id ?? null, photos[i]?.id ?? null];
  }, [activeIndex, photos]);

  const heading =
    view === "3d" ? (notebook.robotName ?? notebook.name) : (activePhoto?.title ?? `Versão ${activeIndex + 1}`);
  const subheading =
    view === "3d"
      ? studio
        ? `Modelo 3D · ${studio.fileName}`
        : "Modelo 3D do Studio 2.0"
      : activePhoto
        ? `${fmtDate(activePhoto.takenAt)} às ${fmtTime(activePhoto.takenAt)}`
        : "Nenhuma foto ainda";

  return (
    <div className="qb-paper min-h-full px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      {/* Cabeçalho */}
      <header className="mx-auto mb-6 flex max-w-[1500px] flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <Link
            href="/dashboard/quickbrick"
            className="grid size-14 shrink-0 place-items-center rounded-full bg-base-100 shadow-sm ring-1 ring-base-300 transition hover:ring-primary/40"
            aria-label="Voltar aos cadernos"
            title="Voltar aos cadernos"
            style={{ color: notebook.coverColor ?? undefined }}
          >
            <NotebookPen className="size-6" strokeWidth={1.6} />
          </Link>
          <div className="min-w-0">
            <h1 className="qb-serif truncate text-4xl leading-none sm:text-5xl">{notebook.name}</h1>
            <p className="qb-hand mt-1 truncate text-lg text-base-content/55">
              {[league?.code, notebook.robotName && `Robô ${notebook.robotName}`, seasonName(notebook.season), "QuickBrick Studio"]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>
        <nav className="flex items-center gap-1" aria-label="Ações do caderno">
          <HeaderAction icon={Images} label="Galeria" onClick={() => document.getElementById("qb-gallery")?.scrollIntoView({ behavior: "smooth" })} />
          <HeaderAction icon={Layers3} label="Diagramas" onClick={openNewDiagram} />
          <HeaderAction icon={Pencil} label="Editar" onClick={() => setEditOpen(true)} />
          <HeaderAction icon={Trash2} label="Excluir" danger onClick={() => setConfirm({ kind: "notebook", id: notebook.id })} />
        </nav>
      </header>

      {locked && (
        <div role="alert" className="alert alert-info mx-auto mb-5 max-w-[1500px] text-sm">
          <span>{lockedMessage} O conteúdo já salvo continua disponível para consulta.</span>
          <button className="btn btn-sm" onClick={() => setEditOpen(true)}>
            Escolher competição
          </button>
        </div>
      )}

      {!storageReady && (
        <div role="alert" className="alert alert-warning mx-auto mb-5 max-w-[1500px] text-sm">
          O armazenamento R2 não está configurado neste servidor — fotos e o arquivo do Studio não podem ser enviados.
        </div>
      )}

      <div className="mx-auto grid max-w-[1500px] gap-5 lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_300px]">
        {/* ── Coluna esquerda ─────────────────────────────── */}
        <aside className="order-2 space-y-5 lg:order-1">
          <Panel
            label="Versões do robô"
            meta={`${photos.length}/${NOTEBOOK_MAX_PHOTOS}`}
            action={
              <button className="btn btn-ghost btn-xs btn-square" onClick={pickPhoto} aria-label="Adicionar versão" title="Adicionar versão">
                <Plus className="size-4" />
              </button>
            }
          >
            {photos.length === 0 ? (
              <EmptyHint text="Envie a primeira foto do robô para começar a linha do tempo." />
            ) : (
              <ol className="-mx-1 space-y-1">
                {[...photos].reverse().map((p) => {
                  const n = photos.indexOf(p) + 1;
                  const active = focus.type === "photo" && focus.id === p.id;
                  return (
                    <li key={p.id}>
                      <button
                        onClick={() => selectPhoto(p.id)}
                        aria-current={active || undefined}
                        className={`flex w-full items-center gap-3 rounded-xl px-1.5 py-1.5 text-left transition ${
                          active ? "bg-primary/10 ring-1 ring-primary/25" : "hover:bg-base-200/70"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.url} alt="" className="size-11 shrink-0 rounded-lg object-cover ring-1 ring-base-300" />
                        <span className="min-w-0 flex-1">
                          <span className="qb-serif block truncate text-base leading-tight">{p.title || `Versão ${n}`}</span>
                          <span className="block truncate text-xs text-base-content/50">
                            {fmtDate(p.takenAt)} · {fmtTime(p.takenAt)}
                          </span>
                        </span>
                        <span className="qb-hand shrink-0 text-sm text-base-content/40">v{n}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}
          </Panel>

          <Panel
            label="Diagramas"
            meta={String(diagrams.length)}
            action={
              <button className="btn btn-ghost btn-xs btn-square" onClick={openNewDiagram} aria-label="Novo diagrama" title="Novo diagrama">
                <Plus className="size-4" />
              </button>
            }
          >
            {diagrams.length === 0 ? (
              <EmptyHint text="Estratégia, riscos, SWOT, missões e mapa de calor ficam aqui." />
            ) : (
              <ul className="-mx-1 space-y-0.5">
                {diagrams.map((d) => {
                  const active = focus.type === "diagram" && focus.id === d.id;
                  return (
                    <li key={d.id}>
                      <button
                        onClick={() => setFocus({ type: "diagram", id: d.id })}
                        onDoubleClick={() => router.push(`/dashboard/quickbrick/${notebook.id}/diagramas/${d.id}`)}
                        aria-current={active || undefined}
                        className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm transition ${
                          active ? "bg-base-200 font-medium" : "hover:bg-base-200/60"
                        }`}
                      >
                        <span className="size-2 shrink-0 rounded-full" style={{ background: DIAGRAM_META[d.kind].color }} />
                        <span className="min-w-0 flex-1 truncate">{d.title}</span>
                        <DiagramIcon kind={d.kind} className="size-3.5 shrink-0 text-base-content/35" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <button className="btn btn-ghost btn-sm mt-2 w-full justify-start gap-2 text-base-content/60" onClick={openNewDiagram}>
              <Plus className="size-4" /> Novo diagrama
            </button>
          </Panel>
        </aside>

        {/* ── Centro ───────────────────────────────────────── */}
        <section className="order-1 min-w-0 space-y-5 lg:order-2">
          <div className="qb-sheet qb-spiral relative overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-4 px-6 pt-5 sm:px-8">
              <div className="min-w-0">
                <h2 className="qb-serif truncate text-3xl leading-tight sm:text-[2.6rem]">{heading}</h2>
                <p className="qb-serif truncate text-base italic text-base-content/50">{subheading}</p>
              </div>
              <div className="rounded-2xl border border-base-300 bg-base-200/50 p-2.5 shadow-sm">
                <p className="qb-label mb-2 px-1">Modo de visão</p>
                <div className="join" role="tablist" aria-label="Modo de visão">
                  <ViewTab active={view === "3d"} onClick={() => setView("3d")} icon={Box} label="Modelo 3D" />
                  <ViewTab
                    active={view === "photo"}
                    onClick={() => {
                      setView("photo");
                      if (activePhoto) setFocus({ type: "photo", id: activePhoto.id });
                    }}
                    icon={Camera}
                    label="Foto da versão"
                  />
                </div>
              </div>
            </div>

            <div className="qb-stage relative mx-4 mt-3 h-[380px] overflow-hidden rounded-2xl sm:mx-6 sm:h-[440px]">
              {view === "3d" ? (
                studio ? (
                  <StudioViewer
                    key={viewerKey}
                    ref={viewerRef}
                    getUrl={getStudioUrl}
                    autoRotate={autoRotate}
                    showEdges={showEdges}
                  />
                ) : (
                  <StageEmpty
                    icon={FileBox}
                    title="Sem projeto do Studio"
                    text="Envie o arquivo .io do BrickLink Studio 2.0 para ver o robô em 3D."
                    action={
                      <button className="btn btn-primary btn-sm" onClick={pickStudio} disabled={!storageReady || studioProgress !== null}>
                        <Upload className="size-4" /> Enviar arquivo .io
                      </button>
                    }
                  />
                )
              ) : activePhoto ? (
                <figure className="grid h-full place-items-center p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activePhoto.url}
                    alt={activePhoto.title ?? "Foto do robô"}
                    className="max-h-full max-w-full rounded-lg object-contain shadow-lg"
                  />
                </figure>
              ) : (
                <StageEmpty
                  icon={Camera}
                  title="Nenhuma foto ainda"
                  text="Cada foto vira uma versão do robô, com data, hora e observações."
                  action={
                    <button className="btn btn-primary btn-sm" onClick={pickPhoto} disabled={!storageReady}>
                      <ImagePlus className="size-4" /> Adicionar foto
                    </button>
                  }
                />
              )}

              {studioProgress !== null && (
                <div className="absolute inset-x-6 bottom-4">
                  <progress className="progress progress-primary w-full" value={Math.round(studioProgress * 100)} max={100} />
                </div>
              )}
            </div>

            {/* Barra de ferramentas do palco */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-4 sm:px-6">
              {view === "3d" ? (
                <div className="join">
                  <ToolButton icon={Rotate3d} label="Girar" active={autoRotate} onClick={() => setAutoRotate((v) => !v)} disabled={!studio} />
                  <ToolButton icon={Layers3} label="Arestas" active={showEdges} onClick={() => setShowEdges((v) => !v)} disabled={!studio} />
                  <ToolButton icon={RotateCcw} label="Resetar vista" onClick={() => viewerRef.current?.resetView()} disabled={!studio} />
                </div>
              ) : (
                <div className="join">
                  <ToolButton icon={ChevronLeft} label="Anterior" onClick={() => stepPhoto(-1)} disabled={photos.length < 2} />
                  <ToolButton icon={ChevronRight} label="Próxima" onClick={() => stepPhoto(1)} disabled={photos.length < 2} />
                  <ToolButton
                    icon={ExternalLink}
                    label="Original"
                    onClick={() => activePhoto && window.open(activePhoto.url, "_blank", "noopener")}
                    disabled={!activePhoto}
                  />
                </div>
              )}
              <div className="join">
                <ToolButton icon={Camera} label={view === "3d" ? "Captura" : "Baixar foto"} onClick={screenshot} disabled={view === "3d" ? !studio : !activePhoto} />
                {view === "3d" && studio && (
                  <>
                    <ToolButton icon={Download} label=".io" onClick={downloadStudio} />
                    <ToolButton icon={RefreshCw} label="Trocar" onClick={pickStudio} disabled={studioProgress !== null} />
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
            {/* Galeria (polaroids) */}
            <Panel id="qb-gallery" label="Galeria de versões" meta={`${photos.length}/${NOTEBOOK_MAX_PHOTOS}`}>
              <div className="flex gap-3 overflow-x-auto pb-2 pt-3">
                {photos.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => selectPhoto(p.id)}
                    className={`qb-polaroid relative w-[92px] shrink-0 text-left ${activePhotoId === p.id && view === "photo" ? "ring-2 ring-primary/50" : ""}`}
                    style={{ rotate: `${((i % 3) - 1) * 1.5}deg` }}
                    title={p.title ?? `Versão ${i + 1}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt="" className="aspect-square w-full rounded-sm object-cover" />
                    <span className="qb-hand mt-1 block truncate text-center text-sm leading-tight">{p.title || `Versão ${i + 1}`}</span>
                    <span className="block text-center text-[10px] text-base-content/45">{fmtDate(p.takenAt)}</span>
                  </button>
                ))}
                {photos.length < NOTEBOOK_MAX_PHOTOS && (
                  <button
                    onClick={pickPhoto}
                    disabled={!storageReady}
                    className="grid w-[92px] shrink-0 place-items-center rounded-lg border border-dashed border-base-300 bg-base-100/50 text-base-content/50 transition hover:border-primary/40 hover:text-primary disabled:opacity-50"
                  >
                    <span className="flex flex-col items-center gap-1 py-6">
                      <Plus className="size-5" />
                      <span className="qb-hand text-sm">Adicionar foto</span>
                    </span>
                  </button>
                )}
              </div>
            </Panel>

            {/* Comparar versões */}
            <Panel label="Comparar versões">
              {photos.length < 2 ? (
                <EmptyHint text="Com duas versões ou mais você compara fotos e anotações lado a lado." />
              ) : (
                <>
                  <div className="mt-1 flex items-center gap-2 rounded-xl border border-base-300 bg-base-100 p-2">
                    <CompareChip photo={activePhoto ?? photos[photos.length - 1]} hint="Você está aqui" />
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-content">VS</span>
                    <CompareChip photo={photos[Math.max(0, (activeIndex >= 0 ? activeIndex : photos.length - 1) - 1)]} hint="Versão anterior" />
                  </div>
                  <button className="btn btn-ghost btn-sm mt-3 w-full border-base-300" onClick={() => setCompareOpen(true)}>
                    Abrir comparação <ArrowRight className="size-4" />
                  </button>
                </>
              )}
            </Panel>
          </div>
        </section>

        {/* ── Coluna direita ──────────────────────────────── */}
        <aside className="order-3 space-y-5 lg:col-span-2 lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0 xl:col-span-1 xl:block xl:space-y-5">
          {focusedDiagram ? (
            <DiagramDetails
              diagram={focusedDiagram}
              href={`/dashboard/quickbrick/${notebook.id}/diagramas/${focusedDiagram.id}`}
              onDelete={() => setConfirm({ kind: "diagram", id: focusedDiagram.id })}
            />
          ) : activePhoto && focus.type === "photo" ? (
            <VersionDetails
              key={activePhoto.id}
              photo={activePhoto}
              number={activeIndex + 1}
              onSaved={(p) => setPhotos((list) => list.map((x) => (x.id === p.id ? p : x)).sort((a, b) => a.takenAt.localeCompare(b.takenAt)))}
              onDelete={() => setConfirm({ kind: "photo", id: activePhoto.id })}
            />
          ) : null}

          <Panel label="Sobre o caderno">
            {notebook.description ? (
              <p className="qb-ruled whitespace-pre-wrap text-sm text-base-content/80">{notebook.description}</p>
            ) : (
              <EmptyHint text="Sem descrição. Use “Editar” para contar o objetivo do robô." />
            )}
            <div className="mt-4 space-y-2">
              <p className="qb-label">Tags e milestone</p>
              <ResourceLabels
                kind="quickbrick"
                resourceId={notebook.id}
                initialTags={notebook.tags}
                initialMilestone={notebook.milestone}
              />
            </div>
          </Panel>

          <Panel label="Projeto Studio 2.0">
            {studio ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary/10 text-secondary">
                    <FileBox className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{studio.fileName}</p>
                    <p className="text-xs text-base-content/50">
                      {formatBytes(studio.size)} · enviado em {fmtDate(studio.uploadedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-sm flex-1" onClick={() => setView("3d")}>
                    <Box className="size-4" /> Ver em 3D
                  </button>
                  <button
                    className="btn btn-sm btn-ghost btn-square text-error"
                    onClick={() => setConfirm({ kind: "studio", id: notebook.id })}
                    aria-label="Remover arquivo do Studio"
                    title="Remover arquivo"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-base-content/65">
                  Exporte o projeto no{" "}
                  <a href="https://www.bricklink.com/v3/studio/download.page" target="_blank" rel="noreferrer" className="link link-primary">
                    BrickLink Studio 2.0
                  </a>{" "}
                  e envie o arquivo <code className="rounded bg-base-200 px-1">.io</code> para ter a prévia 3D.
                </p>
                <button className="btn btn-sm btn-primary w-full" onClick={pickStudio} disabled={!storageReady || studioProgress !== null}>
                  <Upload className="size-4" /> Enviar arquivo .io
                </button>
              </div>
            )}
          </Panel>
        </aside>
      </div>

      {/* Entradas de arquivo escondidas */}
      <input
        ref={photoInput}
        type="file"
        accept={PHOTO_TYPES.join(",")}
        className="hidden"
        onChange={(e) => {
          onPhotoChosen(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <input
        ref={studioInput}
        type="file"
        accept=".io"
        className="hidden"
        onChange={(e) => {
          void onStudioChosen(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {uploadFile && (
        <PhotoUploadModal
          key={`${uploadFile.name}-${uploadFile.lastModified}-${uploadFile.size}`}
          notebookId={notebook.id}
          file={uploadFile}
          versionNumber={photos.length + 1}
          onClose={() => setUploadFile(null)}
          onUploaded={(photo) => {
            setPhotos((list) => [...list, photo].sort((a, b) => a.takenAt.localeCompare(b.takenAt)));
            selectPhoto(photo.id);
            addToast("Versão salva no caderno!", "success");
          }}
        />
      )}
      <NewDiagramModal
        open={newDiagramOpen}
        notebookId={notebook.id}
        defaultSeason={notebook.season}
        onClose={() => setNewDiagramOpen(false)}
      />
      {compareOpen && (
        <CompareModal
          open
          photos={photos}
          initial={compareInitial}
          onClose={() => setCompareOpen(false)}
        />
      )}
      {editOpen && <NotebookFormModal open notebook={notebook} leagues={detail.leagues} onClose={() => setEditOpen(false)} />}
      <ConfirmDialog
        open={confirm !== null}
        pending={pending}
        title={
          confirm?.kind === "notebook"
            ? "Excluir caderno?"
            : confirm?.kind === "photo"
              ? "Excluir esta versão?"
              : confirm?.kind === "studio"
                ? "Remover projeto do Studio?"
                : "Excluir diagrama?"
        }
        description={
          confirm?.kind === "notebook"
            ? "Fotos, diagramas e o arquivo do Studio serão apagados para sempre."
            : confirm?.kind === "photo"
              ? "A foto e as observações desta versão serão apagadas."
              : confirm?.kind === "studio"
                ? "O arquivo .io será removido do armazenamento."
                : "O conteúdo do diagrama será apagado."
        }
        onConfirm={runConfirm}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Peças de interface
// ---------------------------------------------------------------------------

type IconType = React.ComponentType<{ className?: string; strokeWidth?: number }>;

function Panel({
  label,
  meta,
  action,
  children,
  id,
}: {
  label: string;
  meta?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="qb-sheet scroll-mt-24 p-4">
      <header className="mb-3 flex items-center justify-between gap-2 border-b border-dashed border-base-300 pb-2">
        <h3 className="qb-label flex items-center gap-2">
          {label}
          {meta && <span className="rounded-full bg-base-200 px-1.5 font-sans text-[10px] text-base-content/50">{meta}</span>}
        </h3>
        {action}
      </header>
      {children}
    </section>
  );
}

function HeaderAction({ icon: Icon, label, onClick, danger }: { icon: IconType; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-16 flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] transition hover:bg-base-100 ${
        danger ? "text-base-content/60 hover:text-error" : "text-base-content/70 hover:text-base-content"
      }`}
    >
      <Icon className="size-[18px]" strokeWidth={1.7} />
      {label}
    </button>
  );
}

function ViewTab({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: IconType; label: string }) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      title={label}
      className={`btn join-item btn-sm gap-1.5 ${active ? "btn-active border-base-300 bg-base-100 shadow-sm" : "btn-ghost"}`}
    >
      <Icon className="size-4" strokeWidth={1.7} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function ToolButton({
  icon: Icon,
  label,
  onClick,
  active,
  disabled,
}: {
  icon: IconType;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`btn join-item btn-sm gap-1.5 border-base-300 font-normal ${active ? "bg-base-200" : "bg-base-100"}`}
    >
      <Icon className="size-3.5" strokeWidth={1.8} />
      {label}
    </button>
  );
}

function StageEmpty({ icon: Icon, title, text, action }: { icon: IconType; title: string; text: string; action: React.ReactNode }) {
  return (
    <div className="grid h-full place-items-center p-6 text-center">
      <div className="flex max-w-sm flex-col items-center gap-3">
        <span className="grid size-16 place-items-center rounded-full bg-base-100 text-base-content/40 shadow-sm ring-1 ring-base-300">
          <Icon className="size-7" strokeWidth={1.4} />
        </span>
        <p className="qb-serif text-2xl">{title}</p>
        <p className="qb-hand text-lg leading-snug text-base-content/55">{text}</p>
        {action}
      </div>
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <p className="qb-hand py-2 text-base leading-snug text-base-content/50">{text}</p>;
}

function CompareChip({ photo, hint }: { photo: NotebookPhotoDTO; hint: string }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.url} alt="" className="size-9 shrink-0 rounded-full object-cover ring-1 ring-base-300" />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold leading-tight">{photo.title || "Versão"}</p>
        <p className="truncate text-[11px] text-base-content/50">{hint}</p>
      </div>
    </div>
  );
}

function VersionDetails({
  photo,
  number,
  onSaved,
  onDelete,
}: {
  photo: NotebookPhotoDTO;
  number: number;
  onSaved: (photo: NotebookPhotoDTO) => void;
  onDelete: () => void;
}) {
  const { addToast } = useToast();
  const [title, setTitle] = useState(photo.title ?? "");
  const [takenAt, setTakenAt] = useState(() => toLocalInput(new Date(photo.takenAt)));
  const [notes, setNotes] = useState(photo.notes ?? "");
  const [saving, setSaving] = useState(false);

  const dirty =
    title !== (photo.title ?? "") ||
    notes !== (photo.notes ?? "") ||
    new Date(takenAt).getTime() !== new Date(toLocalInput(new Date(photo.takenAt))).getTime();

  const save = async () => {
    setSaving(true);
    const res = await updatePhoto(photo.id, { title, notes, takenAt: new Date(takenAt).toISOString() });
    setSaving(false);
    if (!res.ok) return addToast(res.error, "error");
    onSaved(res.data);
    addToast("Versão atualizada.", "success");
  };

  return (
    <>
      <Panel
        label="Detalhes da versão"
        action={
          <button className="btn btn-ghost btn-xs btn-square text-base-content/50 hover:text-error" onClick={onDelete} aria-label="Excluir versão" title="Excluir versão">
            <Trash2 className="size-3.5" />
          </button>
        }
      >
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.url} alt="" className="size-14 shrink-0 rounded-full object-cover shadow ring-2 ring-base-100" />
          <div className="min-w-0 flex-1">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
              placeholder={`Versão ${number}`}
              aria-label="Nome da versão"
              className="qb-serif w-full truncate bg-transparent text-2xl leading-tight outline-none focus:underline focus:decoration-dashed"
            />
            <p className="qb-serif text-sm italic text-base-content/50">Versão {number} do robô</p>
          </div>
        </div>
        <dl className="mt-4 grid grid-cols-[88px_1fr] gap-x-3 gap-y-2.5 text-sm">
          <dt className="text-base-content/50">Data e hora</dt>
          <dd>
            <input
              type="datetime-local"
              value={takenAt}
              onChange={(e) => setTakenAt(e.target.value)}
              className="input input-ghost input-xs -ml-2 w-full px-2"
              aria-label="Data e hora da versão"
            />
          </dd>
          <dt className="text-base-content/50">Registrada</dt>
          <dd className="truncate">{fmtFull(photo.createdAt)}</dd>
          <dt className="text-base-content/50">Arquivo</dt>
          <dd className="truncate" title={photo.fileName}>{photo.fileName}</dd>
          <dt className="text-base-content/50">Tamanho</dt>
          <dd>{formatBytes(photo.size)}</dd>
        </dl>
      </Panel>

      <Panel label="Mudanças nesta versão">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={4000}
          rows={6}
          placeholder="O que mudou no robô? Anexos, motores, sensores, programação…"
          className="qb-ruled w-full resize-y rounded-md px-1 text-sm outline-none focus:ring-1 focus:ring-primary/30"
          aria-label="Observações da versão"
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="qb-hand text-sm text-base-content/45">{dirty ? "Alterações não salvas" : "Anotado ✓"}</span>
          <button className="btn btn-primary btn-xs" onClick={save} disabled={!dirty || saving}>
            {saving && <span className="loading loading-spinner loading-xs" />}
            Salvar
          </button>
        </div>
      </Panel>
    </>
  );
}

function DiagramDetails({ diagram, href, onDelete }: { diagram: NotebookDiagramDTO; href: string; onDelete: () => void }) {
  const meta = DIAGRAM_META[diagram.kind];
  return (
    <Panel
      label="Detalhes do diagrama"
      action={
        <button className="btn btn-ghost btn-xs btn-square text-base-content/50 hover:text-error" onClick={onDelete} aria-label="Excluir diagrama" title="Excluir diagrama">
          <Trash2 className="size-3.5" />
        </button>
      }
    >
      <div className="flex items-center gap-3">
        <span className="grid size-14 shrink-0 place-items-center rounded-full text-white shadow" style={{ background: meta.color }}>
          <DiagramIcon kind={diagram.kind} className="size-6" />
        </span>
        <div className="min-w-0">
          <p className="qb-serif truncate text-2xl leading-tight">{diagram.title}</p>
          <p className="qb-serif text-sm italic text-base-content/50">{meta.label}</p>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-[88px_1fr] gap-x-3 gap-y-2 text-sm">
        <dt className="text-base-content/50">Conteúdo</dt>
        <dd>{diagram.summary}</dd>
        {diagram.season && (
          <>
            <dt className="text-base-content/50">Temporada</dt>
            <dd>{seasonName(diagram.season) ?? diagram.season}</dd>
          </>
        )}
        <dt className="text-base-content/50">Editado</dt>
        <dd>
          {fmtDate(diagram.updatedAt)} · {fmtTime(diagram.updatedAt)}
        </dd>
      </dl>
      <p className="qb-hand mt-3 text-base leading-snug text-base-content/55">{meta.description}</p>
      <Link href={href} className="btn btn-primary btn-sm mt-4 w-full">
        Abrir diagrama <ArrowRight className="size-4" />
      </Link>
    </Panel>
  );
}
