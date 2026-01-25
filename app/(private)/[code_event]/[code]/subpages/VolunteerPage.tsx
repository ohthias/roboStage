"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { NavigationBar } from "../components/NavigationBar";
import AvaliacaoRounds from "@/components/showLive/RoundSubmission";
import AvaliacaoPlayOffs from "@/components/showLive/volunteer/AvaliacaoPlayOffs";
import Loader from "@/components/Loader";
import Header from "@/components/UI/Header";

type VolunteerTab = "hub" | "avalia" | "playoffs";

export default function VolunteerPage() {
  const params = useParams();
  const code_event = params?.code_event as string;

  const [idEvento, setIdEvento] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<VolunteerTab>("hub");

  useEffect(() => {
    const fetchEvent = async () => {
      if (!code_event) return;

      setLoading(true);

      const { data } = await supabase
        .from("events")
        .select("id_evento")
        .eq("code_event", code_event)
        .single();

      if (data) setIdEvento(data.id_evento);
      setLoading(false);
    };

    fetchEvent();
  }, [code_event]);

  if (loading || !idEvento) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-base-100 to-base-300">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-300 p-6 pb-24">
      <NavigationBar
        eventId={idEvento}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="mt-8 max-w-7xl mx-auto">
        {activeTab === "hub" && (
          <div className="animate-fade-in space-y-6">
            <Header
              type="Voluntário"
              name="Painel de"
              highlight="Voluntários"
              description="Gerencie suas atividades como voluntário do ShowLive aqui."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <HubCard
                title="Avaliar Rounds"
                description="Acesse as submissões dos rounds para avaliação."
                actionLabel="Ir para Avaliação"
                primary
                onClick={() => setActiveTab("avalia")}
              />
            </div>
          </div>
        )}

        {activeTab === "avalia" && (
          <div className="animate-fade-in">
            <AvaliacaoRounds idEvento={idEvento.toString()} />
          </div>
        )}

        {activeTab === "playoffs" && (
          <div className="animate-fade-in">
            <AvaliacaoPlayOffs idEvento={idEvento} />
          </div>
        )}
      </main>
    </div>
  );
}

function HubCard({
  title,
  description,
  actionLabel,
  onClick,
  primary,
  destructive,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onClick?: () => void;
  primary?: boolean;
  destructive?: boolean;
}) {
  const buttonStyle = primary
    ? "btn-primary"
    : destructive
      ? "btn-error"
      : "btn-outline";

  return (
    <div className="relative rounded-2xl bg-base-100/60 backdrop-blur-xl border border-base-300 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="p-6 flex flex-col h-full justify-between">
        <div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-sm opacity-80">{description}</p>
        </div>

        <button className={`btn ${buttonStyle} mt-6 w-full`} onClick={onClick}>
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
