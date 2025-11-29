import React from 'react';
import type { Feature } from '@/types/Features';
import {RadioIcon, ChartPie, Book, Palette, ToyBrick} from 'lucide-react'



export const features: Feature[] = [
  {
    title: "QuickBrick Studio",
    text: "Documente, crie e simule seu robô com o QuickBrick Studio, a ferramenta que ajuda planejar suas estratégias na FLL Challenge - UNEARTHED!",
    icon: <ToyBrick />,
  },
  {
    title: "LabTest",
    text: "Teste e valide suas estratégias para as missões da FLL Challenge - UNEARTHED! Tendo acesso a estatísticas detalhadas do desempenho de seus lançamentos.",
    icon: <ChartPie />,
  },
  {
    title: "InnoLab",
    text: "Crie diagramas focados no processo do projeto de inovação da sua equipe!",
    icon: <Book />,
  },
  {
    title: "ShowLive",
    text: "Crie campeonatos da FIRST LEGO League, defina as rodadas, as equipes participantes e tenha uma experiência de torneio!",
    icon: <RadioIcon />,
  },
  {
    title: "StyleLab",
    text: "Crie temas e dê vida aos seus eventos com os seus próprios estilos!",
    icon: <Palette />,
  },
];