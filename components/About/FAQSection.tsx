import React from "react";

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  return (
    <div className="collapse border-b border-base-200 rounded-none">
      <input type="checkbox" />
      <div className="collapse-title text-base md:text-lg font-semibold">
        {question}
      </div>
      <div className="collapse-content">
        <p className="text-sm md:text-base text-base-content/70 leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
};

export const FAQSection: React.FC = () => {
  const faqs = [
    {
      question: "O RoboStage é gratuito?",
      answer:
        "Sim! Ele é totalmente gratuito para todos, com todas as funcionalidades disponíveis sem custo.",
    },
    {
      question: "Quais categorias de robótica são suportadas?",
      answer:
        "Embora focado na FIRST LEGO League (FLL), o RoboStage é versátil e pode ser usado por equipes de VEX, FTC, FRC e outras competições de robótica educacional. Usando as ferramentas Workspace e InnoLab, qualquer equipe pode se beneficiar do RoboStage.",
    },
    {
      question: "Como o LabTest funciona?",
      answer:
        "O LabTest permite que você crie e execute testes personalizados para avaliar o desempenho do seu robô nas missões da temporada selecionada. Você lança os resultados em tempo real e acompanha o progresso, taxa de sucesso e missões mais realizadas pelo teste.",
    },
    {
      question: "Posso exportar dados para o diário de bordo?",
      answer:
        "Sim! Você pode exportar dados de testes e anotações para compor o portfólio de engenharia físico ou digital da sua equipe com facilidade.",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-base-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold">
            Perguntas Frequentes
          </h2>
          <p className="text-sm md:text-base text-base-content/70 mt-2">
            Tire suas dúvidas sobre como o RoboStage pode potencializar os
            resultados da sua equipe.
          </p>
        </div>

        <div className="bg-base-100 rounded-2xl md:rounded-3xl shadow-sm border border-base-300 divide-y divide-base-200">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
            />
          ))}
        </div>

        <h3 className="mt-8 text-center">Tem mais perguntas? <a href="/help" className="text-primary hover:underline">Acesse aqui!</a></h3>
      </div>
    </section>
  );
};