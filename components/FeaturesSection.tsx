import React from "react";
import { motion } from "framer-motion";
import { features } from "@/constants/features";

const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-28 relative">
      {/* Leve gradiente do tema */}
      <div className="absolute inset-0 bg-gradient-to-b from-base-200 via-base-100 to-base-200 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">

        {/* TÍTULO */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <h2 className="text-4xl lg:text-5xl font-extrabold text-base-content">
            Funcionalidades do{" "}
            <span className="text-primary">RoboStage</span>
          </h2>
          <p className="text-lg text-base-content/70 mt-4 max-w-2xl mx-auto">
            Explore ferramentas criadas para elevar sua performance na FLL Challenge.
          </p>
        </motion.div>

        {/* GRID */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6}}
              viewport={{ once: true }}
              whileHover={{ scale: 1.04, y: -6 }}
              className="
                relative p-8 rounded-3xl 
                bg-base-100/30 backdrop-blur-2xl 
                border border-base-300/40 
                shadow-[0_8px_35px_var(--fallback-bc,rgba(0,0,0,0.2))]
                hover:shadow-[0_12px_45px_var(--fallback-bc,rgba(0,0,0,0.28))]
                transition-all duration-500
                group
              "
            >
              {/* HALO — usa DAISYUI primary automaticamente */}
              <div
                className="
                  absolute -top-16 -right-16 
                  w-40 h-40 rounded-full 
                  bg-primary/20 blur-3xl 
                  group-hover:bg-primary/30 
                  transition-all duration-500
                "
              />

              {/* ÍCONE COM GLASS */}
              <div
                className="
                  w-20 h-20 rounded-2xl mx-auto flex items-center justify-center
                  bg-base-100/40 border border-base-300/40 backdrop-blur-xl
                  shadow-[inset_0_0_15px_var(--fallback-bc,rgba(255,255,255,0.25))]
                  group-hover:shadow-[inset_0_0_20px_var(--fallback-bc,rgba(255,255,255,0.45))]
                  transition-all duration-500
                  text-primary
                "
              >
                {item.icon}
              </div>

              {/* TÍTULO */}
              <h3 className="text-2xl font-bold text-center text-primary mt-6 mb-3">
                {item.title}
              </h3>

              {/* DESCRIÇÃO */}
              <p className="text-base-content/70 text-center leading-relaxed">
                {item.text}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-24"
        >
          <motion.button
            whileHover={{
              scale: 1.05,
              y: -2,
              boxShadow: "0 12px 50px hsl(var(--p)/0.45)",
            }}
            whileTap={{ scale: 0.96 }}
            className="
              btn btn-primary px-12 py-3 text-lg rounded-xl 
              shadow-[0_6px_25px_hsl(var(--p)/0.35)]
            "
          >
            Começar Agora
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
