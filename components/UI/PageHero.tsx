import type { ReactNode } from "react";
import { AnimatedBackground } from "@/components/home/shared";
import "@/components/home/home.css";

// Topo das páginas institucionais no visual do Anatix.
export default function PageHero({
  kicker,
  title,
  highlight,
  description,
  actions,
  aside,
}: {
  kicker: string;
  title: string;
  highlight: string;
  description: string;
  actions?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden px-6 pb-20 pt-14 sm:pt-20">
      <AnimatedBackground />
      <div
        className={`mx-auto grid max-w-6xl items-center gap-14 ${aside ? "lg:grid-cols-[1.05fr_1fr]" : ""} [&>*]:min-w-0`}
      >
        <div>
          <p className="font-mono text-xs tracking-[0.2em] text-base-content/45">{kicker}</p>
          <h1 className="mt-5 text-5xl font-bold tracking-tight sm:text-7xl">
            {title}
            <span className="text-primary">.</span>
          </h1>
          <p className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
            <span className="inline-block -rotate-1 bg-accent px-2 text-accent-content">{highlight}</span>
          </p>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-base-content/65 sm:text-lg">{description}</p>
          {actions && <div className="mt-9 flex flex-wrap items-center gap-3">{actions}</div>}
        </div>

        {aside && (
          <div className="relative">
            <div aria-hidden="true" className="absolute -right-4 -top-4 size-24 rotate-12 rounded-tl-2xl rounded-br-2xl bg-accent" />
            <div aria-hidden="true" className="absolute -bottom-5 -left-5 size-20 rounded-full border-2 border-dashed border-secondary/50" />
            <div className="relative overflow-hidden rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 shadow-[8px_8px_0_0_var(--color-secondary)]">
              {aside}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export const heroBtn =
  "btn btn-primary btn-lg rounded-tl-xl rounded-br-xl rounded-tr-none rounded-bl-none shadow-[4px_4px_0_0_var(--color-base-content)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--color-base-content)]";
