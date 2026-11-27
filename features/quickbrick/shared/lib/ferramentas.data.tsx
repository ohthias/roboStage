import { asset } from "@/lib/assets";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BookText, Puzzle, FlaskConical, Theater } from "lucide-react";

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
  mobileSafe?: boolean;
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
    <div className="mt-1 grid w-full grid-cols-3 gap-2">
      {seasons.map((s: string) => {
        const season = seasonLogos[s];
        const [nome, ano] = (season?.name ?? s).split(" (");

        return (
          <button
            key={s}
            type="button"
            onClick={() => router.push(`${rota}/${s}`)}
            className="group/season stage-paper flex flex-col items-center gap-1.5 rounded-tl-xl rounded-br-xl border border-base-300 bg-base-100 px-1.5 pb-2 pt-1.5 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-base-content hover:shadow-[4px_4px_0_0_var(--color-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:hover:translate-y-0"
          >
            <span className="stage-dots grid h-16 w-full place-items-center rounded-tl-lg rounded-br-lg bg-base-200/70 [background-size:10px_10px]">
              <Image
                src={season?.image || "/images/icons/default-season.png"}
                alt=""
                width={64}
                height={64}
                className="h-12 w-12 object-contain transition-transform duration-300 group-hover/season:scale-110 motion-reduce:group-hover/season:scale-100"
              />
            </span>
            <span className="text-[11px] font-black uppercase leading-none tracking-tight">{nome}</span>
            {ano && <span className="font-mono text-[9px] leading-none text-base-content/45">{ano.replace(")", "")}</span>}
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
    image: asset("/images/products/quickbrick/Estrategia.png"),
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
    mobileSafe: true,
  },
  {
    id: 3,
    titulo: "Mapa de calor de missões",
    descricao:
      "Visualize as regiões mais problemáticas do tapete com um mapa de calor interativo.",
    categoria: "Simular",
    icon: <FlaskConical className="w-5 h-5" />,
    image: asset("/images/products/quickbrick/Heatmap.png"),
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
    image: asset("/images/products/quickbrick/SharksSimulator.png"),
    link: "/fll/quickbrick/sharks-simulator",
    customContent: null,
    mobileSafe: true,
    badge: "Atualizado",
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
    image: asset("/images/products/quickbrick/MatrizRisco.png"),
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
    image: asset("/images/products/quickbrick/MatrizSWOT.png"),
    customContent: null,
    mobileSafe: true,
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
    mobileSafe: true,
  },
  {
    id: 8,
    titulo: "Criador de Arenas",
    descricao:
      "Ferramenta para criar e personalizar arenas de competição, permitindo que os usuários desenhem layouts, adicionem obstáculos e definam regras específicas para simulações de robótica.",
    categoria: "Criar",
    icon: <Puzzle className="w-5 h-5" />,
    link: "/obr/quickbrick/criador-de-arenas",
    image: asset("/images/products/quickbrick/ArenaBuilder.png"),
    badge: "Atualizado",
    customContent: null,
  },
  {
    id: 9,
    titulo: "Mapa de palco",
    descricao:
      "Planeje a apresentação da OBR Artística: marcações no chão, desenhos livres, pistas de seguidor de linha e as trajetórias de robôs e atores em cada cena, com animação quadro a quadro e aviso de colisões.",
    categoria: "Criar",
    icon: <Theater className="w-5 h-5" />,
    link: "/obr/quickbrick/mapa-de-palco",
    image: asset("/images/products/quickbrick/StageMap.png"),
    customContent: null,
  },
];

export const ferramentasPorCompeticao: Record<string, number[]> = {
  fll: [1, 2, 3, 4, 5, 6, 7],
  obr: [8, 9, 5, 6],
};