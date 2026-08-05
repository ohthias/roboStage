import { File, TriangleAlert, Trophy } from "lucide-react";
import Link from "next/link";

export default function FutureEditionPage() {
  return (
    <div className="flex flex-col min-h-screen space-y-8 py-10">
      <header className="max-w-6xl mx-auto w-full px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
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
                src="https://www.youtube.com/embed/vHT9L_x9P_E?si=YCe6R02B70qVlMEZ"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
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
          <Link className="group relative overflow-hidden rounded-2xl bg-base-300 p-8 text-left transition-all hover:-translate-y-1 hover:shadow-2xl border border-base-200 hover:border-base-200 w-full max-w-sm h-full" href="/fll/future-edition/score">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
              <Trophy size={120} />
            </div>
            <div className={`inline-flex p-3 rounded-lg bg-opacity-20 mb-4 bg-secondary text-white`}>
              <Trophy size={32} />
            </div>
            <h3 className={`text-2xl font-bold mb-2 text-secondary`}>Pontuador</h3>
            <p className="text-base-content/75">Simule partidas e calcule automaticamente sua pontuação.</p>
            <div className={`absolute bottom-0 left-0 h-1 w-0 bg-secondary group-hover:w-full transition-all duration-300`}/>
          </Link>
          <Link className="group relative overflow-hidden rounded-2xl bg-base-300 p-8 text-left transition-all hover:-translate-y-1 hover:shadow-2xl border border-base-200 hover:border-base-200 w-full max-w-sm h-full" href="/fll/docs">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
              <File size={120} />
            </div>
            <div className={`inline-flex p-3 rounded-lg bg-opacity-20 mb-4 bg-secondary text-white`}>
              <File size={32} />
            </div>
            <h3 className={`text-2xl font-bold mb-2 text-secondary`}>Documentação</h3>
            <p className="text-base-content/75">Acesse a documentação oficial da Future Edition.</p>
            <div className={`absolute bottom-0 left-0 h-1 w-0 bg-secondary group-hover:w-full transition-all duration-300`}/>
          </Link>
        </div>
      </section>
    </div>
  );
}
