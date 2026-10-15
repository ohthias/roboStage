import { ArrowUpRight, Newspaper } from "lucide-react";
import Link from "next/link";

export default function Banner() {
  return (
    <section className="group relative isolate w-full overflow-hidden border-y border-info/20 bg-gradient-to-r from-info/10 via-base-100 to-base-200/80">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-20 -z-10 size-64 rounded-full border-[36px] border-info/5 transition-transform duration-500 group-hover:scale-105"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-60 [background:radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.10),transparent_40%)]"
      />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-7 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-tl-xl rounded-br-xl bg-info/15 text-info ring-1 ring-info/20 transition-transform duration-300 group-hover:scale-105 sm:size-14">
            <Newspaper className="size-6 sm:size-7" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-black tracking-tight text-base-content sm:text-xl">
                Portal de notícias
              </h2>
            </div>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-base-content/70 sm:text-base">
              Acompanhe as últimas notícias, lançamentos e melhorias do
              RoboStage em primeira mão.
            </p>
          </div>
        </div>

        <Link
          href="/news"
          className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-tl-xl rounded-br-xl bg-info px-5 py-3 text-sm font-bold text-info-content shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 lg:w-auto"
        >
          Ver notícias
          <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </section>
  );
}