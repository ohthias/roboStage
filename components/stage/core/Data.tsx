import type { ReactNode } from "react";
import { cn, toneFill, type Tone } from "../lib";
import { Mascot } from "../decor/Stickers";

/* ------------------------------------------------------------------ */
/*  Exibição de dados: avatar, progresso, estado vazio, skeleton.      */
/* ------------------------------------------------------------------ */

const avatarTones: Tone[] = ["primary", "secondary", "accent", "info", "success", "warning"];

function hashTone(seed: string): Tone {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return avatarTones[h % avatarTones.length];
}

/** Avatar de equipe/pessoa com iniciais; cor estável a partir do nome. */
export function TeamAvatar({
  name,
  src,
  size = 40,
  tone,
  className,
}: {
  name: string;
  src?: string;
  size?: number;
  tone?: Tone;
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .filter((w) => /^[\p{L}\p{N}]/u.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <span
      className={cn(
        "inline-grid shrink-0 place-items-center overflow-hidden rounded-full font-black tracking-tight ring-2 ring-base-100",
        toneFill[tone ?? hashTone(name)],
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      title={name}
    >
      {src ? <img src={src} alt={name} className="size-full object-cover" /> : initials}
    </span>
  );
}

export function AvatarStack({ names, max = 4, size = 34 }: { names: string[]; max?: number; size?: number }) {
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  return (
    <div className="flex items-center">
      {shown.map((n, i) => (
        <TeamAvatar key={n} name={n} size={size} className={i > 0 ? "-ml-2.5" : ""} />
      ))}
      {rest > 0 && (
        <span
          className="-ml-2.5 inline-grid place-items-center rounded-full bg-base-200 text-xs font-bold ring-2 ring-base-100"
          style={{ width: size, height: size }}
        >
          +{rest}
        </span>
      )}
    </div>
  );
}

/** Barra de progresso grossa com valor. */
export function ChunkyProgress({
  value,
  max = 100,
  tone = "primary",
  label,
  showValue = true,
  className,
}: {
  value: number;
  max?: number;
  tone?: Tone;
  label?: ReactNode;
  showValue?: boolean;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-baseline justify-between gap-2 text-xs font-semibold">
          <span className="opacity-75">{label}</span>
          {showValue && <span className="font-mono font-bold">{Math.round(pct)}%</span>}
        </div>
      )}
      <div
        className="h-2.5 overflow-hidden rounded-full bg-base-300"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500 ease-out",
            toneFill[tone],
            "bg-[repeating-linear-gradient(-45deg,transparent_0_6px,rgb(255_255_255/0.22)_6px_12px)]",
          )}
          style={{ width: `${pct}%`, backgroundColor: `var(--color-${tone === "ink" ? "base-content" : tone === "paper" ? "base-300" : tone})` }}
        />
      </div>
    </div>
  );
}

/** Estado vazio com o mascote. */
export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "stage-paper flex flex-col items-center gap-4 rounded-tl-[2rem] rounded-br-[2rem] border border-dashed border-base-content/25 bg-base-200/40 px-6 py-10 text-center",
        className,
      )}
    >
      <Mascot size={84} motion="float" />
      <div>
        <h3 className="text-2xl font-black tracking-tight">{title}</h3>
        {description && <p className="mx-auto mt-2 max-w-sm text-sm text-base-content/65">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/** Skeleton no estilo (blocos creme com contorno tracejado). */
export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-xl bg-base-300/70", className)} />;
}
