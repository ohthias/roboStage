"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeInfo,
  Bot,
  ChevronRight,
  Globe2,
  Leaf,
  Menu,
  Rocket,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  CircuitBoard,
} from "lucide-react";
import { Footer } from "@/components/UI/Footer";

const heroImage =
  "/images/heroImage.jpg";

const programs = [
  {
    title: "BIOGLOW™",
    subtitle: "FIRST® LEGO® League",
    age: "5–16 anos",
    release: "04 de agosto de 2026",
    description:
      "Uma experiência prática para introduzir crianças ao STEM com desafios inspirados na biodiversidade e no pensamento criativo.",
    image:
      "https://www.sistemafibra.org.br/sesi/images/categorias/noticias/2017/11-novembro/robotica-sesisistema-fibra.jpg",
    icon: Leaf,
    accent: "from-emerald-500/20 via-emerald-500/10 to-cyan-500/10",
  },
  {
    title: "BIOBUZZ™",
    subtitle: "FIRST® Tech Challenge",
    age: "12–18 anos",
    release: "12 de setembro de 2026",
    description:
      "Equipes projetam, constroem e programam robôs para um desafio dinâmico, com foco em colaboração, estratégia e inovação.",
    image:
      "https://www.ftcbenelux.eu/wp-content/themes/yootheme/cache/a3/FTC-Championship-2024-door-Thomas-Vugs-2024-02-24-LR067.jpg_compressed-a3c55c3f.jpeg",
    icon: Bot,
    accent: "from-cyan-500/20 via-sky-500/10 to-emerald-500/10",
  },
  {
    title: "BIOCORE™",
    subtitle: "FIRST® Robotics Competition",
    age: "14–18 anos",
    release: "09 de janeiro de 2027",
    description:
      "Robôs de escala industrial, engenharia avançada e uma competição intensa que amplia liderança, organização e solução de problemas.",
    image:
      "https://firstroboticscanada.org/wp-content/uploads/2021/01/frcteamworkingonrobot-2-600x380-1.jpg",
    icon: CircuitBoard,
    accent: "from-lime-500/20 via-emerald-500/10 to-cyan-500/10",
  },
];

const highlights = [
  {
    title: "Biodiversidade",
    text: "A temporada conecta tecnologia e natureza para valorizar ecossistemas.",
    icon: Globe2,
  },
  {
    title: "Inovação",
    text: "Soluções criativas, engenharia prática e robótica aplicada.",
    icon: Sparkles,
  },
  {
    title: "Trabalho em equipe",
    text: "Mentoria, colaboração e crescimento coletivo em cada desafio.",
    icon: Users,
  },
  {
    title: "Impacto real",
    text: "Aprendizado que fortalece confiança, resiliência e pensamento científico.",
    icon: ShieldCheck,
  },
];

function SectionTitle({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="max-w-3xl">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 backdrop-blur">
        <BadgeInfo className="h-4 w-4 text-emerald-400" />
        {eyebrow}
      </div>
      <h2 className="mt-5 text-4xl font-black tracking-tight text-white md:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-slate-300 md:text-lg">
        {text}
      </p>
    </div>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="text-sm font-medium text-slate-200 transition hover:text-white"
    >
      {children}
    </a>
  );
}

