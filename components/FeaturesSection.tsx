"use client";

import { motion } from "framer-motion";
import QuickBrickImage from "@/public/images/icons/3.png";
import LabTestImage from "@/public/images/icons/2.png";
import ShowLiveImage from "@/public/images/icons/1.png";
import StyleLabImage from "@/public/images/icons/4.png";

const features = [
  {
    title: "QuickBrick Studio",
    text: "Desenhe estratégias visuais para cumprir missões da FLL Challenge - UNEARTHED!",
    icon: QuickBrickImage.src,
  },
  {
    title: "LabTest",
    text: "Teste e valide suas estratégias para as missões da FLL Challenge - UNEARTHED! Tendo acesso a estatísticas detalhadas do desempenho de seus lançamentos.",
    icon: LabTestImage.src,
  },
  {
    title: "ShowLive",
    text: "Crie campeonatos da FIRST LEGO League, defina as rodadas, as equipes participantes e tenha uma experiência de torneio!",
    icon: ShowLiveImage.src,
  },
  {
    title: "StyleLab",
    text: "Crie temas e dê vida aos seus eventos com os seus próprios estilos!",
    icon: StyleLabImage.src,
  },
];

export default function FeaturesSection() {
  return (
    <section className="max-w-5xl mx-auto my-12 px-4 sm:px-6 lg:px-8">
      {/* Título */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl font-bold text-base-content mb-4">
          Funcionalidades do <span className="text-primary">RoboStage</span>
        </h2>
        <p className="text-base-content max-w-2xl mx-auto">
          Explore as principais ferramentas que vão turbinar suas experiências
          na FLL Challenge – do planejamento ao campeonato!
        </p>
      </motion.div>

      {/* Lista de cards */}
      <div className="grid gap-10">
        {features.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, x: index % 2 === 0 ? -80 : 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
            className={`flex flex-col sm:flex-row items-center gap-6 p-6
              ${index % 2 === 1 ? "sm:flex-row-reverse text-right sm:text-right" : ""}`}
          >
            <div className="relative flex-shrink-0">
              <div className="size-32 sm:size-40 rounded-full bg-neutral-100 flex items-center justify-center">
                <img
                  src={item.icon}
                  alt={item.title}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-primary mb-2">
                {item.title}
              </h3>
              <p className="text-base-content max-w-md">{item.text}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Rodapé CTA */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
        className="text-center mt-16"
      >
        <h3 className="text-xl font-medium mb-4 text-base-content">
          Pronto para começar sua jornada com o <span className="text-primary">RoboStage</span>?
        </h3>
        <button className="btn btn-primary px-8 py-3 rounded-xl shadow-lg hover:scale-105 transition-transform" onClick={() => window.location.href = '/auth/signup'}>
          Experimente Agora
        </button>
      </motion.div>
    </section>
  );
}
