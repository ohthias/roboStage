"use client";

import CurvedLoop from "@/components/UI/CurvedLoop/CurvedLoop";
import { Footer } from "@/components/UI/Footer";
import { Navbar } from "@/components/UI/Navbar";
import {
  Leaf,
  Bot,
  CircuitBoard,
  Globe2,
  Sparkles,
  Users,
  ShieldCheck,
} from "lucide-react";

const programs = [
  {
    title: "BIOGLOW™",
    subtitle: "FIRST® LEGO® League",
    age: "5 – 16 anos",
    release: "04 de agosto de 2026",
    description:
      "Uma experiência prática para introduzir crianças ao STEM com desafios inspirados na biodiversidade e no pensamento criativo.",
    image:
      "https://www.sistemafibra.org.br/sesi/images/categorias/noticias/2017/11-novembro/robotica-sesisistema-fibra.jpg",
    icon: Leaf,
    color: "466421",
  },
  {
    title: "BIOBUZZ™",
    subtitle: "FIRST® Tech Challenge",
    age: "12 – 18 anos",
    release: "12 de setembro de 2026",
    description:
      "Equipes projetam, constroem e programam robôs para um desafio dinâmico, com foco em colaboração, estratégia e inovação.",
    image:
      "https://www.ftcbenelux.eu/wp-content/themes/yootheme/cache/a3/FTC-Championship-2024-door-Thomas-Vugs-2024-02-24-LR067.jpg_compressed-a3c55c3f.jpeg",
    icon: Bot,
    color: "C98C02",
  },
  {
    title: "BIOCORE™",
    subtitle: "FIRST® Robotics Competition",
    age: "14 – 18 anos",
    release: "09 de janeiro de 2027",
    description:
      "Robôs de escala industrial, engenharia avançada e uma competição intensa que amplia liderança, organização e solução de problemas.",
    image:
      "https://firstroboticscanada.org/wp-content/uploads/2021/01/frcteamworkingonrobot-2-600x380-1.jpg",
    icon: CircuitBoard,
    color: "0F3B59",
  },
];

const highlights = [
  {
    title: "Biodiversidade",
    icon: Globe2,
  },
  {
    title: "Inovação",
    icon: Sparkles,
  },
  {
    title: "Trabalho em equipe",
    icon: Users,
  },
  {
    title: "Impacto real",
    icon: ShieldCheck,
  },
];

