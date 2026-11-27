"use client";
import Image from "next/image";
import Link from "next/link";
import { asset } from "@/lib/assets";
import { Sparkle } from "@/components/stage";
import type { MissionsData } from "../types";
import ScoreCalculator from "@/features/scoring/future-edition/components/ScoreCalculator";
import Timer from "@/features/scoring/components/Timer";

/** Pontuador da Future Edition; os dados chegam prontos do servidor. */
export default function FutureEditionScoreClient({ data }: { data: MissionsData }) {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-10 pt-8">
      <header className="stage-night stage-texture relative isolate overflow-hidden rounded-tl-[2rem] rounded-br-[2rem] shadow-[8px_8px_0_0_#C8F77A]">
        <Sparkle size={34} color="#C8F77A" motion="float" className="pointer-events-none absolute right-8 top-6 hidden md:inline-grid" />
        <div className="flex flex-col gap-6 px-6 py-8 sm:flex-row sm:items-center sm:px-10">
          <div className="grid size-28 shrink-0 place-items-center rounded-tl-2xl rounded-br-2xl border border-[#C8F77A]/25 bg-[#C8F77A]/[0.06]">
            <Image
              src={asset("/images/seasons/fll/bioglow_logo_future_edition.webp")}
              alt="BIOGLOW Future Edition"
              width={1726}
              height={1225}
              sizes="96px"
              priority
              className="h-auto w-24"
            />
          </div>
          <div className="min-w-0">
            <nav aria-label="Trilha" className="stage-kicker text-white/55">
              <Link href="/fll" className="hover:text-white">
                /FLL
              </Link>{" "}
              /{" "}
              <Link href="/fll/future-edition" className="hover:text-white">
                FUTURE EDITION
              </Link>{" "}
              / PONTUADOR
            </nav>
            <h1 className="stage-display mt-2 text-4xl text-white sm:text-5xl">
              <span className="inline-block -rotate-1 bg-[#C8F77A] px-3 py-1 italic text-[#20320C]">BIOGLOW</span>{" "}
              <span className="text-2xl sm:text-3xl">Future Edition</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/70 sm:text-base">
              Baseado nos kits LEGO® Education Computer Science & AI. Marque cada objetivo e a pontuação soma sozinha.
            </p>
          </div>
        </div>
      </header>

      <Timer duration={150} startSound={asset("/audio/start.mp3")} endSound={asset("/audio/end.mp3")} />

      <ScoreCalculator data={data} />
    </main>
  );
}
