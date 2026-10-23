import type { CSSProperties } from "react";

/** Iniciais (até 2) de um nome. */
export function initialsOf(name: string | null | undefined): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

/** Cor estável por nome — cada equipe ganha o "ladrilho" colorido, como no Microsoft Teams. */
export function tileStyle(seed: string): CSSProperties {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return { backgroundColor: `hsl(${h % 360} 48% 40%)`, color: "#fff" };
}

const SIZE = {
  xs: "size-7 rounded-md text-[10px]",
  sm: "size-9 rounded-lg text-xs",
  md: "size-11 rounded-xl text-sm",
  lg: "size-16 rounded-2xl text-xl",
} as const;

/** Ladrilho quadrado da equipe: logo da Organização (Clerk) ou iniciais coloridas. */
export function TeamAvatar({
  name,
  imageUrl,
  size = "md",
  className = "",
}: {
  name: string;
  imageUrl?: string | null;
  size?: keyof typeof SIZE;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 select-none items-center justify-center overflow-hidden font-semibold ${SIZE[size]} ${className}`}
      style={imageUrl ? undefined : tileStyle(name)}
      aria-hidden="true"
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- logo de Organization do Clerk, host externo dinâmico
        <img src={imageUrl} alt="" className="size-full object-cover" />
      ) : (
        initialsOf(name)
      )}
    </span>
  );
}

/** Avatar redondo de pessoa (daisyUI `avatar`), com iniciais quando não há foto. */
export function PersonAvatar({
  name,
  imageUrl,
  size = "size-9",
}: {
  name: string | null;
  imageUrl: string | null;
  size?: string;
}) {
  return (
    <div className={`avatar ${imageUrl ? "" : "avatar-placeholder"}`}>
      <div className={`${size} rounded-full ${imageUrl ? "" : "bg-primary/15 text-primary"}`}>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- avatar vindo do Clerk
          <img src={imageUrl} alt="" />
        ) : (
          <span className="text-xs font-semibold">{initialsOf(name)}</span>
        )}
      </div>
    </div>
  );
}
