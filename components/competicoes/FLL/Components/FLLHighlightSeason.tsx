import Image from "next/image";
import { ArrowRight, BookOpen, Clock, Cuboid, Trophy, Users, type LucideIcon } from "lucide-react";
import { ButtonLink, Flower, Kicker, Marquee, Reveal, SectionEdge, Sparkle, StickerTag } from "@/components/stage";

/** Verde-noite da BIOGLOW: fundo da faixa e cor da borda de baixo. */
const NIGHT = "#07110A";
const LIME = "#8CC63F";

const facts: { icon: LucideIcon; value: string; label: string }[] = [
  { icon: Trophy, value: "15", label: "missões no tapete" },
  { icon: Clock, value: "2:30", label: "por rodada" },
  { icon: Users, value: "4", label: "frentes avaliadas" },
];

/** Missões da BIOGLOW (mesmos nomes de public/data/missions.json). */
const missions = [
  "M01 Inspeção por drone",
  "M02 Sementes explosivas",
  "M03 Vire a pedra",
  "M04 Folhas da sorte",
  "M05 Raízes compridas",
  "M06 Formigas-cortadeiras",
  "M07 Fungo enorme",
  "M08 Emaranhado",
  "M09 Plataforma de pesquisa",
  "M10 Microhabitats frágeis",
  "M11 Janela para o passado",
  "M12 Ancião da floresta",
  "M13 Espécie-chave",
  "M14 Sementes de renovação",
  "M15 Arquitetura biocêntrica",
];

/**
 * Destaque da temporada atual na home da FLL.
 *
 * Foto de fundo com véu escuro que termina em verde-noite sólido, para emendar
 * na borda de onda (WaveEdge) que desce sobre a seção seguinte. Fecha com uma
 * fita (Marquee) com as 15 missões.
 */
