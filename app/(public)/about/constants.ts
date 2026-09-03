import { FeatureCardProps } from "./types";
import {
  Radio,
  Box,
  FlaskConical,
  Lightbulb,
  Palette,
  Timer,
  MessageSquare,
  Trophy,
  NotepadText,
  Book,
} from "lucide-react";

export const PLATFORM_FEATURES: FeatureCardProps[] = [
  {
    title: "QuickBrick Studio",
    description:
      "Ambiente estratégico para análise de missões, criação de matrizes táticas, planejamento de runs e documentação técnica de robôs desde as primeiras ideias.",
    icon: Box,
    colorClass: "text-orange-600 bg-orange-50",
  },
  {
    title: "LabTest",
    description:
      "Espaço avançado de testes e validação para estratégias de robôs, com análise de desempenho, feedback visual e acompanhamento da evolução da equipe nos treinos.",
    icon: Lightbulb,
    colorClass: "text-yellow-600 bg-yellow-50",
  },
  {
    title: "Think",
    description:
      "Hub colaborativo voltado ao Projeto de Inovação, reunindo brainstorming, design thinking, pesquisa, organização de ideias e prototipagem em um único ambiente.",
    icon: FlaskConical,
    colorClass: "text-green-600 bg-green-50",
  },
  {
    title: "FLL Score",
    description:
      "Sistema digital de pontuação inspirado nos torneios oficiais da FIRST LEGO League Challenge e Future Edition, com simulação de rounds, cálculo automático de missões e acompanhamento competitivo em tempo real.",
    icon: Trophy,
    colorClass: "text-red-600 bg-red-50",
  },
  {
    title: "Rubricas de Avaliação",
    description:
      "Ferramenta de avaliação baseada em rubricas, permitindo que juízes e avaliadores registrem notas, comentários e feedbacks estruturados para cada missão ou critério de desempenho.",
    icon: NotepadText,
    colorClass: "text-fuchsia-600 bg-fuchsia-50",
  },
  {
    title: "Timers",
    description:
      "Coleção de cronômetros inteligentes para treinos, apresentações e desafios, com modos personalizados.",
    icon: Timer,
    colorClass: "text-teal-600 bg-teal-50",
  },
  {
    title: "Recall",
    description:
      "Sistema de revisão gamificada com flashcards e perguntas estratégicas para fortalecer conhecimentos técnicos, preparar avaliações e consolidar o domínio da temporada.",
    icon: MessageSquare,
    colorClass: "text-cyan-600 bg-cyan-50",
  },
  {
    title: "Caderno de Anotações",
    description:
      "Espaço digital para registro de ideias, estratégias, observações e aprendizados, permitindo que equipes e mentores documentem seu progresso e compartilhem insights.",
    icon: Book,
    colorClass: "text-indigo-600 bg-indigo-50",
  },
  {
    title: "ShowLive",
    description:
      "Criador de microeventos de robótica, com controle de rodadas, rankings em tempo real, chamadas de equipes e experiências visuais inspiradas em grandes eventos de robótica.",
    icon: Radio,
    colorClass: "text-blue-600 bg-blue-50",
  },
  {
    title: "StyleLab",
    description:
      "Laboratório criativo para desenvolver identidades visuais, interfaces, painéis e experiências digitais personalizadas para equipes, torneios e projetos da RoboStage.",
    icon: Palette,
    colorClass: "text-purple-600 bg-purple-50",
  },
];
