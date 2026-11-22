"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "./lazy-motion";
import {
  ChevronLeft,
  ChevronRight,
  CloudUpload,
  Film,
  ImageIcon,
  Maximize2,
  Pause,
  Play,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { cn, toneFill, type Tone } from "../lib";
import { StatusBadge, StickerTag } from "./Tag";
import { AmbientVideo } from "./AmbientVideo";
import { MediaEffectLayer, StageImage, Tape, type MediaEffect, type MediaItem, type MediaRatio } from "./Media";

/* ------------------------------------------------------------------ */
/*  Mídia interativa: vídeo, embed, galeria com lightbox e upload.     */
/* ------------------------------------------------------------------ */

const ratioClass: Record<MediaRatio, string> = {
  "1/1": "aspect-square",
  "4/3": "aspect-[4/3]",
  "3/4": "aspect-[3/4]",
  "16/9": "aspect-video",
  "9/16": "aspect-[9/16]",
  "21/9": "aspect-[21/9]",
  "3/2": "aspect-[3/2]",
};

export function formatTime(sec: number) {
  if (!Number.isFinite(sec)) return "0:00";
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

const frameClass = {
  plain: "rounded-2xl border border-base-300",
  card: "stage-shadow-lg rounded-tl-[2rem] rounded-br-[2rem]",
  sticker: "stage-shadow rounded-[1.75rem] border-[6px] border-base-100 outline-[1.5px] outline-base-content",
  /** Telão: moldura escura, pensada para o ShowLive. */
  screen: "stage-shadow-lg rounded-[1.5rem] border-[10px] border-[var(--stage-night)]",
};

/* ============================================================== VÍDEO */

export type StageVideoProps = {
  src: string;
  poster?: string;
  title: string;
  caption?: ReactNode;
  ratio?: MediaRatio;
  frame?: keyof typeof frameClass;
  effect?: MediaEffect;
  /** Cor do botão de play e da barra de progresso. */
  tone?: Tone;
  tilt?: number;
  tape?: boolean;
  /** Etiqueta no canto; `"live"` mostra o selo Ao vivo. */
  badge?: ReactNode | "live";
  /** Vídeo de fundo: mudo, em loop, autoplay, sem controles. */
  ambient?: boolean;
  /** Legendas (WebVTT). */
  captionsSrc?: string;
  className?: string;
};

/**
 * StageVideo — player com controles da marca. Antes de hidratar, mostra os
 * controles nativos do navegador (funciona sem JS); depois troca pelos nossos.
 * Atalhos com o player em foco: espaço/K (play), ←/→ (5 s), M (mudo), F (tela cheia).
 */
export function StageVideo({
  src,
  poster,
  title,
  caption,
  ratio = "16/9",
  frame = "card",
  effect = "none",
  tone = "primary",
  tilt,
  tape,
  badge,
  ambient,
  captionsSrc,
  className,
}: StageVideoProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mounted, setMounted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(!!ambient);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggle = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
    } else v.pause();
  }, []);

  const seek = (t: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration || 0, t));
  };

  const fullscreen = () => {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else el.requestFullscreen?.().catch(() => {});
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (ambient) return;
    const k = e.key.toLowerCase();
    if (k === " " || k === "k") {
      e.preventDefault();
      toggle();
    } else if (k === "arrowright") seek(time + 5);
    else if (k === "arrowleft") seek(time - 5);
    else if (k === "m") setMuted((m) => !m);
    else if (k === "f") fullscreen();
  };

  const pct = duration ? (time / duration) * 100 : 0;
  const showControls = mounted && !ambient;

  return (
    <figure className={cn("relative", className)} style={{ rotate: tilt ? `${tilt}deg` : undefined }}>
      {tape && (
        <>
          <Tape className="-left-4 -top-2" rotate={-14} />
          <Tape className="-right-4 -top-2" rotate={12} />
        </>
      )}
      <div
        ref={wrapRef}
        tabIndex={showControls ? 0 : undefined}
        onKeyDown={onKey}
        aria-label={showControls ? `Player de vídeo: ${title}` : undefined}
        className={cn(
          "group/video relative isolate overflow-hidden bg-[var(--stage-night)] outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-base-100",
          ratioClass[ratio],
          frameClass[frame],
        )}
      >
        {ambient ? (
          <AmbientVideo src={src} poster={poster} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          title={title}
          className="absolute inset-0 h-full w-full object-cover"
          playsInline
          preload="metadata"
          muted={muted}
          controls={!mounted}
          onClick={showControls ? toggle : undefined}
          onPlay={() => {
            setPlaying(true);
            setStarted(true);
          }}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        >
          {captionsSrc && <track kind="captions" src={captionsSrc} srcLang="pt-BR" label="Português" default />}
        </video>
        )}

        {/* textura por cima da imagem, por baixo dos controles */}
        {mounted && <MediaEffectLayer effect={effect} tone={tone} />}

        {badge && (
          <span className="pointer-events-none absolute left-3 top-3 z-30">
            {badge === "live" ? <StatusBadge status="live" /> : <StickerTag size="sm">{badge}</StickerTag>}
          </span>
        )}

        {showControls && (
          <>
            {/* play central (antes de começar e quando pausado) */}
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? "Pausar" : "Reproduzir"}
              className={cn(
                "absolute left-1/2 top-1/2 z-30 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-tl-3xl rounded-br-3xl transition-all duration-300 stage-noise stage-shadow stage-press",
                toneFill[tone],
                playing ? "pointer-events-none scale-75 opacity-0" : "opacity-100",
              )}
            >
              <Play size={32} fill="currentColor" className="translate-x-0.5" />
            </button>

            {!started && (
              <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            )}
            {!started && (
              <span className="pointer-events-none absolute bottom-4 left-4 z-30 max-w-[70%] text-left">
                <span className="stage-label block text-white/75">Vídeo{duration ? ` · ${formatTime(duration)}` : ""}</span>
                <span className="mt-1 block text-lg font-black leading-tight tracking-tight text-white drop-shadow">{title}</span>
              </span>
            )}

            {/* barra inferior */}
            <div
              className={cn(
                "absolute inset-x-0 bottom-0 z-30 flex items-center gap-3 bg-gradient-to-t from-black/75 to-transparent px-4 pb-3 pt-10 text-white transition-opacity duration-300",
                started ? "opacity-0 group-hover/video:opacity-100 group-focus-within/video:opacity-100" : "pointer-events-none opacity-0",
                !playing && started && "opacity-100",
              )}
            >
              <button type="button" onClick={toggle} aria-label={playing ? "Pausar" : "Reproduzir"} className="grid size-8 place-items-center rounded-full hover:bg-white/15">
                {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
              </button>
              <span className="font-mono text-xs tabular-nums text-white/85">
                {formatTime(time)} / {formatTime(duration)}
              </span>
              <div className="relative h-2 flex-1 rounded-full bg-white/25">
                <div className={cn("absolute inset-y-0 left-0 rounded-full", toneFill[tone])} style={{ width: `${pct}%` }} />
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.1}
                  value={time}
                  onChange={(e) => seek(Number(e.target.value))}
                  aria-label="Posição do vídeo"
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </div>
              <button type="button" onClick={() => setMuted((m) => !m)} aria-label={muted ? "Ativar som" : "Silenciar"} className="grid size-8 place-items-center rounded-full hover:bg-white/15">
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <button type="button" onClick={fullscreen} aria-label="Tela cheia" className="grid size-8 place-items-center rounded-full hover:bg-white/15">
                <Maximize2 size={16} />
              </button>
            </div>
          </>
        )}
      </div>
      {caption && <figcaption className="mt-3 text-sm font-semibold">{caption}</figcaption>}
    </figure>
  );
}

