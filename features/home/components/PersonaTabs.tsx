"use client";
import { asset } from "@/lib/assets";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Clock,
  Code,
  Cuboid,
  FlaskConical,
  GraduationCap,
  MessageSquare,
  Radio,
  School,
  ShieldCheck,
  Sparkles,
  Telescope,
} from "lucide-react";
import { Card, Kicker, Tabs } from "@/components/stage";

const personas = [
  {
    id: "iniciantes",
    label: "Equipes iniciantes",
    image: asset("/images/icons/EquipesIniciantes.svg"),
    text: "Comecem com uma estrutura simples para os primeiros passos: entendam a competição, conheçam as missões e organizem os treinos.",
    links: [
      { label: "Iniciantes da Challenge", href: "/fll/begins", icon: School },
      { label: "Iniciantes da Explore", href: "/fll/explore", icon: Telescope },
      { label: "Guia de Missões", href: "/fll/docs/missions-guide", icon: BookOpen },
    ],
  },
  {
    id: "tecnicos",
    label: "Técnicos",
    image: asset("/images/icons/Tecnicos.svg"),
    text: "Acompanhem a evolução técnica da equipe com treinos cronometrados, rubricas e testes registrados.",
    links: [
      { label: "Rubrica de Avaliação", href: "/fll/rubric", icon: GraduationCap },
      { label: "Timers", href: "/fll/timers", icon: Clock },
      { label: "Recall", href: "/fll/recall", icon: MessageSquare },
    ],
  },
  {
    id: "organizadores",
    label: "Organizadores",
    image: asset("/images/icons/Organizadores.svg"),
    text: "Centralizem partidas e resultados de torneios e microeventos em um ambiente pensado para a operação.",
    links: [
      { label: "ShowLive", href: "/showlive", icon: Radio },
      { label: "Entrar em um evento", href: "/universe", icon: Sparkles },
      { label: "Checklist de evento", href: "/fll/cheklist", icon: ShieldCheck },
    ],
  },
  {
    id: "avancadas",
    label: "Equipes avançadas",
    image: asset("/images/icons/EquipesAvancadas.svg"),
    text: "Transformem dados de desempenho em decisões: compare versões do robô e encontre onde está a perda de pontos.",
    links: [
      { label: "LabTest", href: "/labtest", icon: FlaskConical },
      { label: "QuickBrick Studio", href: "/fll/quickbrick", icon: Cuboid },
      { label: "Anatix", href: "/obr/anatix", icon: Code },
    ],
  },
] as const;

type PersonaId = (typeof personas)[number]["id"];

export default function PersonaTabs() {
  const [active, setActive] = useState<PersonaId>("iniciantes");
  const index = personas.findIndex((p) => p.id === active);
  const persona = personas[index];

  return (
    <div className="mt-12">
      <Tabs
        tabs={personas.map((p) => ({ value: p.id, label: p.label }))}
        value={active}
        onChange={setActive}
        tone="primary"
      />

      <Card
        role="tabpanel"
        corner
        className="mt-4 grid items-center gap-8 border border-base-300 p-6 sm:p-8 md:grid-cols-[220px_1fr]"
      >
        <div className="grid aspect-square w-40 place-items-center justify-self-center rounded-tl-3xl rounded-br-3xl bg-base-200 p-6 md:w-full">
          <Image src={persona.image} alt="" aria-hidden width={180} height={180} className="h-full w-full object-contain" />
        </div>
        <div>
          <Kicker>
            {String(index + 1).padStart(2, "0")} · {persona.label.toUpperCase()}
          </Kicker>
          <p className="mt-3 max-w-2xl text-base leading-7 text-base-content/75 sm:text-lg sm:leading-8">
            {persona.text}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {persona.links.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-3 rounded-tl-xl rounded-br-xl border border-base-300 bg-base-100 px-4 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-[4px_4px_0_0_var(--color-primary)]"
              >
                <Icon size={17} className="shrink-0 text-primary" />
                <span className="flex-1">{label}</span>
                <ArrowRight
                  size={15}
                  className="text-base-content/35 transition-transform group-hover:translate-x-1 group-hover:text-primary"
                />
              </Link>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
