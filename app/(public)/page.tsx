'use client';
import Hero from "@/components/Hero";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import RevealOnScroll from "@/components/ui/RevealOnScroll";

import {
  Brain,
  FlaskConical,
  TrendingUp,
  ClipboardList,
  Target,
  BarChart3,
  Layers,
  Rocket,
  Activity,
  Clock,
  Eye,
  Lightbulb,
  Puzzle,
  Dumbbell,
  Bot,
  Globe,
  Pickaxe,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="bg-base-100">
      <Navbar isIndexPage />
      <Hero />

      {/* O PROBLEMA */}
      <section className="py-24 bg-base-300">
        <RevealOnScroll>
          <div className="max-w-6xl mx-auto px-6 space-y-16">
            <div className="text-center space-y-4">
              <span className="badge badge-secondary uppercase tracking-widest">
                O problema
              </span>
              <h2 className="text-4xl md:text-5xl font-black uppercase">
                O desafio real da temporada FLL
              </h2>
              <p className="text-base-content/60 max-w-3xl mx-auto">
                Durante a temporada FLL, muitas equipes enfrentam os mesmos desafios —
                decisões sem dados, testes pouco estruturados e dificuldade em evoluir
                com consistência.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Brain,
                  title: "Decisões no improviso",
                  desc: "Escolhas estratégicas sem dados claros comprometem o desempenho da equipe.",
                },
                {
                  icon: FlaskConical,
                  title: "Testes sem histórico",
                  desc: "Sem registros, não há comparação, aprendizado ou evolução real.",
                },
                {
                  icon: TrendingUp,
                  title: "Evolução inconsistente",
                  desc: "Dificuldade em repetir bons resultados ao longo da temporada.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="card-body items-center text-center space-y-4">
                    <Icon className="w-10 h-10 text-secondary" />
                    <h3 className="font-black uppercase">{title}</h3>
                    <p className="text-sm text-base-content/60">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* MÉTODO ROBOSTAGE */}
      <section className="py-24 bg-base-100">
        <RevealOnScroll>
          <div className="max-w-6xl mx-auto px-6 space-y-16 text-center">
            <div className="space-y-4">
              <span className="badge badge-accent uppercase tracking-widest">
                O método
              </span>
              <h2 className="text-4xl md:text-5xl font-black uppercase">
                Um método claro para competir com consistência
              </h2>
              <p className="text-base-content/60 max-w-3xl mx-auto">
                O RoboStage organiza planejamento, testes e dados em um fluxo simples,
                repetível e focado em evolução contínua.
              </p>
            </div>

            <ul className="steps steps-vertical md:steps-horizontal max-w-5xl mx-auto">
              <li className="step step-accent font-semibold">
                Planejar missões
              </li>
              <li className="step step-accent font-semibold">
                Testar estratégias
              </li>
              <li className="step step-accent font-semibold">
                Analisar dados
              </li>
              <li className="step step-accent font-semibold">
                Evoluir com consistência
              </li>
            </ul>
          </div>
        </RevealOnScroll>
      </section>

      {/* FUNCIONALIDADES FLL */}
      <section className="py-24 bg-base-200">
        <RevealOnScroll>
          <div className="max-w-6xl mx-auto px-6 space-y-16">
            <div className="text-center space-y-4">
              <span className="badge badge-primary uppercase tracking-widest">
                Funcionalidades
              </span>
              <h2 className="text-4xl md:text-5xl font-black uppercase">
                Tudo organizado durante a temporada
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
              {[
                { icon: Target, text: "Planejamento estratégico de missões e rodadas" },
                { icon: ClipboardList, text: "Registro estruturado de testes e tentativas" },
                { icon: BarChart3, text: "Comparação clara entre estratégias" },
                { icon: TrendingUp, text: "Acompanhamento da evolução da equipe" },
                { icon: Rocket, text: "Preparação para competições e avaliações" },
                { icon: Layers, text: "Organização completa por temporada FLL" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="card-body space-y-3">
                    <Icon className="w-8 h-8 text-primary" />
                    <p className="font-semibold">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* AMBIENTES ROBOSTAGE */}
      <section className="py-28 bg-base-100">
        <RevealOnScroll>
          <div className="max-w-7xl mx-auto px-6 space-y-20">
            <div className="text-center space-y-4">
              <span className="badge badge-neutral uppercase tracking-widest">
                Ecossistema
              </span>
              <h2 className="text-4xl md:text-5xl font-black uppercase">
                Um ecossistema completo para a temporada FLL
              </h2>
              <p className="text-base-content/60 max-w-3xl mx-auto">
                Cada ambiente do RoboStage resolve uma etapa crítica da temporada —
                do planejamento inicial à análise em tempo real durante a competição.
              </p>
            </div>

            {/* Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8">
              <div className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow">
                <div className="card-body space-y-4">
                  <Puzzle className="w-10 h-10 text-primary" />
                  <h3 className="font-black uppercase">QuickBrick</h3>
                  <p className="text-sm text-base-content/60">
                    Documente, teste e simule estratégias do robô enfrentando os desafios da FLL.
                  </p>
                </div>
              </div>

              <div className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow">
                <div className="card-body space-y-4">
                  <Lightbulb className="w-10 h-10 text-accent" />
                  <h3 className="font-black uppercase">InnoLab</h3>
                  <p className="text-sm text-base-content/60">
                    Organização de ideias, soluções técnicas e estratégias da equipe.
                  </p>
                </div>
              </div>

              <div className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow">
                <div className="card-body space-y-4">
                  <FlaskConical className="w-10 h-10 text-secondary" />
                  <h3 className="font-black uppercase">LabTest</h3>
                  <p className="text-sm text-base-content/60">
                    Registro de testes, métricas, tentativas e comparação de resultados.
                  </p>
                </div>
              </div>

              <div className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow">
                <div className="card-body space-y-4">
                  <Bot className="w-10 h-10 text-success" />
                  <h3 className="font-black uppercase">CalibraBot</h3>
                  <p className="text-sm text-base-content/60">
                    Documente todo o processo de construção, ajustes e calibração do robô.
                  </p>
                </div>
              </div>

              <div className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow">
                <div className="card-body space-y-4">
                  <Dumbbell className="w-10 h-10 text-error" />
                  <h3 className="font-black uppercase">TrainLab</h3>
                  <p className="text-sm text-base-content/60">
                    Organize treinos com metas, registros, análises e evolução contínua.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* SHOWLIVE – SEÇÃO EXCLUSIVA */}
      <section className="py-32 bg-gradient-to-br from-base-200 via-base-100 to-base-200">
        <RevealOnScroll>
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <span className="badge badge-error uppercase tracking-widest">
                ShowLive
              </span>
              <h2 className="text-4xl md:text-5xl font-black uppercase leading-tight">
                Transforme sua temporada
                <br />
                em um campeonato FLL.
              </h2>

              <p className="text-base-content/70 text-lg max-w-xl">
                O <strong>ShowLive</strong> permite criar, gerenciar e acompanhar
                competições FLL de forma visual, organizada e profissional — do treino
                ao dia do evento.
              </p>

              <div className="grid sm:grid-cols-3 gap-6">
                <div className="flex items-start gap-4">
                  <Eye className="w-6 h-6 text-error mt-1" />
                  <p className="text-sm text-base-content/70">
                    Gerenciamento da competição de forma simples e intuitiva
                  </p>
                </div>

                <div className="flex items-start gap-4">
                  <Activity className="w-6 h-6 text-error mt-1" />
                  <p className="text-sm text-base-content/70">
                    Monitoramento das rodadas e salas de avaliação em tempo real
                  </p>
                </div>

                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-error mt-1" />
                  <p className="text-sm text-base-content/70">
                    Relatórios detalhados para análise pós-competição
                  </p>
                </div>
              </div>

              <button className="btn btn-error btn-lg rounded-2xl font-black uppercase tracking-widest">
                Conhecer o ShowLive
              </button>
            </div>

            {/* Visual placeholder */}
            <div className="relative">
              <div className="mockup-window bg-base-300 shadow-2xl">
                <div className="bg-base-100 p-6">
                  <div className="h-48 rounded-xl bg-gradient-to-br from-error/20 to-error/5 flex items-center justify-center">
                    <span className="font-black uppercase text-error">
                      ShowLive Dashboard
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* FIRST AGE & UNEARTHED */}
      <section
        id="season"
        className="py-24 md:py-40 px-6 bg-base-100 relative overflow-hidden"
      >
        <RevealOnScroll>
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-base-300 to-transparent" />
          <div className="max-w-7xl mx-auto space-y-20">
            {/* Header */}
            <div className="text-center space-y-4">
              <span className="badge badge-outline uppercase tracking-widest">
                Temporada 2025 • 2026
              </span>
              <h2 className="text-4xl md:text-5xl font-black uppercase">
                Explorar. Reconstruir. Entender.
              </h2>
              <p className="text-base-content/60 max-w-3xl mx-auto">
                A nova temporada da FIRST LEGO League Challenge convida equipes a
                investigar o passado para criar soluções para o futuro, unindo
                pesquisa, tecnologia e impacto social.
              </p>
            </div>

            {/* Cards */}
            <div className="grid lg:grid-cols-2 gap-10">

              {/* UNEARTHED */}
              <div className="relative group overflow-hidden bg-neutral text-neutral-content rounded-[3rem] p-10 md:p-14 flex flex-col justify-between h-full shadow-2xl">

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,4,41,0.18),transparent_60%)] opacity-70 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10 space-y-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                      <Pickaxe size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">
                      FLL Challenge
                    </span>
                  </div>

                  <h3 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-[0.85]">
                    UNEARTHED<span className="text-primary">™</span>
                  </h3>

                  <p className="text-lg md:text-xl text-neutral-content/70 max-w-md leading-relaxed">
                    A temporada UNEARTHED™ desafia equipes a explorarem e identificarem
                    problemas enfrentados por arqueólogos, propondo soluções que aliem
                    tecnologia, pesquisa e colaboração humana.
                  </p>

                  <p className="text-sm text-neutral-content/50 max-w-md">
                    Seja em escavações, análises em laboratório ou reconstrução de
                    artefatos, o processo arqueológico orienta a descoberta de como
                    gerações passadas viviam, aprendiam e celebravam.
                  </p>
                </div>
              </div>

              {/* FIRST AGE */}
              <div className="relative group overflow-hidden bg-base-200 rounded-[3rem] p-10 md:p-14 flex flex-col justify-between h-full shadow-xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.06),transparent_60%)] opacity-70 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 space-y-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-base-content text-base-100 rounded-xl flex items-center justify-center shadow-lg">
                      <Globe size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-base-content/50">
                      FIRST Theme
                    </span>
                  </div>

                  <h3 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-[0.85]">
                    FIRST <br />
                    <span className="text-base-content/40">AGE™</span>
                  </h3>

                  <p className="text-lg md:text-xl text-base-content/70 max-w-md leading-relaxed">
                    FIRST AGE™ amplia o desafio ao convidar equipes a refletirem sobre
                    como a tecnologia pode apoiar pessoas em diferentes fases da vida,
                    conectando passado, presente e futuro.
                  </p>

                  <p className="text-sm text-base-content/60 max-w-md">
                    Mais do que construir robôs, é sobre entender o impacto humano,
                    social e educacional das soluções desenvolvidas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* CTA FINAL */}
      <section className="py-28 bg-base-100">
        <RevealOnScroll>
          <div className="max-w-5xl mx-auto px-6 text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-black uppercase">
              Pronto para levar sua equipe FLL ao próximo nível?
            </h2>

            <button
              className="btn btn-primary btn-lg px-20 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-transform"
              onClick={() => {
                router.push("/auth/signup");
              }}
            >
              Criar conta no RoboStage
            </button>
          </div>
        </RevealOnScroll>
      </section>
      <Footer />
    </div>
  );
}