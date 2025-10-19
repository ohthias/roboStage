import React from 'react';
import { motion } from "framer-motion";
import { features } from '@/constants/features';

const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-20 sm:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-base-content mb-4">
            Funcionalidades do <span className="text-primary">RoboStage</span>
          </h2>
          <p className="text-lg text-base-content/80 max-w-3xl mx-auto">
            Explore as principais ferramentas que vão turbinar suas experiências
            na FLL Challenge – do planejamento ao campeonato!
          </p>
        </motion.div>

        {/* Features List */}
        <div className="grid gap-6 lg:gap-8">
          {features.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -80 : 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -8 }}
              className={`group flex flex-col md:flex-row items-center gap-8 lg:gap-12 p-8 rounded-2xl transition-colors duration-300
                ${index % 2 === 1 ? "md:flex-row-reverse" : ""}`}
            >
              <div className="flex-shrink-0">
                <div className="w-40 h-40 rounded-full bg-base-200 flex items-center justify-center border-2 border-base-300 group-hover:shadow-md transition-shadow duration-300">
                  {item.icon}
                </div>
              </div>
              <div className={`text-center md:text-left ${index % 2 === 1 ? "md:text-right" : ""}`}>
                <h3 className="text-2xl lg:text-3xl font-semibold text-primary mb-3">
                  {item.title}
                </h3>
                <p className="text-base-content/80 max-w-lg leading-relaxed">{item.text}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Footer */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <h3 className="text-2xl font-medium mb-6 text-base-content">
            Pronto para começar sua jornada com o <span className="text-primary">RoboStage</span>?
          </h3>
          <motion.button 
            whileHover={{ scale: 1.05, y: -2, boxShadow: "0 8px 30px rgba(79, 70, 229, 0.5)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="bg-primary text-white text-lg font-semibold px-10 py-4 rounded-xl shadow-[0_5px_20px_rgba(79,70,229,0.4)] hover:bg-primary transition-colors duration-300"
            onClick={() => console.log('Navigate to signup')}
          >
            Experimente Agora
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;