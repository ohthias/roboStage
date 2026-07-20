import { TriangleAlert } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FLL Future Edition | RoboStage",
  description:
    "Na BIOGLOW™ Future Edition, as equipes da FIRST LEGO League participam de uma experiência baseada na biodiversidade utilizando os kits LEGO® Education Computer Science & AI.",
};

export default function FutureEditionPage() {
  return (
    <div className="flex flex-col min-h-screen space-y-8 py-10">
      <header className="max-w-6xl mx-auto w-full px-6">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-16">
          <div className="flex-1">
            <h1 className="inline-block bg-secondary text-secondary-content px-3 py-1 italic font-black text-5xl">
              Future Edition
            </h1>
            <p className="uppercase tracking-widest text-secondary mt-3 font-semibold">
              Baseado nos kits LEGO® Education Computer Science & AI
            </p>
            <div className="mt-8 space-y-5 text-base-content/75 text-justify text-sm">
              <p>
                Na BIOGLOW™ Future Edition, as equipes da FIRST LEGO League
                participam de uma experiência baseada na biodiversidade
                utilizando os kits LEGO® Education Computer Science & AI.
              </p>
              <p>
                Durante as partidas, as equipes constroem e programam hardware
                sem fio para resolver desafios em um novo formato de jogo
                cooperativo baseado em alianças.
              </p>
              <p>
                Além das missões do robô, o Projeto de Inovação incentiva a
                investigação sobre biodiversidade e sobre como a relação entre a
                natureza e a sociedade contribui para um planeta saudável.
              </p>
            </div>
          </div>

          <div className="flex justify-center flex-1">
            <div className="shadow-[20px_20px_0_theme(colors.secondary)]">
              <iframe
                width="560"
                height="315"
                src="https://www.youtube.com/embed/VS3-5l9XlwQ?si=e-Ayu1xJjxO5pJnF"
                title="Future Edition"
                className="max-w-full aspect-video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </header>
      <section className="max-w-6xl mx-auto px-6">
        <div className="alert alert-warning">
          <TriangleAlert className="w-6 h-6" />
          <div>
            <h3 className="font-bold">Conteúdo não oficial</h3>
            <p>
              A Future Edition ainda não possui suporte oficial da FIRST LEGO
              League no Brasil. As ferramentas disponibilizadas pela RoboStage
              têm caráter educacional e experimental, desenvolvidas para
              auxiliar equipes, técnicos e estudantes interessados em conhecer o
              formato da competição.
            </p>
          </div>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-6">
        <div className="mb-10">
          <h2 className="text-3xl font-bold">Ferramentas disponíveis</h2>
          <p className="text-base-content/70 mt-2">
            Recursos desenvolvidos para apoiar equipes durante a temporada.
          </p>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className="card bg-base-200 border border-base-300 shadow-none hover:shadow-[10px_10px_0_theme(colors.secondary)] transition-shadow">
            <div className="card-body">
              <h3 className="card-title">Pontuação</h3>
              <p>Simule partidas e calcule automaticamente sua pontuação.</p>
              <div className="card-actions justify-end">
                <button className="btn btn-secondary">Em breve</button>
              </div>
            </div>
          </div>

          <div className="card bg-base-200 border border-base-300 shadow-none hover:shadow-[10px_10px_0_theme(colors.secondary)] transition-shadow">
            <div className="card-body">
              <h3 className="card-title">Recursos</h3>
              <p>Acesse documentos, materiais e referências da temporada.</p>
              <div className="card-actions justify-end">
                <button className="btn btn-secondary" disabled>Explorar</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
