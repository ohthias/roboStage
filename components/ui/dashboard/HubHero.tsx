"use client";

import React, { useEffect, useRef } from "react";
import {
  ChartPie,
  Palette,
  RadioIcon,
  Book,
  Rocket,
  TestTube,
  Calendar,
  CheckCircle2,
  Clock,
  Star,
  Trophy,
  Users,
  Zap,
  FlaskConical,
  Settings,
  Wrench,
  CalendarDays,
  Activity,
  Target,
  Bot,
  Lightbulb,
} from "lucide-react";
import { motion } from "framer-motion";
import AchievementSummary from "./AchievementSummary";
import { supabase } from "@/utils/supabase/client";

export default function HubHero({
  session,
  username,
  achievements,
}: {
  session: any;
  username: string;
  achievements: any[];
}) {
  const [userStats, setUserStats] = React.useState({
    total_tests: 0,
    total_eventos: 0,
    total_themes: 0,
    total_documents: 0,
  });

  const MOCK_TASKS = [
    {
      id: 1,
      title: "Revisar missão da rodada",
      category: "FLL",
      priority: "Alta",
      completed: false,
    },
    {
      id: 2,
      title: "Enviar relatório do robô",
      category: "Equipe",
      priority: "Média",
      completed: false,
    },
    {
      id: 3,
      title: "Atualizar portfólio",
      category: "Perfil",
      priority: "Baixa",
      completed: false,
    },
  ];

  const MOCK_USER = {
    level: "Nível 7",
    title: "Construtor Estratégico",
    xp: 780,
    nextLevelXp: 1000,
    streak: 5,
    completed: 18,
    total: 24,
    nextReward: "Badge Mentor Bronze",
  };

  const MOCK_RECENT_ACHIEVEMENTS = [
    {
      id: 1,
      title: "Primeira Missão Concluída",
      icon: Trophy,
      color: "text-yellow-500",
    },
    {
      id: 2,
      title: "Código Otimizado",
      icon: Zap,
      color: "text-purple-500",
    },
    {
      id: 3,
      title: "Precisão Máxima",
      icon: Target,
      color: "text-red-500",
    },
    {
      id: 4,
      title: "Trabalho em Equipe",
      icon: Users,
      color: "text-blue-500",
    },
    {
      id: 5,
      title: "Inovador do Mês",
      icon: Lightbulb,
      color: "text-green-500",
    },
    {
      id: 6,
      title: "Especialista em Robótica",
      icon: Bot,
      color: "text-indigo-500",
    },
    {
      id: 7,
      title: "Mestre das Missões",
      icon: Star,
      color: "text-yellow-400",
    },
    {
      id: 8,
      title: "Campeão de Testes",
      icon: CheckCircle2,
      color: "text-green-400",
    },
  ];

  const MOCK_EVENTS = [
    {
      id: 1,
      name: "Treino semanal",
      date: "2026-01-10",
      location: "Espaço maker",
    },
    { id: 2, name: "Simulado FLL", date: "2026-01-15", location: "Arena" },
    { id: 3, name: "Revisão técnica", date: "2026-01-20", location: "Online" },
  ];

  const MOCK_WEEK = [
    { day: "Seg", date: 6, hasEvent: true },
    { day: "Ter", date: 7, hasEvent: false },
    { day: "Qua", date: 8, hasEvent: true },
    { day: "Qui", date: 9, hasEvent: false },
    { day: "Sex", date: 10, hasEvent: true },
    { day: "Sáb", date: 11, hasEvent: false },
    { day: "Dom", date: 12, hasEvent: false },
  ];

  const MOCK_TEAM_ACTIVITY = [
    {
      id: 1,
      team: "Equipe Alpha",
      action: "atualizou a estratégia da missão",
      time: "há 10 min",
      user: {
        name: "Ana Souza",
        avatar: "https://i.pravatar.cc/100?img=12",
      },
    },
    {
      id: 2,
      team: "Equipe Beta",
      action: "adicionou um novo teste",
      time: "há 1h",
      user: {
        name: "Lucas Pereira",
        avatar: "https://i.pravatar.cc/100?img=32",
      },
    },
  ];

  const QUICK_TOOLS = [
    { name: "Calibribot", icon: Wrench },
    { name: "Espaço de Equipes", icon: Users },
    { name: "Agenda", icon: Calendar },
    { name: "Conquistas", icon: Trophy },
    { name: "Laboratório", icon: FlaskConical },
    { name: "Configurações", icon: Settings },
  ];

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from("user_activity_summary")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (!error && data) {
        setUserStats({
          total_tests: data.total_tests || 0,
          total_eventos: data.total_eventos || 0,
          total_themes: data.total_themes || 0,
          total_documents: data.total_documents || 0,
        });
      }
    };
    fetchUserStats();
  }, [session]);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (!carouselRef.current) return;

      const items = carouselRef.current.children;
      const total = items.length;

      index = (index + 1) % total;

      const element = items[index] as HTMLElement;
      element.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }, 10000); // 10s por slide

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full min-h-screen bg-base-200">
      <header className="px-6 pt-4 space-y-8">
        {/* Welcome */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Bem-vindo de volta,{" "}
            <span className="text-primary">{username} ✨</span>
          </h1>
          <p className="text-sm text-base-content/60 max-w-xl">
            Retome suas atividades e acompanhe seus recursos recentes.
          </p>
        </div>

        {/* Recent Access */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wide text-base-content/50">
              Acessos recentes
            </h2>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
            {/* Item */}
            <button className="group min-w-[220px] rounded-xl bg-base-100/50 hover:bg-base-100 transition p-3 flex items-center gap-3 cursor-pointer">
              <div className="p-2 rounded-lg bg-primary/10">
                <TestTube size={20} className="text-primary" />
              </div>

              <div className="flex flex-col text-left leading-tight">
                <span className="text-xs text-base-content/50">LabTest</span>
                <span className="text-sm font-medium line-clamp-1">
                  Teste 1
                </span>
              </div>
            </button>

            {/* Item */}
            <button className="group min-w-[220px] rounded-xl bg-base-100/50 hover:bg-base-100 transition p-3 flex items-center gap-3 cursor-pointer">
              <div className="p-2 rounded-lg bg-primary/10">
                <Rocket size={20} className="text-primary" />
              </div>

              <div className="flex flex-col text-left leading-tight">
                <span className="text-xs text-base-content/50">ShowLive</span>
                <span className="text-sm font-medium line-clamp-1">
                  Campeonato FLL 2024
                </span>
              </div>
            </button>
          </div>
        </section>
      </header>
      <main className="grid grid-cols-1 lg:grid-cols-6 gap-4 px-6 pt-6">
        {/* Tarefas Pendentes — Card principal */}
        <section className="lg:col-span-4 bg-base-100 rounded-2xl p-5 border border-base-300 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Tarefas pendentes
            </h2>
            <span className="text-xs text-base-content/50">Hoje</span>
          </div>

          <ul className="space-y-3">
            {MOCK_TASKS.filter((t) => !t.completed)
              .slice(0, 4)
              .map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-base-200/60 hover:bg-base-200 transition"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium truncate">
                      {task.title}
                    </span>
                    <span className="text-xs text-base-content/50">
                      {task.category} • {task.priority}
                    </span>
                  </div>
                  <Clock className="w-4 h-4 text-base-content/40" />
                </li>
              ))}
          </ul>
        </section>

        {/* Evolução do usuário */}
        <section className="lg:col-span-2 row-span-2 bg-base-100 rounded-3xl p-6 border border-base-300 flex flex-col gap-6 hover:shadow-md transition-shadow">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-base-content/50">
                Evolução
              </p>
              <h2 className="text-lg font-semibold">{MOCK_USER.level}</h2>
              <p className="text-xs text-base-content/60">{MOCK_USER.title}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="badge badge-primary badge-sm">
                🔥 {MOCK_USER.streak} dias
              </span>
            </div>
          </div>

          {/* XP Ring + Stats */}
          <div className="grid grid-cols-3 gap-4 items-center">
            {/* Ring */}
            <div className="relative w-24 h-24 mx-auto">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-base-200"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-primary transition-all"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={
                    2 *
                    Math.PI *
                    42 *
                    (1 - MOCK_USER.xp / MOCK_USER.nextLevelXp)
                  }
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold">
                  {Math.round((MOCK_USER.xp / MOCK_USER.nextLevelXp) * 100)}%
                </span>
                <span className="text-[10px] text-base-content/50">XP</span>
              </div>
            </div>

            {/* KPIs */}
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-base-200/60 p-3">
                <p className="text-xs text-base-content/50">XP atual</p>
                <p className="text-sm font-semibold">
                  {MOCK_USER.xp}/{MOCK_USER.nextLevelXp}
                </p>
              </div>

              <div className="rounded-2xl bg-base-200/60 p-3">
                <p className="text-xs text-base-content/50">Atividades</p>
                <p className="text-sm font-semibold">
                  {MOCK_USER.completed}/{MOCK_USER.total}
                </p>
              </div>

              <div className="col-span-2">
                <progress
                  className="progress progress-primary h-1"
                  value={MOCK_USER.completed}
                  max={MOCK_USER.total}
                />
              </div>
            </div>
          </div>

          {/* Próxima recompensa */}
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-primary" />
            </div>
            <div className="text-sm">
              <p className="font-medium">Próxima recompensa</p>
              <p className="text-xs text-base-content/60">
                {MOCK_USER.nextReward}
              </p>
            </div>
          </div>

          {/* Conquistas recentes */}
          <div>
            <p className="text-xs uppercase tracking-widest text-base-content/50 mb-3">
              Conquistas recentes
            </p>

            <div className="grid grid-cols-4 gap-3">
              {MOCK_RECENT_ACHIEVEMENTS.map((ach) => (
                <div
                  key={ach.id}
                  className="group aspect-square rounded-2xl bg-base-200/60 flex items-center justify-center border border-base-300 hover:bg-primary/10 hover:border-primary/30 transition"
                  title={ach.title}
                >
                  <ach.icon className={`w-5 h-5 ${ach.color}`} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Agenda */}
        <section className="lg:col-span-2 row-span-2 bg-base-100 rounded-2xl p-5 border border-base-300 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold">Agenda</h2>
            </div>
            <button className="btn btn-sm btn-soft">Adicionar Evento</button>
          </div>

          <ul className="space-y-3">
            {MOCK_EVENTS.slice(0, 3).map((event) => (
              <li
                key={event.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-base-200/60"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                  {new Date(event.date).getDate()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{event.name}</p>
                  <p className="text-xs text-base-content/50 truncate">
                    {event.location}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Calendário semanal */}
        <section className="lg:col-span-2 bg-base-100 rounded-2xl p-5 border border-base-300 hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">Semana</h2>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center">
            {MOCK_WEEK.map((day) => (
              <div
                key={day.day}
                className={`rounded-xl p-2 text-xs flex flex-col items-center gap-1
            ${
              day.hasEvent
                ? "bg-primary/10 text-primary font-medium"
                : "bg-base-200/60 text-base-content/50"
            }`}
              >
                <span>{day.day}</span>
                <span className="text-sm font-semibold">{day.date}</span>
                {day.hasEvent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Atividades recentes das equipes */}
        <section className="lg:col-span-4 bg-base-100 rounded-2xl p-5 border border-base-300 hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">Atividades recentes</h2>
          </div>

          <ul className="space-y-3">
            {MOCK_TEAM_ACTIVITY.slice(0, 4).map((item) => (
              <li
                key={item.id}
                className="flex gap-3 p-3 rounded-xl bg-base-200/60"
              >
                {/* Avatar */}
                <img
                  src={item.user.avatar}
                  alt={item.user.name}
                  className="w-8 h-8 rounded-lg object-cover"
                />

                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">
                    <span className="font-medium">{item.user.name}</span>{" "}
                    <span className="text-base-content/70">{item.action}</span>{" "}
                    <span className="font-medium">{item.team}</span>
                  </p>
                  <span className="text-xs text-base-content/50">
                    {item.time}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Acesso Rápido — faixa final */}
        <section className="lg:col-span-6 bg-base-100 rounded-2xl p-5 border border-base-300 hover:shadow-sm transition-shadow">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Acesso rápido
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {QUICK_TOOLS.map((tool) => (
              <button
                key={tool.name}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-base-200/60 hover:bg-base-200 transition"
              >
                <tool.icon className="w-5 h-5 text-primary" />
                <span className="text-xs font-medium">{tool.name}</span>
              </button>
            ))}
          </div>
        </section>
      </main>
      <footer className="h-10 flex items-center justify-center border-t border-base-300 mt-6">
        <p className="text-base-content/50 text-sm">
          RoboStage&copy; - {new Date().getFullYear()} - v4.0.0
        </p>
      </footer>
    </div>
  );
}
