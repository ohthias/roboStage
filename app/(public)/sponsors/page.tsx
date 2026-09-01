"use client";
import Link from "next/link";
import { ArrowRight, Code2, Heart, Share2 } from "lucide-react";

import { Footer } from "@/components/UI/Footer";
import { Navbar } from "@/components/UI/Navbar";

export default function SupportPage() {
  return (
    <>
      <Navbar />

      <main>
        {/* HERO */}
        <section className="relative flex min-h-[75vh] items-center overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] bg-[size:64px_64px] opacity-[0.025]" />

          <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />

          <div className="relative mx-auto w-full max-w-5xl px-6 py-32 text-center lg:px-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Heart className="h-7 w-7" />
            </div>

            <p className="mt-8 text-sm font-bold uppercase tracking-[0.25em] text-primary">
              Apoie o RoboStage
            </p>

            <h1 className="mx-auto mt-5 max-w-4xl text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              Ajude a manter a
              <span className="block text-primary">
                robótica em movimento.
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-base-content/60">
              O RoboStage é construído para a comunidade de robótica.
              Seu apoio ajuda o projeto a continuar criando ferramentas,
              experiências e novas possibilidades.
            </p>

            <div className="mt-9 flex justify-center">
              <Link
                href="#como-apoiar"
                className="btn btn-primary btn-lg gap-2"
              >
                Quero apoiar
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* COMO APOIAR */}
        <section
          id="como-apoiar"
          className="border-y border-base-content/10"
        >
          <div className="mx-auto max-w-5xl px-6 py-24 lg:px-8">
            <div className="grid gap-12 md:grid-cols-3">
              <SupportItem
                icon={<Code2 className="h-5 w-5" />}
                title="Código"
                text="Contribua com o desenvolvimento do RoboStage."
                href="https://github.com/ohthias/roboStage"
              />

              <SupportItem
                icon={<Share2 className="h-5 w-5" />}
                title="Divulgação"
                text="Compartilhe o RoboStage com sua equipe e comunidade."
                href="#compartilhe"
              />

              <SupportItem
                icon={<Heart className="h-5 w-5" />}
                title="Financeiro"
                text="Ajude a manter a infraestrutura e o desenvolvimento."
                href="#financeiro"
              />
            </div>
          </div>
        </section>

        {/* IMPACTO */}
        <section className="mx-auto max-w-5xl px-6 py-28 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                O seu apoio
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                Pequenos apoios
                <span className="block text-base-content/40">
                  geram grandes possibilidades.
                </span>
              </h2>
            </div>

            <div className="space-y-5 text-base leading-7 text-base-content/60">
              <p>
                O apoio ao RoboStage contribui diretamente para a manutenção
                da plataforma e para o desenvolvimento de novas ferramentas.
              </p>

              <p>
                Mais do que manter um site no ar, queremos criar um espaço
                onde equipes, mentores, competidores e entusiastas possam
                aprender, testar e compartilhar.
              </p>
            </div>
          </div>
        </section>

        {/* FINANCEIRO */}
        <section
          id="financeiro"
          className="border-t border-base-content/10 bg-base-200/40"
        >
          <div className="mx-auto max-w-3xl px-6 py-24 text-center lg:px-8">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
              Apoio financeiro
            </p>

            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              Quer contribuir diretamente?
            </h2>

            <p className="mt-5 text-base-content/60">
              Estamos preparando uma forma simples e transparente de apoiar
              financeiramente o RoboStage.
            </p>

            <button className="btn btn-primary mt-8" disabled>
              Em breve
            </button>
          </div>
        </section>

        {/* COMPARTILHE */}
        <section
          id="compartilhe"
          className="mx-auto max-w-5xl px-6 py-24 lg:px-8"
        >
          <div className="rounded-3xl bg-primary p-8 text-primary-content sm:p-12">
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-3xl font-black">
                  Conhece alguém que deveria conhecer o RoboStage?
                </h2>

                <p className="mt-3 max-w-xl text-primary-content/70">
                  Compartilhe a plataforma com sua equipe, mentor ou comunidade.
                </p>
              </div>

              <button
                className="btn btn-neutral shrink-0"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: "RoboStage",
                      text: "Conheça o RoboStage.",
                      url: window.location.origin,
                    });
                  }
                }}
              >
                Compartilhar
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* FINAL */}
        <section className="border-t border-base-content/10">
          <div className="mx-auto max-w-4xl px-6 py-32 text-center lg:px-8">
            <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
              Feito pela comunidade.
              <span className="block text-primary">
                Para a comunidade.
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-base-content/50">
              Obrigado por fazer parte do próximo estágio do RoboStage.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

function SupportItem({
  icon,
  title,
  text,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="group"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-base-200 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-content">
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-bold">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-base-content/50">
        {text}
      </p>

      <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-primary">
        Saiba mais
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}