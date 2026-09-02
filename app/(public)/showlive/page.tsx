"use client";

import { Navbar } from "@/components/UI/Navbar";
import {
  ArrowRight,
  CircleAlert,
  Radio,
  Sparkles,
  Wrench,
} from "lucide-react";
import Features from "./Features";
import DashboardPreview from "./Dashboard";
import { Footer } from "@/components/UI/Footer";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ShowLivePage() {
  const router = useRouter();

  return (
    <>
      <Navbar />

      {/* Hero */}
      <header className="hero min-h-[520px] bg-gradient-to-b from-base-200 to-base-300 relative overflow-hidden">
        <div className="hero-content text-center relative z-10">
          <div className="max-w-2xl">
            <div className="badge badge-warning badge-outline mb-5 gap-2">
              <Wrench className="w-4 h-4" />
              Em manutenção
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-base-content">
              Show<span className="text-primary">Live</span>
            </h1>

            <p className="py-6 text-lg text-base-content/70 max-w-xl mx-auto">
              O ShowLive está temporariamente fora do ar enquanto preparamos
              uma nova versão da plataforma para transmissões e gestão de
              eventos de robótica.
            </p>

            <div className="alert alert-warning text-left shadow-sm max-w-xl mx-auto">
              <CircleAlert className="w-6 h-6 shrink-0" />

              <div>
                <h3 className="font-bold">
                  O ShowLive está temporariamente indisponível
                </h3>

                <p className="text-sm mt-1">
                  Estamos trabalhando em melhorias estruturais, correções de
                  bugs e uma nova experiência para organizadores e espectadores.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Radio className="absolute right-4 -bottom-20 text-base-content/10 h-64 w-64 -rotate-45" />
      </header>

      {/* Próxima versão */}
      <section className="py-24 bg-base-100 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="badge badge-primary badge-outline mb-4 gap-2">
              <Sparkles className="w-4 h-4" />
              Próximas versões
            </div>

            <h2 className="text-4xl font-bold mb-4">
              O ShowLive está evoluindo
            </h2>

            <p className="text-lg text-base-content/60 max-w-2xl mx-auto">
              O sistema retornará em próximas versões com uma estrutura mais
              completa para criação, configuração e transmissão de eventos de
              robótica.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card bg-base-200 border border-base-300">
              <div className="card-body">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <Radio className="w-6 h-6 text-primary" />
                </div>

                <h3 className="card-title">
                  Sistema customizado de eventos
                </h3>

                <p className="text-base-content/60">
                  Crie e configure eventos de acordo com as necessidades da
                  sua competição, definindo sua própria estrutura, etapas,
                  equipes e organização.
                </p>
              </div>
            </div>

            <div className="card bg-base-200 border border-base-300">
              <div className="card-body">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>

                <h3 className="card-title">
                  Regras e rubricas personalizadas
                </h3>

                <p className="text-base-content/60">
                  Defina regras, critérios de avaliação e rubricas próprias
                  para diferentes formatos de competição, indo além dos
                  modelos tradicionais.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <DashboardPreview />

      {/* Status */}
      <section className="px-4 py-8 bg-base-100">
        <div className="alert alert-info max-w-6xl mx-auto shadow-sm">
          <CircleAlert className="w-6 h-6 shrink-0" />

          <div>
            <h3 className="font-bold">
              A versão atual não está disponível
            </h3>

            <p className="text-sm">
              O ShowLive está passando por uma reformulação para receber as
              novas funcionalidades. O acesso será restabelecido em uma
              próxima versão.
            </p>
          </div>

          <Link href="/news" className="btn btn-sm btn-info btn-outline">
            Acompanhar novidades
          </Link>
        </div>
      </section>

      <Features />

      {/* Screenshots */}
      <section className="py-24 bg-base-100 px-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Uma nova experiência está chegando
            </h2>

            <p className="text-xl text-base-content/60 max-w-2xl mx-auto">
              A interface do ShowLive continuará evoluindo para tornar a
              gestão de transmissões e competições cada vez mais simples.
            </p>
          </div>

          <div className="flex justify-center">
            <img
              src="/images/showLive/ShowLiveDashboard.png"
              alt="Interface do ShowLive"
              className="rounded-lg shadow-lg border border-base-300 max-w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-base-300 py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>

          <h2 className="text-3xl font-bold mb-4 text-base-content">
            O próximo ShowLive será diferente.
          </h2>

          <p className="mb-8 text-base-content/70">
            Estamos construindo uma plataforma mais flexível para diferentes
            formatos de eventos, com ferramentas para criação de regras,
            rubricas e experiências personalizadas de competição.
          </p>

          <Link href="/news" className="btn btn-primary btn-lg">
            Acompanhar atualizações
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}