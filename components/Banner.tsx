import { Newspaper } from "lucide-react";
import Link from "next/link";

export default function Banner() {
  return (
    <div className="alert alert-info alert-soft rounded-none border-x-0 border-t-0">
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
        <Newspaper className="h-6 w-6 shrink-0 self-start" />

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold">Portal de notícias!</span>
          </div>

          <p className="mt-1 text-sm leading-relaxed">
            Acompanhe as últimas notícias, lançamentos e melhorias do RoboStage em primeira mão.
          </p>

          <Link href="/news" className="btn btn-sm btn-info mt-3">
            Ver notícias
          </Link>
        </div>
      </div>
    </div>
  );
}