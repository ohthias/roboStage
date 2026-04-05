"use client";
import { motion } from "framer-motion";
import {
  Trophy,
  Cpu,
  Users,
  Rocket,
  Zap,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import MaintenanceBanner from "@/components/MaintenanceBanner";
import { Footer } from "../UI/Footer";
import Hero from "../Hero";

export default function FLLHome() {
  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <Hero />

      <section className="py-24 px-6 bg-base-300 relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-14 text-center tracking-tight">
            Sobre a <span className="text-primary">FLL Challenge</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-14 items-center">
            {/* CARDS */}
            <div className="space-y-5">
              {[
                {
                  icon: Trophy,
                  title: "Robot Game",
                  color: "text-primary",
                  desc: "As equipes programam robôs LEGO para cumprir missões com estratégia e precisão.",
                },
                {
                  icon: Cpu,
                  title: "Projeto de Inovação",
                  color: "text-secondary",
                  desc: "Pesquisa de um problema real com solução criativa baseada em ciência.",
                },
                {
                  icon: Users,
                  title: "Core Values",
                  color: "text-accent",
                  desc: "Cooperação, respeito e aprendizado em equipe durante toda a jornada.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="group p-5 rounded-2xl bg-base-200 border border-base-300 
            flex items-start gap-4 transition-all duration-300
            hover:shadow-xl hover:-translate-y-1 hover:border-primary/40 cursor-pointer"
                >
                  <div className={`p-3 rounded-xl bg-base-100 ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>

                  <div>
                    <h3 className={`font-semibold ${item.color}`}>
                      {item.title}
                    </h3>
                    <p className="opacity-70 text-sm mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* TEXTO */}
            <div className="max-w-prose">
              <p className="text-lg opacity-90 leading-relaxed mb-5">
                A{" "}
                <span className="font-semibold text-primary">
                  FIRST LEGO League Challenge{" "}
                </span>
                é uma competição internacional que integra engenharia,
                programação e resolução de problemas reais.
              </p>

              <p className="opacity-70 mb-4 leading-relaxed">
                A cada temporada, um novo tema desafia equipes a desenvolver
                robôs e soluções inovadoras, combinando habilidades técnicas e
                socioemocionais.
              </p>

              <p className="opacity-70 leading-relaxed">
                Mais do que pontuação, a competição desenvolve protagonismo,
                pensamento crítico e inovação com propósito.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ROBOSTAGE ================= */}

      <section className="py-24 px-6 bg-base-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-14 text-center tracking-tight">
            Ferramentas da <span className="text-primary">RoboStage</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Quickbrick",
                color: "text-primary",
                desc: "Monte estratégias e rotas do robô visualmente, testando decisões em tempo real.",
                highlight: "Planejamento rápido",
              },
              {
                icon: BarChart3,
                title: "Score",
                color: "text-secondary",
                desc: "Pontue missões e visualize o desempenho do robô, simulando um round completo da competição.",
                highlight: "Pontuador",
              },
              {
                icon: MessageSquare,
                title: "Flash-QA & Timers",
                color: "text-accent",
                desc: "Treine apresentações e avaliações com perguntas dinâmicas e rápidas.",
                highlight: "Preparação",
              },
            ].map((tool, i) => (
              <div
                key={i}
                className="group p-7 rounded-3xl bg-base-200 border border-base-300 
          transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 
          hover:border-primary/30 cursor-pointer relative overflow-hidden"
              >
                {/* glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 
          bg-gradient-to-br from-primary/5 to-transparent"
                />

                <div
                  className={`mb-5 inline-flex p-4 rounded-2xl bg-base-100 ${tool.color}`}
                >
                  <tool.icon className="w-6 h-6" />
                </div>

                <h3 className={`text-xl font-semibold mb-1 ${tool.color}`}>
                  {tool.title}
                </h3>

                <span className="text-xs opacity-60 mb-3 block">
                  {tool.highlight}
                </span>

                <p className="opacity-70 leading-relaxed text-sm">
                  {tool.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-32 px-6 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="https://qcesc.org/wp-content/uploads/2025/08/image001-1024x666.jpg"
            alt="FLL Unearthed Theme"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        {/* Conteúdo */}
        <div className="relative max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Temporada <span className="text-primary">UNEARTHED</span>
          </h2>

          <p className="text-lg md:text-xl opacity-90 leading-relaxed mb-6">
            Nesta temporada, as equipes são desafiadas a explorar o passado para
            construir o futuro. A temática{" "}
            <span className="font-bold">Unearthed</span> propõe
            em ajudar os Arquologos nas dificuldades enfrentadas, seja na
            escavação, catalogação ou preservação de artefatos históricos.
          </p>
        </div>
      </section>
      <MaintenanceBanner />
      <Footer />
    </div>
  );
}
