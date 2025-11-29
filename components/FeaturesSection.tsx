import React from "react";
import { motion } from "framer-motion";
import { features } from "@/constants/features";

const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-16 relative bg-base-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-base-content">
            Funcionalidades do <span className="text-primary">RoboStage</span>
          </h2>
          <p className="text-base text-base-content/70 mt-3 max-w-xl mx-auto">
            Descubra como o RoboStage pode transformar suas ideias em realidade com
            suas funcionalidades inovadoras.
          </p>
        </motion.div>

        {/* Grid responsivo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.03 }}
              className="
                relative p-6 rounded-2xl 
                bg-base-200 border border-base-300/30
                shadow-sm hover:shadow-md
                transition-all duration-300 flex flex-col items-center text-center
              "
            >
              {/* Ícone */}
              <div className="w-16 h-16 flex items-center justify-center text-primary text-3xl mb-4">
                {item.icon}
              </div>

              {/* Título */}
              <h3 className="text-xl font-semibold text-primary mb-2">
                {item.title}
              </h3>

              {/* Descrição */}
              <p className="text-base-content/70 text-sm sm:text-base leading-relaxed">
                {item.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
