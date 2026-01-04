
import React from 'react';
import { CheckCircle2, FileText, MessageSquare, ShieldCheck, Users } from 'lucide-react';

export const TeamSpacesSection: React.FC = () => {
  const benefits = [
    {
      title: "Testes Compartilhados",
      description: "Resultados em tempo real para todo o time.",
      icon: CheckCircle2,
      color: "text-blue-500 bg-blue-50"
    },
    {
      title: "Documentação Viva",
      description: "Repositório central para diários e estratégias.",
      icon: FileText,
      color: "text-indigo-500 bg-indigo-50"
    },
    {
      title: "Notas e Feedbacks",
      description: "Registre insights valiosos durante os treinos.",
      icon: MessageSquare,
      color: "text-purple-500 bg-purple-50"
    },
    {
      title: "Acesso Unificado",
      description: "Permissões para mentores e competidores.",
      icon: ShieldCheck,
      color: "text-emerald-500 bg-emerald-50"
    }
  ];

  return (
    <section className="py-24 md:py-40 bg-base-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          <div className="lg:w-1/2 order-2 lg:order-1 space-y-8">
            <div className="space-y-4">
              <div className="badge badge-secondary font-black">EQUIPES</div>
              <h2 className="text-4xl md:text-6xl font-black text-base-content leading-none">
                Um espaço onde a <span className="text-secondary">equipe</span> respira.
              </h2>
            </div>
            
            <p className="text-xl text-base-content/60 leading-relaxed">
              O trabalho em silos é o maior inimigo da inovação. Com os Espaços de Equipe, eliminamos a barreira entre hardware, software e projeto de inovação.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex gap-4 group">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${benefit.color}`}>
                    <benefit.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-base-content text-lg mb-1">{benefit.title}</h4>
                    <p className="text-sm text-base-content/50 leading-snug">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="lg:w-1/2 relative order-1 lg:order-2 w-full">
            <div className="mockup-window border bg-base-300 shadow-2xl">
              <div className="flex justify-center px-4 py-16 bg-base-100 flex-col gap-6 items-center text-center">
                <Users className="w-16 h-16 text-secondary animate-pulse" />
                <h3 className="text-2xl font-black">Workspace da Equipe #123</h3>
                <div className="flex gap-2">
                  <div className="badge badge-success font-bold text-white uppercase text-[10px]">Ativo</div>
                  <div className="badge badge-ghost font-bold uppercase text-[10px]">6 Membros</div>
                </div>
                <div className="w-full max-w-xs space-y-2 mt-4">
                  <progress className="progress progress-secondary w-full" value="70" max="100"></progress>
                  <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">Meta da Temporada: 70% Completa</p>
                </div>
              </div>
            </div>
            
            {/* Decoration */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};