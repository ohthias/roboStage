import React from 'react';
import type { Feature } from '@/types/Features';
import QuickBrickImage from "@/public/images/icons/3.png";
import LabTestImage from "@/public/images/icons/2.png";
import ShowLiveImage from "@/public/images/icons/1.png";
import StyleLabImage from "@/public/images/icons/4.png";

const iconClass = "size-24 md:size-42 object-contain";

const QuickBrickIcon = () => (
    <img src={QuickBrickImage.src} alt="QuickBrick Icon" className={iconClass} />
);

const LabTestIcon = () => (
    <img src={LabTestImage.src} alt="LabTest Icon" className={iconClass} />
);

const InnoLabIcon = () => (
    <img src={ShowLiveImage.src} alt="InnoLab Icon" className={iconClass} />
);

const ShowLiveIcon = () => (
    <img src={ShowLiveImage.src} alt="ShowLive Icon" className={iconClass} />
);

const StyleLabIcon = () => (
    <img src={StyleLabImage.src} alt="StyleLab Icon" className={iconClass} />
);


export const features: Feature[] = [
  {
    title: "QuickBrick Studio",
    text: "Documente, crie e simule seu robô com o QuickBrick Studio, a ferramenta que ajuda planejar suas estratégias na FLL Challenge - UNEARTHED!",
    icon: <QuickBrickIcon />,
  },
  {
    title: "LabTest",
    text: "Teste e valide suas estratégias para as missões da FLL Challenge - UNEARTHED! Tendo acesso a estatísticas detalhadas do desempenho de seus lançamentos.",
    icon: <LabTestIcon />,
  },
  {
    title: "InnoLab",
    text: "Crie diagramas focados no processo do projeto de inovação da sua equipe!",
    icon: <InnoLabIcon />,
  },
  {
    title: "ShowLive",
    text: "Crie campeonatos da FIRST LEGO League, defina as rodadas, as equipes participantes e tenha uma experiência de torneio!",
    icon: <ShowLiveIcon />,
  },
  {
    title: "StyleLab",
    text: "Crie temas e dê vida aos seus eventos com os seus próprios estilos!",
    icon: <StyleLabIcon />,
  },
];