export default function FLLHighlightSeason() {
  // z-10: a borda de onda desce sobre a seção seguinte, que vem depois no DOM.
  return (
    <section className="group/season relative z-10" style={{ backgroundColor: NIGHT }}>
      <div className="relative isolate overflow-hidden">
        {/* Fundo: wrapper com -z-20 porque o stage.css põe z-index 0 em <img> de seções texturizadas. */}
        <div aria-hidden="true" className="absolute inset-0 -z-20 overflow-hidden">
          <Image
            src="/images/showLive/backgrounds/background_bioglow.webp"
            alt=""
            fill
            sizes="100vw"
            className="object-cover transition-transform duration-1000 ease-out group-hover/season:scale-[1.02] motion-reduce:transition-none"
          />
        </div>
        {/* Véu: escuro à esquerda para o texto e sólido embaixo para a borda de onda. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            background: `linear-gradient(to top, ${NIGHT} 0%, ${NIGHT} 22%, transparent 58%), linear-gradient(to right, rgb(0 0 0 / 0.9), rgb(0 0 0 / 0.68) 50%, rgb(0 0 0 / 0.35))`,
          }}
        />

        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-16 pt-24 sm:pb-20 sm:pt-28 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10 [&>*]:min-w-0">
          {/* ------------------------------------------------------- texto */}
          <Reveal>
            <div className="flex flex-wrap items-center gap-3">
              <StickerTag tone="accent" size="sm" rotate={-3}>
                Temporada atual
              </StickerTag>
              <Kicker className="text-white/55">FLL CHALLENGE · 2026/2027</Kicker>
            </div>

            <h2 className="stage-display mt-6 text-6xl leading-[0.9] text-white sm:text-7xl xl:text-8xl">
              BIO
              <span className="inline-block -rotate-2 italic" style={{ color: LIME }}>
                GLOW
              </span>
              <span className="sr-only">: temporada 2026/2027 da FIRST LEGO League</span>
            </h2>

            <p className="mt-7 max-w-xl text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
              A biodiversidade mantém nosso planeta saudável. Das menores espécies às árvores imponentes, a
              vida depende de um equilíbrio essencial para sobreviver. Nesta temporada, identifique um
              problema que coloque a biodiversidade em risco e desenvolva uma solução inovadora para ajudar
              a preservá-la.
            </p>

            <dl className="mt-8 grid max-w-xl grid-cols-3 divide-x divide-white/15 border-y border-white/15">
              {facts.map(({ icon: Icon, value, label }) => (
                <div key={label} className="min-w-0 px-3 py-4 first:pl-0">
                  <dt className="sr-only">{label}</dt>
                  <dd className="flex items-center gap-2 text-white">
                    <Icon size={16} className="shrink-0" style={{ color: LIME }} />
                    <span className="stage-display truncate text-xl sm:text-2xl">{value}</span>
                  </dd>
                  <dd className="stage-kicker mt-1 text-white/50">{label}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <ButtonLink
                href="/fll/score/bioglow"
                flat
                iconLeft={<Trophy size={18} />}
                className="border-0 text-[#0b1a07] shadow-[4px_4px_0_0_#ffffff] hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#ffffff]"
                style={{ backgroundColor: LIME }}
              >
                Pontuar a BIOGLOW
              </ButtonLink>
              <ButtonLink
                href="/fll/quickbrick"
                tone="outline"
                iconLeft={<Cuboid size={18} />}
                className="border-white/40 bg-transparent text-white hover:border-white hover:bg-white hover:text-[#0b1a07]"
              >
                Explorar QuickBrick
              </ButtonLink>
              <ButtonLink
                href="/fll/docs"
                tone="ghost"
                shape="rounded"
                iconLeft={<BookOpen size={18} />}
                iconRight={<ArrowRight size={16} />}
                className="text-white hover:bg-white/10"
              >
                Documentações
              </ButtonLink>
            </div>
          </Reveal>

          {/* ------------------------------------------------------- logo */}
          <Reveal delay={120} effect="pop" className="relative mx-auto w-full max-w-[300px] sm:max-w-[440px]">
            {/* Brilho em gradiente radial (sem filter: blur, que pesa) */}
            <div
              aria-hidden="true"
              className="absolute -inset-[15%] -z-10 rounded-full opacity-80 transition-opacity duration-700 group-hover/season:opacity-100"
              style={{ background: `radial-gradient(closest-side, rgb(111 166 28 / 0.35), transparent)` }}
            />
            <div
              aria-hidden="true"
              className="absolute -inset-[6%] -z-10 rounded-full border border-dashed"
              style={{ borderColor: `${LIME}40` }}
            />
            <Flower size={58} color={LIME} motion="spin" className="absolute -left-2 -top-6 z-10" />
            <Sparkle size={30} tone="accent" motion="float" className="absolute -bottom-2 right-4 z-10" />
            <Image
              src="/images/logos/fll/seasons/bioglow_logo.png"
              alt="Logo da temporada BIOGLOW da FIRST LEGO League"
              width={1725}
              height={982}
              sizes="(min-width: 1024px) 440px, 80vw"
              className="h-auto w-full -rotate-2 object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)] transition-transform duration-500 group-hover/season:rotate-0 motion-reduce:transition-none"
            />
          </Reveal>
        </div>

        {/* Fita com as missões da temporada */}
        <div className="relative z-10 pb-10">
          <Marquee
            items={missions}
            tone="ink"
            tilt={-1.5}
            speed={5}
            render={(item) => (
              <span className="stage-display whitespace-nowrap text-xl italic uppercase sm:text-2xl">{item}</span>
            )}
          />
        </div>

        <p className="absolute bottom-3 right-4 text-[10px] text-white/40 sm:right-6">Imagem de fundo: Freepik</p>
      </div>

      {/* Borda de onda descendo sobre a seção seguinte */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-20 translate-y-full">
        <SectionEdge variant="wave" color={NIGHT} direction="down" texture="none" />
      </div>
    </section>
  );
}