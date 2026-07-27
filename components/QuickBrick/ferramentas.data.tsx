import Image from "next/image";
import { useRouter } from "next/navigation";
import { BookText, Puzzle, FlaskConical } from "lucide-react";

export interface SeasonLogo {
  name: string;
  image: string;
}

export interface Ferramenta {
  id: number;
  titulo: string;
  descricao: string;
  categoria: string;
  icon: React.ReactNode;
  image?: string;
  link?: string;
  badge?: string;
  feitoPor?: [string, string];
  customContent?:
    | null
    | ((
        seasons: string[],
        seasonLogos: Record<string, SeasonLogo>,
        router: ReturnType<typeof useRouter>,
      ) => React.ReactNode);
}

/**
 * Renderiza o grid de temporadas usado pelas ferramentas que navegam
 * para uma rota específica por temporada (ex: Matriz SWOT, Tabela de missões).
 */
function renderSeletorDeTemporadas(
  seasons: string[],
  seasonLogos: Record<string, SeasonLogo>,
  router: ReturnType<typeof useRouter>,
  rota: string,
) {
  return (
    <div className="grid grid-cols-3 gap-2 mt-2 w-full mx-auto">
      {seasons.map((s: string) => {
        const season = seasonLogos[s];

        return (
          <button
            key={s}
            onClick={() => router.push(`${rota}/${s}`)}
            className="group/card w-full flex items-center justify-center flex-col gap-2 px-2 py-1 rounded-xl border border-base-300/60 bg-base-100 hover:border-primary hover:bg-base-200/50 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center gap-2 flex-col justify-center">
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
  );
}

export const ferramentas: Ferramenta[] = [
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
    customContent: (seasons, seasonLogos, router) =>
      renderSeletorDeTemporadas(
        seasons,
        seasonLogos,
        router,
        "/fll/quickbrick/matriz-swot",
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
    feitoPor: ["Sharks", "https://www.instagram.com/sharksfll_12476/"],
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
    link: "/fll/quickbrick/matriz-swot",
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
    customContent: (seasons, seasonLogos, router) =>
      renderSeletorDeTemporadas(
        seasons,
        seasonLogos,
        router,
        "/fll/quickbrick/tabela-de-missoes",
      ),
  },
];