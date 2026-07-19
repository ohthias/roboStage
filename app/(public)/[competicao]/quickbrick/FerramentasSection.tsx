import Image from "next/image";
import { useRouter } from "next/navigation";
import { BookText, Puzzle, FlaskConical } from "lucide-react";

interface FerramentasSectionProps {
  seasons: string[];
  seasonLogos: Record<string, { name: string; image: string }>;
}

interface SeasonLogo {
  name: string;
  image: string;
}

interface Ferramenta {
  id: number;
  titulo: string;
  descricao: string;
  categoria: string;
  icon: React.ReactNode;
  image?: string;
  link?: string;
  badge?: string;
  feitoPor?: string;
  customContent?:
    | null
    | ((
        seasons: string[],
        seasonLogos: Record<string, SeasonLogo>,
        router: ReturnType<typeof useRouter>,
      ) => React.ReactNode);
}

export default function FerramentasSection({
  seasons,
  seasonLogos,
}: FerramentasSectionProps) {
  const router = useRouter();

  const ferramentas = [
    {
      id: 1,
      titulo: "Estratégias",
      descricao:
        "Desenhe diretamente sobre a imagem do tapete e planeje cada movimento do seu robô.",
      categoria: "Criar",
      icon: <Puzzle className="w-5 h-5" />,
      image: "/images/QuickBrick/Estrategia.png",
      link: "/fll/quickbrick/estrategia",
      customContent: null,
    },
    {
      id: 2,
      titulo: "Matriz SWOT das Missões",
      descricao:
        "Escolha uma temporada para organizar as missões em Forças, Fraquezas, Oportunidades e Ameaças.",
      categoria: "Documentar",
      icon: <BookText className="w-5 h-5" />,
      customContent: (
        seasons: string[],
        seasonLogos: Record<string, SeasonLogo>,
        router: ReturnType<typeof useRouter>,
      ) => (
        <div className="grid grid-cols-3 gap-2 mt-2 w-full mx-auto">
          {seasons.map((s: string) => {
            const season = seasonLogos[s];

            return (
              <button
                key={s}
                onClick={() => router.push(`/fll/quickbrick/matriz-swot/${s}`)}
                className="group/card w-full flex items-center justify-center flex-col gap-2 px-2 py-1 rounded-xl border border-base-300/60 bg-base-100 hover:border-primary hover:bg-base-200/50 transition-all duration-300 cursor-pointer"
              >
                <div className="flex itens-center gap-2 flex-col justify-center">
                  <Image
                    src={season?.image || "/images/icons/default-season.png"}
                    alt={season?.name || "Temporada FLL"}
                    width={75}
                    height={75}
                    className="object-contain rounded-lg bg-base-200/70 p-1 h-20 w-20 mx-auto"
                  />
                  <p className="text-[12px] text-center">{season?.name}</p>
                </div>
                <span className="text-xs font-semibold text-primary opacity-0 group-hover/card:opacity-100 transition-opacity mt-1">
                  Abrir →
                </span>
              </button>
            );
          })}
        </div>
      ),
    },
    {
      id: 3,
      titulo: "Mapa de calor de missões",
      descricao:
        "Visualize as regiões mais problemáticas do tapete com um mapa de calor interativo.",
      categoria: "Simular",
      icon: <FlaskConical className="w-5 h-5" />,
      image: "/images/QuickBrick/Heatmap.png",
      link: "/fll/quickbrick/heatmap",
      customContent: null,
    },
    {
      id: 4,
      titulo: "Sharks Simulator",
      descricao:
        "Simulador visual de trajetórias para robôs da FLL. Permite definir movimentos retos e giros, visualizando a trajetória resultante sobre o tapete de competição.",
      categoria: "Simular",
      icon: <FlaskConical className="w-5 h-5" />,
      image: "/images/QuickBrick/SharksSimulator.png",
      link: "/fll/quickbrick/sharks-simulator",
      customContent: null,
      feitoPor: "Sharks",
    },
    {
      id: 5,
      titulo: "Matriz de Risco",
      descricao:
        "Identifique e avalie os riscos potenciais para o sucesso do seu robô.",
      categoria: "Documentar",
      icon: <BookText className="w-5 h-5" />,
      link: "/fll/quickbrick/matriz-de-risco",
      image: "/images/QuickBrick/MatrizRisco.png",
      customContent: null,
    },
    {
      id: 6,
      titulo: "Matriz SWOT",
      descricao:
        "Análise seu robô usando a ferramenta SWOT para identificar pontos de força, fraquezas, oportunidades e ameaças.",
      categoria: "Documentar",
      icon: <BookText className="w-5 h-5" />,
      link: "/fll/quickbrick/swot",
      image: "/images/QuickBrick/MatrizSWOT.png",
      customContent: null,
    },
    {
      id: 7,
      titulo: "Tabela de análise de missões",
      descricao:
        "Organize e Analise as missões da temporada UNEARTHED de forma prática.",
      categoria: "Documentar",
      icon: <BookText className="w-5 h-5" />,
      customContent: (
        seasons: string[],
        seasonLogos: { [x: string]: any },
        router: any,
      ) => (
        <div className="grid grid-cols-3 gap-2 mt-2 w-full mx-auto">
          {seasons.map((s: string) => {
            const season = seasonLogos[s];

            return (
              <button
                key={s}
                onClick={() =>
                  router.push(`/fll/quickbrick/tabela-de-missoes/${s}`)
                }
                className="group/card w-full flex items-center justify-center flex-col gap-2 px-2 py-1 rounded-xl border border-base-300/60 bg-base-100 hover:border-primary hover:bg-base-200/50 transition-all duration-300 cursor-pointer"
              >
                <div className="flex itens-center gap-2 flex-col justify-center">
                  <Image
                    src={season?.image || "/images/icons/default-season.png"}
                    alt={season?.name || "Temporada FLL"}
                    width={75}
                    height={75}
                    className="object-contain rounded-lg bg-base-200/70 p-1 h-20 w-20 mx-auto"
                  />
                  <p className="text-[12px] text-center">{season?.name}</p>
                </div>
                <span className="text-xs font-semibold text-primary opacity-0 group-hover/card:opacity-100 transition-opacity mt-1">
                  Abrir →
                </span>
              </button>
            );
          })}
        </div>
      ),
    },
  ] as Ferramenta[];

  const filtradas = ferramentas;

  return (
    <section className="grid gap-6 sm:grid-cols-2 w-full md:grid-cols-3">
      {filtradas.map((ferramenta) => (
        <div
          key={ferramenta.id}
          className="group relative card bg-base-100 border border-base-300 rounded-none rounded-tl-[30px] rounded-br-[30px] overflow-hidden hover:border-primary hover:shadow-[10px_10px_0_theme(colors.primary))] transition-colors cursor-pointer"
          onClick={() => {
            if (ferramenta.link) router.push(ferramenta.link);
          }}
        >
          {/* Badge */}
          {ferramenta.badge && (
            <div className="absolute top-4 right-4 z-10 badge badge-secondary badge-sm">
              {ferramenta.badge}
            </div>
          )}

          {/* Imagem */}
          {ferramenta.image && (
            <figure className="relative">
              <Image
                src={ferramenta.image}
                alt={ferramenta.titulo}
                width={400}
                height={225}
                className="w-full aspect-video object-cover transition-transform duration-300 group-hover:scale-105"
                loading="eager"
              />

              {/* Overlay suave */}
              <div className="absolute inset-0 bg-gradient-to-t from-base-100/70 via-transparent to-transparent -bottom-1" />
            </figure>
          )}

          {/* Corpo */}
          <div className="card-body gap-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-primary/10 text-primary">
                {ferramenta.icon}
              </span>

              <span className="text-xs font-semibold uppercase tracking-wider text-primary/70">
                {ferramenta.categoria}
              </span>
            </div>

            <h2 className="text-lg font-bold leading-tight">
              {ferramenta.titulo}
            </h2>

            <p className="text-sm opacity-80 leading-relaxed">
              {ferramenta.descricao}
            </p>

            {/* Conteúdo customizado */}
            {ferramenta.customContent &&
              ferramenta.customContent(seasons, seasonLogos, router)}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 pb-5 pt-0">
            {ferramenta.feitoPor ? (
              <span className="text-xs font-semibold text-secondary">
                Desenvolvido por {ferramenta.feitoPor}
              </span>
            ) : (
              <span />
            )}

            {ferramenta.customContent ? null : (
              <span className="text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-primary">
                Abrir ferramenta →
              </span>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
