"use client";

import React, { useEffect, useRef, useState } from "react";
import {
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
  Book,
  Palette,
} from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { RecentAccess } from "./RecentAccess";

const ACCESS_ICONS = {
  test: TestTube,
  event: Rocket,
  document: Book,
  style: Palette,
};

type LastAccessItem = {
  resource_type: "test" | "event" | "document" | "style";
  resource_id: string;
  title: string;
  last_access: string;
};

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
  const [lastAccess, setLastAccess] = React.useState<LastAccessItem[]>([]);
  const [loadingAccess, setLoadingAccess] = useState(true);

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

    const fetchLastAcessedResources = async () => {
      const { data, error } = await supabase
        .from("user_last_access")
        .select("*")
        .eq("user_id", session.user.id)
        .order("last_access", { ascending: false })
        .limit(6);
      if (!error && data) {
        if (data) setLastAccess(data);
      }
      setLoadingAccess(false);
    };
    fetchUserStats();
    fetchLastAcessedResources();
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
        <RecentAccess items={lastAccess} loading={loadingAccess} />
      </header>
      <main className="grid grid-cols-1 lg:grid-cols-6 gap-4 px-6 pt-6"></main>
      <footer className="h-10 flex items-center justify-center border-t border-base-300 mt-6">
        <p className="text-base-content/50 text-sm">
          RoboStage&copy; - {new Date().getFullYear()} - v4.0.0
        </p>
      </footer>
    </div>
  );
}
