import type { ReactNode } from "react";
import { DisplayHeading, Sparkle, Starburst, cn } from "@/components/stage";

type HeaderProps = {
  type: string;
  name: string;
  highlight: string;
  description: string;
  /** Conteúdo extra abaixo da descrição (botões, selos etc.). Opcional. */
  children?: ReactNode;
  className?: string;
};

// Cabeçalho das ferramentas e recursos do RoboStage, na Stage UI:
// papel texturizado, canto recortado, sombra dura azul, kicker mono,
// destaque inclinado e 2 stickers de tempero.
export default function Header({ type, name, highlight, description, children, className }: HeaderProps) {
  return (
    <section
      className={cn(
        "stage-paper relative isolate overflow-hidden rounded-tl-[2rem] rounded-br-[2rem] border border-base-300 bg-base-100 shadow-[8px_8px_0_0_var(--color-secondary)]",
        className,
      )}
    >
      {/* Grade de pontos que some para a direita */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 text-base-content opacity-[0.1] [background-image:radial-gradient(currentColor_0.8px,transparent_0.8px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]"
      />

      <Starburst
        size={84}
        tone="accent"
        motion="spin"
        className="pointer-events-none absolute right-10 top-8 hidden lg:inline-grid"
      />
      <Sparkle
        size={30}
        tone="secondary"
        motion="float"
        className="pointer-events-none absolute bottom-10 right-32 hidden lg:inline-grid"
      />

      <div className="relative px-6 py-10 sm:px-10 md:px-12 md:py-14">
        <div className="max-w-3xl">
          <p className="stage-kicker inline-flex items-center gap-2 rounded-tl-lg rounded-br-lg border border-base-content/15 bg-base-100/70 px-3 py-1.5 text-base-content/65 backdrop-blur">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
            ROBOSTAGE <span className="text-base-content/30">/</span> {type.toUpperCase()}
          </p>

          <DisplayHeading as="h1" size="md" highlight={highlight || undefined} className="mt-5">
            {name}
          </DisplayHeading>

          <p className="mt-5 max-w-2xl text-base leading-7 text-base-content/65 sm:text-lg">{description}</p>

          {children && <div className="mt-7 flex flex-wrap items-center gap-3">{children}</div>}
        </div>
      </div>
    </section>
  );
}
