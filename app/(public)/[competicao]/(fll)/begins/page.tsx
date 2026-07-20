import { TriangleAlert } from "lucide-react";
import { Metadata } from "next";

export const metadata : Metadata = {
  title: "Iniciando na FLL | RoboStage",
  description:
    "Guia para equipes iniciantes na FIRST LEGO League, com informações sobre como começar, recursos úteis e dicas para participar da competição.",
}

export default function BeginsPage() {
  return (
    <main className="p-8 max-w-6xl mx-auto w-full">
      <header className="mb-8 md:p-8">
        <div className="flex items-start gap-5">
          <div className="flex flex-col gap-2 items-start">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-content bg-primary w-max px-2">
              Iniciando na FLL
            </span>

            <h1 className="text-3xl font-extrabold leading-tight text-base-content md:text-5xl">
              FLL para equipes{" "}
              <span className="text-black bg-accent px-2">Iniciantes</span>
            </h1>

            <p className="max-w-2xl text-base text-base-content/70 md:text-lg">
              A FIRST LEGO League é uma competição de robótica e inovação que
              desafia equipes de estudantes a resolver problemas do mundo real
              utilizando LEGO® Education. Se você é novo na FLL, este guia irá
              ajudá-lo a começar sua jornada.
            </p>
          </div>
        </div>

        <div className="alert alert-warning alert-soft mt-8">
          <TriangleAlert className="w-6 h-6" />
          <div>
            <h3 className="font-bold">Conteúdo não oficial</h3>
            <p>
              O conteúdo desta página é baseado em informações públicas da FIRST
              LEGO League e em experiências de equipes e técnicos. Ele não é
              oficial da FLL e pode não refletir todas as regras ou práticas
              atuais da competição.
            </p>
          </div>
        </div>
      </header>
      <section className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">O que é a FLL?</h2>
          <p className="text-base text-base-content/70">
            A FIRST LEGO League (FLL) é uma competição internacional de
            robótica e inovação para estudantes de 9 a 16 anos. As equipes
            trabalham juntas para resolver desafios do mundo real, projetando,
            construindo e programando robôs LEGO® Education para completar
            missões em um tabuleiro de jogo.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">Como começar</h2>
          <p className="text-base text-base-content/70">
            Para começar na FLL, você precisará formar uma equipe, escolher um
            técnico ou mentor, e se inscrever na competição. É importante ler o Guia do Técnico e o Guia da Equipe, que fornecem informações detalhadas sobre as regras, os desafios e os recursos disponíveis.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">Recursos úteis</h2>
          <ul className="list-disc list-inside text-base text-base-content/70">
            <li>
              <a
                href="https://www.firstlegoleague.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Site oficial da FIRST LEGO League
              </a>
            </li>
            <li>
              <a
                href="https://www.firstinspires.org/resource-library/fll"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Biblioteca de recursos da FIRST
              </a>
            </li>
            <li>
              <a
                href="https://www.firstinspires.org/programs/fll/game-and-season"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Informações sobre a temporada atual
              </a>
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}