export default function Page() {
  return (
    <>
      <Navbar />
      <header className="bg-[url(/images/heroImage.webp)] bg-cover bg-bottom bg-no-repeat flex flex-col justify-center items-center h-[calc(100vh-80px)] bg-[#203935] relative overflow-hidden">
        <div className="flex justify-center items-center flex-col gap-2 text-center relative z-10">
          <p className="italic text-md text-white">Temporada 2026 - 2027</p>
          <h1 className="italic text-white font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
            FIRST® CANOPY™
          </h1>
          <p className="font-semibold text-lg text-white">
            Inspirada pela natureza. Impulsionada pela inovação.
          </p>
        </div>
        <a
          href="https://www.magnific.com/br/vetores-gratis/floresta-ilustracao-plana-desenhada-a-mao_29610992.htm#fromView=search&page=1&position=1&uuid=0d42a9de-b5ff-41eb-a3d4-967b0ab14993&query=canopy+florest"
          className="text-white underline absolute bottom-4 right-4 opacity-20 hover:opacity-100 text-xs"
        >
          Imagem de freepik
        </a>
      </header>
      <div className="bg-[#203935] py-20 relative overflow-hidden border border-[#203935] -mt-1">
        <div className="w-100 h-100 absolute bottom-0 left-0 transform translate-y-1/2 -translate-x-1/5 border-10 border-dashed border-[#6FA230] rounded-full opacity-20 hidden md:block animate-[spin_180s_linear_infinite]" />
        <div className="w-150 h-150 absolute top-0 right-0 transform translate-x-1/2 border-10 border-dashed border-[#6FA230] rounded-full opacity-20 hidden md:block animate-[spin_120s_linear_infinite]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="font-bold text-2xl text-white">
            Engenhe um planeta próspero
          </h2>
          <p className="text-lg text-white max-w-3xl mt-4">
            Nada na Terra prospera sozinho. Cada gene, espécie e ecossistema faz
            parte de uma rede rica de biodiversidade que sustenta a vida.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-8 max-w-2xl ml-auto">
            {highlights.map((highlight) => (
              <div key={highlight.title} className="flex items-center gap-2">
                <highlight.icon className="h-10 w-10 text-white bg-[#FABD32] rounded-full p-1" />
                <span className="italic text-white">{highlight.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <main className="relative overflow-hidden">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <h2 className="font-bold text-3xl">
            Programas para <span className="text-primary">todas as idades</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {programs.map((program) => (
              <div
                key={program.title}
                className="rounded-tl-[30px] rounded-br-[30px] shadow-md flex flex-col overflow-hidden relative hover:scale-105 transition-transform duration-300 hover:shadow-lg cursor-default select-none"
                style={{ backgroundColor: `#${program.color}` }}
              >
                <div className="relative w-full h-48 mb-4">
                  <img
                    src={program.image}
                    alt={program.title}
                    className="w-full h-48 object-cover"
                  />
                  <div
                    className="absolute inset-0 -bottom-1"
                    style={{
                      backgroundImage: `linear-gradient(to bottom, transparent, #${program.color})`,
                    }}
                  />
                </div>
                <div className="p-6 mt-2">
                  <p className="text-xs uppercase text-white leading-relaxed">
                    {program.subtitle}
                  </p>
                  <h3 className="font-bold text-2xl text-white">
                    {program.title}
                  </h3>
                  <p className="text-white mt-2 text-sm">
                    {program.description}
                  </p>
                  <div className="mt-10 flex items-center justify-between flex-row text-white">
                    <p className="text-xs">{program.age}</p>
                    <p>{program.release}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <CurvedLoop
          marqueeText="Muito mais que robôs ▪"
          speed={0.2}
          curveAmount={0}
          direction="right"
          interactive={false}
          className="fill-neutral-content -rotate-1 mt-10"
        />

        <section className="mt-2 max-w-6xl mx-auto px-4 pt-8 py-24 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8 items-center justify-between">
          <div>
            <h2 className="font-bold text-3xl">
              Uma comunidade global que <span className="bg-primary text-white">muda vidas</span>
            </h2>
            <p className="text-lg mt-4">
              A FIRST é mais do que robótica. É uma rede de estudantes,
              mentores, educadores, voluntários, patrocinadores, pais e
              ex-alunos dedicados a desenvolver habilidades para o futuro.
            </p>
          </div>
          <img
            src="https://community.firstinspires.org/hubfs/20250419BEN01206%20(1).jpg"
            alt="Equipe colaborando"
            className="h-full w-full md:max-w-1/2 object-cover"
            style={{ boxShadow: "10px 10px 0 #CF2A2A" }}
          />
        </section>

        <section className="w-full bg-neutral text-neutral-content py-24 px-4 relative">
          <div className="absolute w-screen h-10 bg-gradient-to-t from-neutral to-transparent -top-10 left-0 " />
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-black leading-tight">
              Bem-vindo à FIRST® CANOPY™ no ROBOSTAGE
            </h2>
            <p className="mt-6 text-lg md:text-xl text-neutral-content/70 max-w-3xl mx-auto">
              Construindo, resolvendo problemas e crescendo mais fortes através
              do trabalho em equipe.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
              <button className="btn btn-primary rounded-2xl px-8" onClick={() => window.location.href = "/auth/signup"}>
                Criar conta grátis
              </button>
              <button className="btn btn-ghost text-neutral-content rounded-2xl px-8" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                Voltar para o Início
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
