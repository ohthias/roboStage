import { Newspaper } from "lucide-react";
import Link from "next/link";

export default function Banner() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-info/20 bg-gradient-to-br from-info/15 via-base-100 to-base-200 px-4 py-4 shadow-sm sm:px-6">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.12),transparent_40%)]" />

      <div className="relative flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-info/15 text-info ring-1 ring-info/20">
            <Newspaper className="h-5 w-5" />
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-bold text-base-content">
                Portal de notícias!
              </span>
            </div>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-base-content/80">
              Acompanhe as últimas notícias, lançamentos e melhorias do RoboStage em primeira mão.
            </p>
          </div>
        </div>

        <Link href="/news" className="btn btn-info btn-sm shadow-sm transition-transform hover:-translate-y-0.5 sm:self-center">
            Ver notícias
          </Link>
      </div>
    </div>
  );
}