/* ============================================================== EMBED */

/**
 * VideoEmbed — YouTube/Vimeo "leve": mostra a capa e só carrega o iframe
 * no clique (não pesa a página nem rastreia antes do play).
 */
export function VideoEmbed({
  provider,
  id,
  title,
  poster,
  ratio = "16/9",
  frame = "card",
  tone = "primary",
  className,
}: {
  provider: "youtube" | "vimeo";
  id: string;
  title: string;
  poster?: string;
  ratio?: MediaRatio;
  frame?: keyof typeof frameClass;
  tone?: Tone;
  className?: string;
}) {
  const [active, setActive] = useState(false);
  const cover = poster ?? (provider === "youtube" ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : undefined);
  const url =
    provider === "youtube"
      ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`
      : `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1`;
  return (
    <div className={cn("relative isolate overflow-hidden bg-[var(--stage-night)]", ratioClass[ratio], frameClass[frame], className)}>
      {active ? (
        <iframe
          src={url}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
        />
      ) : (
        <button type="button" onClick={() => setActive(true)} className="group absolute inset-0 text-left" aria-label={`Reproduzir: ${title}`}>
          {cover && <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-105" />}
          <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <span className={cn("stage-noise stage-shadow absolute left-1/2 top-1/2 z-10 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-tl-3xl rounded-br-3xl transition-transform group-hover:scale-105", toneFill[tone])}>
            <Play size={32} fill="currentColor" className="translate-x-0.5" />
          </span>
          <span className="absolute bottom-4 left-4 z-10 max-w-[75%]">
            <span className="stage-label block text-white/70">{provider === "youtube" ? "YouTube" : "Vimeo"}</span>
            <span className="mt-1 block text-lg font-black leading-tight tracking-tight text-white">{title}</span>
          </span>
        </button>
      )}
    </div>
  );
}

/* ============================================================= GALERIA */

/** ImageGallery — grade de miniaturas com lightbox (setas, Esc, contador). */
export function ImageGallery({
  items,
  columns = 3,
  className,
}: {
  items: MediaItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const cols = { 2: "grid-cols-2", 3: "grid-cols-2 md:grid-cols-3", 4: "grid-cols-2 md:grid-cols-4" }[columns];

  const go = useCallback((d: number) => setOpen((i) => (i == null ? i : (i + d + items.length) % items.length)), [items.length]);

  useEffect(() => {
    if (open == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  const current = open != null ? items[open] : null;

  return (
    <>
      <div className={cn("grid gap-4", cols, className)}>
        {items.map((it, i) => (
          <button
            key={it.key ?? it.src}
            type="button"
            onClick={() => setOpen(i)}
            className="group rounded-2xl text-left transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            aria-label={`Ampliar: ${it.alt}`}
          >
            <StageImage ratio="4/3" sizes="(min-width: 768px) 33vw, 50vw" {...it} caption={undefined} credit={undefined} imgClassName="transition-transform duration-500 group-hover:scale-105" />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {current && open != null && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col bg-black/85 p-4 backdrop-blur-sm sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-label={current.alt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
          >
            <div className="flex items-center justify-between text-white">
              <span className="font-mono text-xs tracking-[0.2em]">
                {String(open + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
              </span>
              <button type="button" onClick={() => setOpen(null)} aria-label="Fechar" className="grid size-10 place-items-center rounded-full hover:bg-white/10">
                <X size={22} />
              </button>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center gap-3" onClick={(e) => e.stopPropagation()}>
              <button type="button" onClick={() => go(-1)} aria-label="Anterior" className="hidden size-12 shrink-0 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:grid">
                <ChevronLeft size={24} />
              </button>
              <motion.div
                key={open}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="relative h-full w-full max-w-5xl overflow-hidden rounded-tl-[2rem] rounded-br-[2rem]"
              >
                <Image src={current.src} alt={current.alt} fill sizes="100vw" unoptimized={current.unoptimized} className="object-contain" />
              </motion.div>
              <button type="button" onClick={() => go(1)} aria-label="Próxima" className="hidden size-12 shrink-0 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:grid">
                <ChevronRight size={24} />
              </button>
            </div>
            {(current.caption || current.credit) && (
              <div className="mx-auto mt-4 max-w-3xl text-center text-white" onClick={(e) => e.stopPropagation()}>
                {current.caption && <p className="font-semibold">{current.caption}</p>}
                {current.credit && <p className="stage-label mt-1 text-white/55">{current.credit}</p>}
              </div>
            )}
            <div className="mt-4 flex justify-center gap-3 sm:hidden" onClick={(e) => e.stopPropagation()}>
              <button type="button" onClick={() => go(-1)} aria-label="Anterior" className="grid size-11 place-items-center rounded-full bg-white/10 text-white">
                <ChevronLeft size={22} />
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Próxima" className="grid size-11 place-items-center rounded-full bg-white/10 text-white">
                <ChevronRight size={22} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ============================================================== UPLOAD */

type Picked = { id: string; file: File; url: string; kind: "image" | "video" };

/**
 * MediaDropzone — arrastar e soltar imagens/vídeos, com prévias.
 * Não envia nada: entrega os arquivos em `onChange` para a tela decidir
 * (upload para o R2, anexo do StageBook etc.).
 */
export function MediaDropzone({
  accept = "image/*,video/*",
  maxFiles = 6,
  maxSizeMB = 50,
  label = "Arraste fotos e vídeos aqui",
  hint,
  onChange,
  className,
}: {
  accept?: string;
  maxFiles?: number;
  maxSizeMB?: number;
  label?: string;
  hint?: string;
  onChange?: (files: File[]) => void;
  className?: string;
}) {
  const inputId = useId();
  const [items, setItems] = useState<Picked[]>([]);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => () => itemsRef.current.forEach((i) => URL.revokeObjectURL(i.url)), []);

  const accepts = (f: File) =>
    accept.split(",").some((rule) => {
      const r = rule.trim();
      if (r.endsWith("/*")) return f.type.startsWith(r.slice(0, -1));
      if (r.startsWith(".")) return f.name.toLowerCase().endsWith(r.toLowerCase());
      return f.type === r;
    });

  const add = (list: FileList | null) => {
    if (!list) return;
    setError(null);
    const next: Picked[] = [];
    for (const f of Array.from(list)) {
      if (!accepts(f)) {
        setError(`"${f.name}" não é um formato aceito.`);
        continue;
      }
      if (f.size > maxSizeMB * 1024 * 1024) {
        setError(`"${f.name}" passa de ${maxSizeMB} MB.`);
        continue;
      }
      next.push({ id: `${f.name}-${f.size}-${f.lastModified}`, file: f, url: URL.createObjectURL(f), kind: f.type.startsWith("video") ? "video" : "image" });
    }
    setItems((prev) => {
      const merged = [...prev, ...next.filter((n) => !prev.some((p) => p.id === n.id))];
      if (merged.length > maxFiles) {
        setError(`Máximo de ${maxFiles} arquivos.`);
        merged.slice(maxFiles).forEach((m) => URL.revokeObjectURL(m.url));
      }
      const kept = merged.slice(0, maxFiles);
      onChange?.(kept.map((k) => k.file));
      return kept;
    });
  };

  const remove = (id: string) =>
    setItems((prev) => {
      const gone = prev.find((p) => p.id === id);
      if (gone) URL.revokeObjectURL(gone.url);
      const kept = prev.filter((p) => p.id !== id);
      onChange?.(kept.map((k) => k.file));
      return kept;
    });

  return (
    <div className={cn("space-y-4", className)}>
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          add(e.dataTransfer.files);
        }}
        className={cn(
          "stage-paper flex cursor-pointer flex-col items-center gap-3 rounded-tl-[2rem] rounded-br-[2rem] border-2 border-dashed px-6 py-10 text-center transition-all",
          drag ? "-translate-y-0.5 border-primary bg-primary/5 shadow-[4px_4px_0_0_var(--color-primary)]" : "border-base-content/25 bg-base-200/40 hover:border-primary/50",
        )}
      >
        <span className={cn("stage-noise stage-shadow-sm grid size-14 place-items-center rounded-tl-xl rounded-br-xl transition-transform", drag ? "rotate-6 bg-primary text-primary-content" : "bg-base-100")}>
          <CloudUpload size={26} />
        </span>
        <span className="text-lg font-black tracking-tight">{label}</span>
        <span className="text-sm text-base-content/60">
          {hint ?? `ou clique para escolher · até ${maxFiles} arquivos de ${maxSizeMB} MB`}
        </span>
        <input id={inputId} type="file" accept={accept} multiple className="sr-only" onChange={(e) => add(e.target.files)} />
      </label>

      {error && (
        <p role="alert" className="text-sm font-semibold text-error">
          {error}
        </p>
      )}

      {items.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {items.map((it) => (
            <li key={it.id} className="stage-paper stage-ink group relative overflow-hidden rounded-xl bg-base-100">
              <div className="relative aspect-[4/3] bg-base-200">
                {it.kind === "image" ? (
                  <img src={it.url} alt={it.file.name} className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <video src={it.url} muted playsInline className="absolute inset-0 h-full w-full object-cover" />
                )}
                <span className="stage-label absolute left-2 top-2 z-10 flex items-center gap-1 rounded-tl-md rounded-br-md bg-base-100 px-1.5 py-0.5">
                  {it.kind === "image" ? <ImageIcon size={11} /> : <Film size={11} />}
                  {it.kind === "image" ? "Foto" : "Vídeo"}
                </span>
                <button
                  type="button"
                  onClick={() => remove(it.id)}
                  aria-label={`Remover ${it.file.name}`}
                  className="absolute right-2 top-2 z-10 grid size-7 place-items-center rounded-full bg-base-100/90 opacity-100 transition hover:bg-error hover:text-error-content sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="relative z-10 px-3 py-2">
                <p className="truncate text-xs font-semibold">{it.file.name}</p>
                <p className="font-mono text-[10px] text-base-content/50">{(it.file.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
