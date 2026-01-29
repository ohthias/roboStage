import React, { useState } from "react";
import { Timer, ClipboardCheck, Tv, Settings } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "primary" | "secondary" | "accent" | "warning";
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  color,
}) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 200);
  };

  // Map colors to specific Tailwind classes to ensure they are generated correctly
  const styles = {
    primary: {
      bar: "bg-primary",
      iconBg: "bg-primary/10",
      text: "text-primary",
      hoverBorder: "group-hover:border-primary/50",
      ring: "ring-primary",
      gradient: "from-primary/5",
    },
    secondary: {
      bar: "bg-secondary",
      iconBg: "bg-secondary/10",
      text: "text-secondary",
      hoverBorder: "group-hover:border-secondary/50",
      ring: "ring-secondary",
      gradient: "from-secondary/5",
    },
    accent: {
      bar: "bg-accent",
      iconBg: "bg-accent/10",
      text: "text-accent",
      hoverBorder: "group-hover:border-accent/50",
      ring: "ring-accent",
      gradient: "from-accent/5",
    },
    warning: {
      bar: "bg-warning",
      iconBg: "bg-warning/10",
      text: "text-warning",
      hoverBorder: "group-hover:border-warning/50",
      ring: "ring-warning",
      gradient: "from-warning/5",
    },
  };

  const style = styles[color];

  return (
    <div
      onClick={handleClick}
      className={`
        card bg-base-100 shadow-xl border border-base-content/10 cursor-pointer group
        transition-all duration-300 ease-out select-none overflow-hidden
        hover:-translate-y-2 hover:shadow-2xl ${style.hoverBorder}
        ${isClicked ? `scale-95 ring-2 ${style.ring} ring-offset-2 ring-offset-base-100` : ""}
      `}
    >
      {/* Top Accent Bar */}
      <div className={`h-1 w-full ${style.bar} opacity-80`} />

      <div className="card-body items-center text-center relative z-10">
        {/* Subtle Gradient Background on Hover */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${style.gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
        />

        <div
          className={`
          p-4 rounded-2xl mb-3 ${style.iconBg} ${style.text}
          group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300
          ring-1 ring-white/5 shadow-lg
        `}
        >
          {icon}
        </div>

        <h2 className="card-title mb-2 transition-colors duration-300">
          {title}
        </h2>

        <p className="text-base-content/60 text-sm leading-relaxed group-hover:text-base-content/80 transition-colors">
          {description}
        </p>

        {/* Click Feedback Overlay */}
        <div
          className={`absolute inset-0 ${style.bar} mix-blend-overlay transition-opacity duration-200 ${isClicked ? "opacity-10" : "opacity-0"}`}
        />
      </div>
    </div>
  );
};

const Features: React.FC = () => {
  return (
    <section id="features" className="py-24 bg-base-200 px-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Especialista em <span className="text-primary">FLL Challenge</span>
          </h2>
          <p className="text-xl text-base-content/60 max-w-2xl mx-auto">
            Não adapte seu evento ao sistema. O ShowLive foi construído seguindo
            as regras e dinâmicas oficiais da FIRST LEGO League.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<Timer size={32} />}
            title="Cronômetro Oficial"
            description="Timer de 2:30 com sons oficiais, controle de pausas e sincronia em múltiplas telas de arena."
            color="primary"
          />
          <FeatureCard
            icon={<ClipboardCheck size={32} />}
            title="Rubricas Digitais"
            description="Avaliação de Design, Projeto e Core Values direto no tablet. Cálculo automático de notas."
            color="secondary"
          />
          <FeatureCard
            icon={<Tv size={32} />}
            title="Ranking em Tempo Real"
            description="Assim que o juiz envia a nota da mesa, o ranking no telão é atualizado automaticamente."
            color="accent"
          />
          <FeatureCard
            icon={<Settings size={32} />}
            title="Regras Configuráveis"
            description="A flexibilidade do ShowLive permite adaptar o sistema a diferentes formatos, como torneios internos ou eventos maiores."
            color="warning"
          />
        </div>

        {/* Section Highlighting the Robot Game Screen */}
        <div className="hero mt-20 bg-base-100 rounded-3xl overflow-hidden shadow-2xl border border-base-content/10">
          <div className="hero-content flex-col lg:flex-row gap-10 p-10">
            <div className="flex-1 space-y-6">
              <h3 className="text-3xl font-bold">Mesa do Robô (Robot Game)</h3>
              <p className="text-lg text-base-content/70">
                A interface de arbitragem do ShowLive é simples e à prova de
                erros. Os juízes marcam as missões cumpridas e o sistema calcula
                a pontuação baseado nas regras da temporada atual.
              </p>
              <ul className="menu bg-base-200 rounded-box w-full">
                <li>
                  <a>
                    <span className="badge badge-primary mr-2">✓</span>{" "}
                    Validação de regras conflitantes
                  </a>
                </li>
                <li>
                  <a>
                    <span className="badge badge-primary mr-2">✓</span>{" "}
                    Histórico de rounds por time
                  </a>
                </li>
              </ul>
            </div>
            <div className="flex-1">
              <div className="mockup-window border bg-base-300 border-base-content/20 shadow-lg">
                <div className="flex justify-center px-4 py-16 bg-base-200 relative overflow-hidden">
                  {/* TODO - Inserir imagem depois */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
