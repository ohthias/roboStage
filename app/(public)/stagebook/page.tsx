import { Footer } from "@/components/UI/Footer";
import { Navbar } from "@/components/UI/Navbar";
import {
  BookOpen,
  FileText,
  Lightbulb,
  NotebookPen,
  ArrowRight,
  Users,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "Stagebook",
  description:
    "O Stagebook é o espaço do RoboStage para registrar ideias, estratégias, testes, aprendizados e tudo aquilo que acontece antes de uma solução ganhar vida.",
};

export default function StagebookPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-base-100 text-base-content">
        {/* Hero */}
        <section className="relative overflow-hidden">
          {/* Background grid */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.035]">
            <div
              className="h-full w-full"
              style={{
                backgroundImage: `
                linear-gradient(to right, currentColor 1px, transparent 1px),
                linear-gradient(to bottom, currentColor 1px, transparent 1px)
              `,
                backgroundSize: "32px 32px",
              }}
            />
          </div>

          <div className="relative mx-auto flex min-h-[70vh] max-w-7xl items-center px-6 py-24 lg:px-8">
            <div className="max-w-4xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-200/70 px-4 py-2 text-sm font-medium backdrop-blur">
                <BookOpen className="size-4" />
                Stagebook
              </div>

              <h1 className="text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
                Suas ideias.
                <br />
                <span className="text-primary">Seu processo.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-base-content/70 sm:text-xl">
                O Stagebook é o espaço do RoboStage para registrar ideias,
                estratégias, testes, aprendizados e tudo aquilo que acontece
                antes de uma solução ganhar vida.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button className="btn btn-primary btn-lg">
                  Abrir meu Stagebook
                  <ArrowRight className="size-5" />
                </button>

                <button className="btn btn-ghost btn-lg">
                  Conhecer o Stagebook
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Intro */}
        <section className="border-y border-base-300 bg-base-200/40">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:px-8">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">
                Mais que anotações
              </p>

              <h2 className="text-3xl font-black sm:text-4xl">
                Um lugar para construir o caminho até a solução.
              </h2>
            </div>

            <div className="space-y-5 text-base-content/70">
              <p>
                Nem toda ideia começa pronta. Estratégias mudam, testes falham,
                mecanismos são ajustados e novas possibilidades aparecem.
              </p>

              <p>
                O Stagebook existe para guardar esse processo e transformar
                anotações soltas em conhecimento que pode ser revisitado,
                organizado e evoluído.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">
              O que você pode fazer
            </p>

            <h2 className="text-3xl font-black sm:text-4xl">
              Tudo em um só lugar.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<NotebookPen className="size-6" />}
              title="Registrar"
              description="Crie páginas para documentar ideias, estratégias, reuniões, testes e descobertas."
            />

            <FeatureCard
              icon={<FileText className="size-6" />}
              title="Organizar"
              description="Estruture seus conteúdos para encontrar novamente aquilo que realmente importa."
            />

            <FeatureCard
              icon={<Lightbulb className="size-6" />}
              title="Desenvolver ideias"
              description="Use suas anotações como ponto de partida para transformar possibilidades em soluções."
            />

            <FeatureCard
              icon={<Users className="size-6" />}
              title="Trabalhar em equipe"
              description="Mantenha o conhecimento do time organizado e acessível durante a temporada."
            />

            <FeatureCard
              icon={<Sparkles className="size-6" />}
              title="Evoluir"
              description="Volte aos seus registros, compare decisões e entenda como suas soluções evoluíram."
            />

            <div className="card border border-primary/20 bg-primary/5">
              <div className="card-body justify-between">
                <div>
                  <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-content">
                    <ArrowRight className="size-6" />
                  </div>

                  <h3 className="card-title">Comece agora</h3>

                  <p className="mt-2 text-base-content/65">
                    Crie sua primeira página e comece a registrar seu processo.
                  </p>
                </div>

                <button className="btn btn-primary mt-6 w-fit">
                  Abrir Stagebook
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="bg-neutral text-neutral-content">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
            <div className="max-w-2xl">
              <p className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">
                O processo
              </p>

              <h2 className="text-3xl font-black sm:text-4xl">
                Pense. Registre. Teste. Evolua.
              </h2>

              <p className="mt-5 text-neutral-content/65">
                O Stagebook acompanha o processo por trás daquilo que chega à
                arena, à apresentação ou ao projeto final.
              </p>
            </div>

            <div className="mt-14 grid gap-4 md:grid-cols-4">
              <ProcessStep number="01" title="Pense" />
              <ProcessStep number="02" title="Registre" />
              <ProcessStep number="03" title="Teste" />
              <ProcessStep number="04" title="Evolua" />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-base-300 bg-base-200 p-8 sm:p-12">
            <div className="relative z-10 max-w-2xl">
              <p className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">
                Stagebook
              </p>

              <h2 className="text-3xl font-black sm:text-4xl">
                O que você está construindo?
              </h2>

              <p className="mt-4 text-base-content/65">
                Registre o processo. Guarde o conhecimento. Continue evoluindo.
              </p>

              <button className="btn btn-primary mt-8">
                Começar agora
                <ArrowRight className="size-4" />
              </button>
            </div>

            <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full border-[40px] border-primary/10" />
            <div className="pointer-events-none absolute -bottom-24 -right-8 size-72 rounded-full border-[50px] border-secondary/10" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="card border border-base-300 bg-base-100 transition-all duration-200 hover:-translate-y-1 hover:border-primary/30">
      <div className="card-body">
        <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>

        <h3 className="card-title">{title}</h3>

        <p className="text-base-content/65">{description}</p>
      </div>
    </div>
  );
}

function ProcessStep({ number, title }: { number: string; title: string }) {
  return (
    <div className="rounded-2xl border border-neutral-content/10 bg-neutral-content/5 p-6">
      <span className="text-sm font-bold text-primary">{number}</span>
      <h3 className="mt-8 text-xl font-bold">{title}</h3>
    </div>
  );
}
