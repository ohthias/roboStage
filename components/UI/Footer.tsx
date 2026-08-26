import Link from "next/link";
import Image from "next/image";
import pkg from "@/package.json";
import Logo from "./Logo";
import { communities } from "@/utils/institutional/community";
import {
  Cuboid,
  MessageSquare,
  Clock,
  FlaskConical,
  Trophy,
  Bug,
} from "lucide-react";

const tools = [
  {
    name: "QuickBrick Studio",
    description: "Planeje suas missões e estratégias.",
    href: "/fll/quickbrick",
    icon: Cuboid,
  },
  {
    name: "LabTest",
    description: "Teste, analise e evolua seu robô.",
    href: "/labtest",
    icon: FlaskConical,
  },
  {
    name: "Pontuadores",
    description: "Acompanhe e simule sua pontuação.",
    href: "/fll/score",
    icon: Trophy,
  },
  {
    name: "Timers",
    description: "Gerencie seu tempo durante as competições.",
    href: "/fll/timers",
    icon: Clock,
  },
  {
    name: "Recall",
    description: "Treine para perguntas e entrevistas.",
    href: "/fll/recall",
    icon: MessageSquare,
  },
];

export function Footer() {
  return (
    <footer className="border-t border-base-300 bg-base-100">
      {/* Ferramentas */}
      <section className="relative overflow-hidden border border-base-300 bg-base-200/50 ">
        {/* Decorative grid */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.035] z-1"
          style={{
            backgroundImage:
              "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="mx-auto max-w-7xl px-6 py-16 z-2 relative">
          <div className="mb-8 flex flex-col gap-2">
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-primary">
              Ferramentas da temporada
            </span>

            <h2 className="text-2xl font-semibold tracking-tight">
              Tudo em um só lugar.
            </h2>

            <p className="max-w-2xl text-sm leading-relaxed text-base-content/60">
              Um conjunto de ferramentas para acompanhar sua equipe desde o
              planejamento até o torneio.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {tools.map((tool) => (
              <Link
                key={tool.name}
                href={tool.href}
                className="group rounded-2xl border border-base-300 bg-base-100 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-base-200"
              >
                <div className="mb-5 flex size-9 items-center justify-center rounded-xl bg-base-200 text-base-content/70 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                  <tool.icon className="text-sm" />
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-medium">{tool.name}</h3>

                    <p className="mt-1.5 text-xs leading-relaxed text-base-content/55">
                      {tool.description}
                    </p>
                  </div>

                  <i className="fi fi-rr-arrow-small-right mt-0.5 shrink-0 text-xs text-base-content/30 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Navegação principal */}
      <section>
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
            {/* Brand */}
            <div className="max-w-sm">
              <Link href="/" className="inline-flex items-center gap-3">
                <Image
                  src="/images/logos/logo_padrao.png"
                  alt="RoboStage"
                  width={40}
                  height={40}
                  className="size-10"
                />

                <Logo logoSize="sm" />
              </Link>
              <p className="mt-5 text-sm leading-relaxed text-base-content/60">
                O palco onde a robótica acontece. Uma plataforma para equipes
                planejarem, testarem, aprenderem e evoluírem juntas.
              </p>
              {/* Social */}
              <div className="mt-6 flex items-center gap-1">
                <a
                  href="https://github.com/ohthias/roboStage"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="btn btn-circle btn-ghost btn-sm text-base-content/60 hover:text-base-content"
                >
                  <i className="fi fi-brands-github text-base" />
                </a>
                <a
                  href="https://www.instagram.com/robo.stage"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="btn btn-circle btn-ghost btn-sm text-base-content/60 hover:text-base-content"
                >
                  <i className="fi fi-brands-instagram text-base" />
                </a>
              </div>
            </div>

            {/* Plataforma */}
            <div>
              <h3 className="footer-title">Plataforma</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link href="/fll/quickbrick" className="link link-hover">
                    QuickBrick Studio
                  </Link>
                </li>
                <li>
                  <Link href="/labtest" className="link link-hover">
                    LabTest
                  </Link>
                </li>
                <li>
                  <Link href="/fll/score" className="link link-hover">
                    Pontuadores
                  </Link>
                </li>
                <li>
                  <Link href="/recall" className="link link-hover">
                    Recall
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="link link-hover">
                    Minha área
                  </Link>
                </li>
              </ul>
            </div>

            {/* Competições */}
            <div>
              <h3 className="footer-title">Competições</h3>

              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link href="/fll" className="link link-hover">
                    FIRST® LEGO® League Challegue
                  </Link>
                </li>
                <li>
                  <Link href="/fll/future-edition" className="link link-hover">
                    FIRST® LEGO® League Future Edition
                  </Link>
                </li>
                <li>
                  <Link href="/robostage-canopy" className="link link-hover">
                    FIRST® CANOPY™
                  </Link>
                </li>
              </ul>

              <div className="mt-8">
                <h3 className="footer-title">Sua conta</h3>

                <ul className="mt-4 space-y-2.5 text-sm">
                  <li>
                    <Link href="/sign-in" className="link link-hover">
                      Entrar
                    </Link>
                  </li>

                  <li>
                    <Link href="/sign-up" className="link link-hover">
                      Criar conta
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Explore */}
            <div>
              <h3 className="footer-title">Explore</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link href="/about" className="link link-hover">
                    Sobre o RoboStage
                  </Link>
                </li>
                <li>
                  <Link href="/news" className="link link-hover">
                    Notícias
                  </Link>
                </li>
                <li>
                  <Link href="/changelog" className="link link-hover">
                    Changelog
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="link link-hover">
                    Central de ajuda
                  </Link>
                </li>
                <li>
                  <Link href="/assets" className="link link-hover">
                    Assets
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://github.com/ohthias/roboStage/issues"
                    className="link link-hover"
                  >
                    <Bug className="mr-1.5 inline-block text-base-content/50" size={16} />
                    Reportar um bug
                  </Link>
                </li>

                {communities.length > 0 && (
                  <li className="pt-4">
                    <span className="text-xs font-medium text-base-content/40">
                      Comunidade
                    </span>

                    <ul className="mt-2 space-y-2">
                      {communities.map((community) => (
                        <li key={community.name}>
                          <a
                            href={community.urlSocial}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link link-hover"
                          >
                            {community.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom bar */}
      <div className="border-t border-base-300">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 text-xs text-base-content/50 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>© {new Date().getFullYear()} RoboStage</span>

            <span className="hidden text-base-content/20 md:inline">•</span>

            <span>Feito para a comunidade de robótica</span>

            <span className="hidden text-base-content/20 md:inline">•</span>

            <span>v{pkg.version}</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link href="/legal/terms" className="link link-hover">
              Termos
            </Link>

            <Link href="/legal/privacy" className="link link-hover">
              Privacidade
            </Link>

            <Link href="/licences" className="link link-hover">
              Licenças
            </Link>

            <a
              href="mailto:robostage.dev@gmail.com"
              className="link link-hover"
            >
              Contato
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
