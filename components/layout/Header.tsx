import type { ReactNode } from "react";

type HeaderProps = {
  type: string;
  name: string;
  highlight: string;
  description: string;
  /** Conteúdo extra abaixo da descrição (botões, selos etc.). Opcional. */
  children?: ReactNode;
};

// Cabeçalho das ferramentas e recursos do RoboStage, no visual do Anatix:
// cantos assimétricos, sombra sólida, rótulo em fonte mono e destaque inclinado.
export default function Header({
  type,
  name,
  highlight,
  description,
  children,
}: HeaderProps) {
  return (
    <section className="relative isolate overflow-hidden rounded-tl-[2rem] rounded-br-[2rem] border border-base-300 bg-base-100 shadow-[8px_8px_0_0_var(--color-secondary)]">
      {/* Fundo: brilhos e grade de pontos */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-24 -top-32 size-80 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-40 right-0 size-96 rounded-full bg-secondary/15 blur-3xl" />
        <div className="absolute inset-0 text-base-content opacity-[0.12] [background-image:radial-gradient(currentColor_0.8px,transparent_0.8px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]" />
      </div>

      {/* Formas decorativas */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-10 top-10 hidden size-20 rotate-12 rounded-tl-2xl rounded-br-2xl bg-accent lg:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 right-28 hidden size-14 rounded-full border-2 border-dashed border-secondary/50 lg:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -bottom-16 hidden size-48 rounded-full border border-base-300 lg:block"
      />

      <div className="relative px-6 py-10 sm:px-10 md:px-12 md:py-14">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-tl-lg rounded-br-lg border border-base-content/15 bg-base-100/70 px-3 py-1.5 font-mono text-[11px] tracking-[0.18em] text-base-content/65 backdrop-blur">
            <span
              className="size-1.5 rounded-full bg-primary"
              aria-hidden="true"
            />
            ROBOSTAGE <span className="text-base-content/30">/</span>{" "}
            {type.toUpperCase()}
          </p>

          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            {name}
            {highlight && (
              <>
                {" "}
                <span className="mt-2 inline-block -rotate-1 bg-primary px-3 py-1 italic text-primary-content">
                  {highlight}
                </span>
              </>
            )}
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-base-content/65 sm:text-lg">
            {description}
          </p>

          {children && (
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}