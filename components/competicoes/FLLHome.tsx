"use client";
import { motion } from "framer-motion";
import { Trophy, Cpu, Users, Rocket, Zap, BarChart3, MessageSquare } from "lucide-react";
import MaintenanceBanner from "@/app/(public)/MaintenanceBanner";
import { Footer } from "../UI/Footer";
import Hero from "../Hero";

export default function FLLHome() {
  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <Hero />

      <section className="py-20 px-6 bg-base-300">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">
            Sobre a FIRST LEGO League Challenge
          </h2>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-base-200 border border-base-300 flex items-start gap-3">
                <Trophy className="w-6 h-6 mt-0.5 text-primary" />
                <div>
                  <h3 className="font-semibold text-primary">Robot Game</h3>
                  <p className="opacity-70 text-sm">
                    As equipes programam robôs LEGO para cumprir missões em uma mesa temática, com estratégia e precisão.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-base-200 border border-base-300 flex items-start gap-3">
                <Cpu className="w-6 h-6 mt-0.5 text-secondary" />
                <div>
                  <h3 className="font-semibold text-secondary">Projeto de Inovação</h3>
                  <p className="opacity-70 text-sm">
                    O time pesquisa um problema real e propõe uma solução criativa com base científica e impacto social.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-base-200 border border-base-300 flex items-start gap-3">
                <Users className="w-6 h-6 mt-0.5 text-accent" />
                <div>
                  <h3 className="font-semibold text-accent">Core Values</h3>
                  <p className="opacity-70 text-sm">
                    A competição valoriza cooperação, respeito, inclusão e aprendizado em equipe durante toda a jornada.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-lg opacity-80 leading-relaxed mb-4">
                A FIRST LEGO League Challenge é uma competição internacional de robótica educacional para jovens, que une
                engenharia, programação e solução de problemas do mundo real.
              </p>
              <p className="opacity-70 mb-4">
                A cada temporada, um novo tema é lançado e as equipes desenvolvem habilidades técnicas e socioemocionais
                para apresentar seu robô, seu projeto e seu processo de trabalho aos avaliadores.
              </p>
              <p className="opacity-70">
                Mais do que pontuação, a FLL Challenge incentiva protagonismo, pensamento crítico e inovação com propósito.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ferramentas RoboStage */}
      <section className="py-20 px-6 bg-base-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">
            Ferramentas exclusivas da RoboStage
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Quickbrick */}
            <div className="p-6 rounded-2xl bg-base-100 shadow-md">
              <Zap className="w-10 h-10 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2 text-primary">Quickbrick</h3>
              <p className="opacity-70">
                Montagem rápida de estratégias. Crie sequências de missões e rotas do robô de forma visual,
                permitindo testes rápidos e ajustes em tempo real.
              </p>
            </div>

            {/* Score */}
            <div className="p-6 rounded-2xl bg-base-100 shadow-md">
              <BarChart3 className="w-10 h-10 mb-4 text-secondary" />
              <h3 className="text-xl font-semibold mb-2 text-secondary">Score</h3>
              <p className="opacity-70">
                Sistema de pontuação inteligente que calcula automaticamente os resultados das missões,
                ajudando a equipe a identificar as melhores estratégias e maximizar desempenho.
              </p>
            </div>

            {/* Flash QA */}
            <div className="p-6 rounded-2xl bg-base-100 shadow-md">
              <MessageSquare className="w-10 h-10 mb-4 text-accent" />
              <h3 className="text-xl font-semibold mb-2 text-accent">Flash-QA</h3>
              <p className="opacity-70">
                Treinamento rápido para o Core Values, projeto e design. Perguntas dinâmicas para preparar a equipe
                para avaliações e apresentações durante a competição.
              </p>
            </div>
          </div>
        </div>
      </section>

      <MaintenanceBanner />
      <Footer />
    </div>
  );
}
