import type { LucideIcon } from "lucide-react";
import { BookOpen, Clock, Cuboid, Fish, Gamepad2, Leaf, MessageSquare, Palette, Pickaxe, School, ToyBrick, Telescope, NotepadText, ToolCase, ListCheck, MonitorDot, BookCopy, Code, Bot, UserSearch, PencilRuler, LayoutGrid } from "lucide-react";

/** Item de menu de competição: `path` é relativo a `/{competicao}/`. */
export type NavMenuItem = {
  nome: string;
  path: string;
  icon: LucideIcon;
  description?: string;
  new?: boolean;
  update?: boolean;
};

export type NavMenuGroup = {
  key: string;
  label: string;
  icon: LucideIcon;
  new?: boolean;
  update?: boolean;
  items: NavMenuItem[];
};

/** Item de menu com URL absoluta (usado fora das competições e na renderização). */
export type NavLinkItem = Omit<NavMenuItem, "path"> & { href: string };

export type NavLinkGroup = Omit<NavMenuGroup, "items"> & { items: NavLinkItem[] };

export const NAVIGATION = {
  fll: {
    label: "FLL",
    icon: ToyBrick,
    scorePath: "score",
    options: [
      { nome: "QuickBrick Studio", path: "quickbrick", icon: Cuboid, new: false, update: false },
      { nome: "Future Edition", path: "future-edition", icon: Gamepad2 },
    ],
    menus: [
      {
        key: "tools",
        label: "Ferramentas",
        icon: ToolCase,
        items: [
          { nome: "Recall", path: "recall", icon: MessageSquare, description: "Reavaliação de conceitos por meio de flashcards", update: true },
          { nome: "Rúbrica de Avaliação", path: "rubric", icon: NotepadText, description: "Ferramenta de avaliação interativa para competições de robótica" },
          { nome: "Mapa de Empatia", path: "empathy-map", icon: UserSearch, description: "Ferramenta para análise de empatia com o profissional alvo", new: false, update: true },
          { nome: "Timers", path: "timers", icon: Clock, description: "Temporizadores para auxiliar na gestão do tempo durante os treinos", update: true },
          { nome: "Partiu Mesa!", path: "partiu-mesa", icon: MonitorDot, description: "Simulador de simples para teste de saídas. Para análise de desempenho do robô durante um teste de saída." },
          { nome: "Confia, mas confira!", path: "cheklist", icon: ListCheck, description: "Checklist de verificação de itens para competições, seja para preparação ou para avaliação pós-evento." },
        ],
      },
      {
        key: "resources",
        label: "Recursos",
        icon: BookOpen,
        items: [
          { nome: "Documentações", path: "docs", icon: BookOpen, description: "Documentação das temporadas da liga" },
          { nome: "Guia de Missões", path: "docs/missions-guide", icon: BookCopy, description: "Guia de missões da FLL Challenge", new: false },
          { nome: "Iniciantes da Challenge", path: "begins", icon: School, description: "FLL para equipes iniciantes" },
          { nome: "Iniciantes da Explore", path: "explore", icon: Telescope, description: "FLL Explore para equipes iniciantes" },
        ],
      },
    ] satisfies NavMenuGroup[],
    seasons: [
      { key: "bioglow", name: "BIOGLOW", period: "2026/2027", icon: Leaf },
      { key: "unearthed", name: "UNEARTHED", period: "2025/2026", icon: Pickaxe },
      { key: "submerged", name: "SUBMERGED", period: "2024/2025", icon: Fish },
      { key: "masterpiece", name: "MASTERPIECE", period: "2023/2024", icon: Palette },
    ],
  },
  obr: {
    label: "OBR",
    icon: Bot,
    scorePath: "score",
    options: [
      { nome: "QuickBrick Studio", path: "quickbrick", icon: Cuboid, new: false },
    ],
    menus: [
      {
        key: "tools",
        label: "Ferramentas",
        icon: ToolCase,
        items: [
          { nome: "Recall", path: "recall", icon: MessageSquare, description: "Reavaliação de conceitos por meio de flashcards", update: true },
          { nome: "Timers", path: "timers", icon: Clock, description: "Temporizadores para auxiliar na gestão do tempo durante os treinos", update: true },
          { nome: "Confia, mas confira!", path: "cheklist", icon: ListCheck, description: "Checklist de verificação de itens para competições, seja para preparação ou para avaliação pós-evento.", update: true },
        ],
      },
      {
        key: "resources",
        label: "Recursos",
        icon: BookOpen,
        items: [
          { nome: "Documentações", path: "docs", icon: BookOpen, description: "Documentos e materiais de apoio para competição." },
          { nome: "Bastidores", path: "bastidores", icon: PencilRuler, description: "O que sua equipe precisa para brilhar no palco. Recursos que auxiliam no desenvolvimento do seu robÔ.", new: true },
        ],
      },
    ] satisfies NavMenuGroup[],
  },
};

/** Links simples exibidos fora das competições. */
export const NAVIGATION_MAIN_LINKS = [
  { href: "/about", label: "Sobre", new: false },
  { href: "/anatix", label: "Anatix", new: false },
  { href: "/roboticar", label: "Roboticar", new: true },
  { href: "/news", label: "Notícias", icon: NotepadText, new: false },
  { href: "/help", label: "Ajuda", icon: MessageSquare, new: false, update: true },
];

export const NAVIGATION_MAIN_MENUS: NavLinkGroup[] = [
  {
    key: "platforms",
    label: "Plataforma",
    icon: LayoutGrid,
    items: [
      { nome: "LabTest", href: "/labtest", icon: MonitorDot, description: "Transforme seus testes em resultados concretos com gráficos e análises" },
      { nome: "Stagebook", href: "/stagebook", icon: BookOpen, description: "Documente e organize os seus detalhes e projetos ou da sua equipe" },
      { nome: "ShowLive", href: "/showlive", icon: Telescope, description: "Crie eventos de robótica do seu jeito e compartilhe com o mundo" },
    ],
  },
];