export default function RoboStageCanopy() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <main className="bg-[#07111f] text-white">
        {/* NAV */}
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07111f]/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
            <a href="#topo" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-none text-white">
                  RoboStage
                </p>
                <p className="text-xs text-slate-400">FIRST CANOPY™</p>
              </div>
            </a>

            <nav className="hidden items-center gap-8 md:flex">
              <NavLink href="#sobre">Tema</NavLink>
              <NavLink href="#programas">Programas</NavLink>
              <NavLink href="#comunidade">Comunidade</NavLink>
            </nav>

            <div className="hidden md:flex">
              <a
                href="https://www.firstinspires.org/first-canopy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Saiba mais <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-3 md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Abrir menu"
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>

          {menuOpen && (
            <div className="border-t border-white/10 bg-[#08111f] md:hidden">
              <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4">
                <a onClick={() => setMenuOpen(false)} href="#sobre">
                  Tema
                </a>
                <a onClick={() => setMenuOpen(false)} href="#programas">
                  Programas
                </a>
                <a onClick={() => setMenuOpen(false)} href="#linha-do-tempo">
                  Linha do tempo
                </a>
                <a onClick={() => setMenuOpen(false)} href="#comunidade">
                  Comunidade
                </a>
                <a
                  href="https://www.firstinspires.org/first-canopy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-3 font-semibold text-slate-950"
                >
                  Saiba mais <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          )}
        </header>

        {/* HERO */}
        <section
          id="topo"
          className="relative isolate min-h-screen overflow-hidden"
        >
          <div className="absolute inset-0">
            <img
              src={heroImage}
              alt="Floresta inspiradora da temporada Canopy"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,10,20,0.38)_0%,rgba(5,10,20,0.78)_55%,rgba(7,17,31,0.96)_100%)]" />
          </div>

          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -left-24 top-16 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="absolute right-0 top-28 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-lime-400/10 blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center px-4 py-20">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <div className="flex flex-wrap gap-3">
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-200">
                    FIRST® CANOPY™
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
                    Temporada 2026-2027
                  </span>
                </div>

                <h1 className="mt-6 text-6xl font-black leading-none tracking-tight md:text-8xl">
                  CANOPY
                  <span className="align-super text-2xl md:text-4xl">™</span>
                </h1>

                <p className="mt-6 max-w-2xl text-xl leading-relaxed text-slate-200 md:text-2xl">
                  Inspirada pela natureza. Impulsionada pela inovação.
                </p>

                <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">
                  Usando inspiração, aprendizado prático, solução de problemas
                  em equipe, mentoria e celebração, a FIRST ajuda jovens a
                  construir o futuro.
                </p>

                <div className="mt-10 flex flex-wrap gap-4">
                  <a
                    href="#sobre"
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
                  >
                    Explorar temporada <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href="#programas"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white hover:text-slate-950"
                  >
                    Ver programas <ChevronRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SOBRE */}
        <section id="sobre" className="bg-[#091521] py-24">
          <div className="mx-auto max-w-6xl px-4">
              <div>
                <SectionTitle
                  eyebrow="O tema da temporada"
                  title="Engenhe um planeta próspero"
                  text="Nada na Terra prospera sozinho. Cada gene, espécie e ecossistema faz parte de uma rede rica de biodiversidade que sustenta a vida."
                />

                <div className="mt-8 grid gap-4 sm:grid-rows-auto w-full">
                  {highlights.map(({ title, text, icon: Icon }) => (
                    <div
                      key={title}
                      className="group rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-white/8"
                    >
                      <Icon className="h-6 w-6 text-emerald-300 transition group-hover:scale-110" />
                      <h3 className="mt-4 text-lg font-bold">{title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-300">
                        {text}
                      </p>
                    </div>
                  ))}
                </div>
            </div>
          </div>
        </section>

        {/* PROGRAMAS */}
        <section id="programas" className="bg-teal-900 py-24">
          <div className="mx-auto max-w-6xl px-4">
            <SectionTitle
              eyebrow="FIRST® 2026-2027"
              title="Programas STEM para todas as idades"
              text="Crianças e jovens podem participar de um dos três programas da FIRST, com experiências ajustadas por faixa etária e por região."
            />

            <div className="mt-14 grid gap-8 lg:grid-cols-3">
              {programs.map(
                ({
                  title,
                  subtitle,
                  age,
                  release,
                  description,
                  image,
                  icon: Icon,
                  accent,
                }) => (
                  <article
                    key={title}
                    className={`overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b ${accent} shadow-2xl transition duration-300 hover:-translate-y-1 hover:shadow-emerald-950/30`}
                  >
                    <div className="relative h-56">
                      <img
                        src={image}
                        alt={title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#07111f] via-[#07111f]/30 to-transparent" />
                      <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/30 p-3 backdrop-blur">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                    </div>

                    <div className="p-6 md:p-8">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-300">
                          {subtitle}
                        </span>
                        <span className="text-xs uppercase tracking-[0.25em] text-slate-400">
                          {age}
                        </span>
                      </div>

                      <h3 className="mt-5 text-3xl font-black">{title}</h3>
                      <p className="mt-3 text-sm uppercase tracking-[0.25em] text-emerald-200/80">
                        Lançamento: {release}
                      </p>
                      <p className="mt-4 leading-relaxed text-slate-300">
                        {description}
                      </p>
                    </div>
                  </article>
                ),
              )}
            </div>
          </div>
        </section>

        {/* COMUNIDADE */}
        <section id="comunidade" className="bg-[#07111f] py-24">
          <div className="mx-auto max-w-6xl px-4">
            <SectionTitle
              eyebrow="Mais do que robôs"
              title="Uma comunidade global que muda vidas"
              text="A FIRST é mais do que robótica. É uma rede de estudantes, mentores, educadores, voluntários, patrocinadores, pais e ex-alunos dedicados a desenvolver habilidades para o futuro."
            />

            <div className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl">
              <div className="relative h-[320px]">
                <img
                  src="https://community.firstinspires.org/hubfs/20250419BEN01206%20(1).jpg"
                  alt="Equipe colaborando"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07111f] via-[#07111f]/30 to-transparent" />
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden py-24">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#0f3d2e_0%,#166534_45%,#0e7490_100%)]" />
          <div className="absolute inset-0 opacity-20">
            <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-slate-950 blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
            <h2 className="text-4xl font-black md:text-6xl">
              Bem-vindo à FIRST® CANOPY™
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-white/85 md:text-xl">
              Construindo, resolvendo problemas e crescendo mais fortes através
              do trabalho em equipe.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="https://www.firstinspires.org/first-canopy"
                target="_blank"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Saber mais <Rocket className="h-4 w-4" />
              </Link>
              <a
                href="#topo"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white hover:text-slate-950"
              >
                Voltar ao topo <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
