"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/hooks/useDashboard";
import { Calendar, RefreshCw, Star } from "lucide-react";

import RecentItemRow from "./RecentItemRow";
import ActionCard from "./UI/ActionCard";
import StatCard from "./UI/StatCard";

import { formatDate, getGreetingPrefix } from "@/utils/helpers";
import { QuickAction } from "@/types/dashboard.types";
import { useState } from "react";
import StyleLabModal from "./StyleLab/StyleLabModal";
import CreateDiagramModal from "./InnoLab/CreateDiagramModal";
import { EventModal } from "../showLive/EventModal";
import { useFavoriteFolders } from "@/hooks/useFavoriteFolders";
import FavoriteFolderCard from "./UI/FavoriteFolderCard";
import LabTestForm from "./LabTest/LabTestForm";

export default function HubHero() {
  const { profile } = useAuth();

  const { stats, recentItems, config, loading, error, refresh } =
    useDashboard();

  const { folders: favoriteFolders, loading: favoritesLoading } =
    useFavoriteFolders();

  const firstName =
    profile?.full_name?.split(" ")[0] ?? profile?.username ?? "você";

  const greetingPrefix = getGreetingPrefix();

  const quickActions: QuickAction[] = [
    {
      id: "1",
      label: "Novo Evento",
      description: "Crie um evento rapidamente",
      icon: "calendar-event",
      colorClass: "text-primary",
      modal: "event",
    },
    {
      id: "2",
      label: "Novo Teste",
      description: "Monte um teste ou desafio",
      icon: "clipboard-check",
      colorClass: "text-success",
      modal: "test",
    },
    {
      id: "3",
      label: "Novo Conteúdo",
      description: "Adicione materiais e arquivos",
      icon: "file-text",
      colorClass: "text-info",
      modal: "content",
    },
    {
      id: "4",
      label: "Personalizar Tema",
      description: "Altere aparência e cores",
      icon: "palette",
      colorClass: "text-secondary",
      modal: "theme",
    },
  ];

  const [activeModal, setActiveModal] = useState<
    "event" | "test" | "content" | "theme" | null
  >(null);

  return (
    <div className="space-y-6">
      {/* HERO */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="card bg-gradient-to-br from-base-100 to-base-200 border border-base-300 rounded-3xl overflow-hidden shadow-sm">
          <div className="card-body p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              {/* LEFT */}
              <div className="flex items-center gap-4">
                {profile?.avatar_url ? (
                  <div className="avatar">
                    <div className="w-14 h-14 rounded-full ring ring-primary/20 ring-offset-2 shadow-md">
                      <img
                        src={profile.avatar_url}
                        alt={firstName}
                        draggable={false}
                        tabIndex={-1}
                        className="pointer-events-none select-none"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          // prevent infinite loop if placeholder missing
                          if (!target.dataset.fallback) {
                            target.dataset.fallback = "1";
                            target.src = "/images/logos/Icone.png";
                          }
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="avatar placeholder">
                    <div className="bg-primary/10 text-primary w-14 h-14 rounded-full ring ring-primary/20 ring-offset-2 shadow-md">
                      <span className="text-lg font-bold">
                        {firstName[0]?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs text-base-content/40 uppercase tracking-[0.2em] mb-1">
                    Painel de Controle · Robostage
                  </p>

                  <h1 className="text-2xl md:text-3xl font-bold leading-tight">
                    {greetingPrefix},{" "}
                    <span className="text-primary drop-shadow-sm">
                      {firstName}
                    </span>{" "}
                    <span className="wave inline-block">👋</span>
                  </h1>

                  <p className="text-sm text-base-content/50 mt-1">
                    {config.subtitle}
                  </p>
                </div>
              </div>

              {/* DATE */}
              <div className="flex items-center gap-2 text-sm text-base-content/60 bg-base-100 border border-base-300 px-4 py-2 rounded-2xl shadow-sm backdrop-blur self-start sm:self-auto">
                <Calendar className="w-4 h-4" />

                <span className="capitalize">{formatDate()}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ERROR */}
      {error && (
        <div className="alert alert-error rounded-2xl shadow-sm">
          <span className="text-sm">{error}</span>

          <button className="btn btn-sm btn-ghost ml-auto" onClick={refresh}>
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </button>
        </div>
      )}

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* LEFT COLUMN */}
        <div className="xl:col-span-2 space-y-6">
          {/* STATS */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.3 }}
          >
            <h2 className="text-sm font-bold text-base-content/70 uppercase tracking-wider mb-3">
              Resumo de atividade
            </h2>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="skeleton h-24 rounded-3xl opacity-70"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {config.statsToShow.map((key) => (
                  <StatCard key={key} statKey={key} value={stats?.[key] ?? 0} />
                ))}
              </div>
            )}
          </motion.div>

          {/* QUICK ACTIONS */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <h2 className="text-sm font-bold text-base-content/70 uppercase tracking-wider mb-3">
              Ações rápidas
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <ActionCard
                  key={action.id}
                  action={action}
                  onClick={() => setActiveModal(action.modal)}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="space-y-6"
        >
          {/* FAVORITES */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Star size={14} className="fill-warning text-warning" />

              <h2 className="text-sm font-bold text-base-content/70 uppercase tracking-wider">
                Pastas favoritas
              </h2>
            </div>

            <div className="card rounded-3xl border border-base-200 bg-base-100 shadow-sm">
              <div className="card-body p-4">
                {favoritesLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="skeleton h-16 rounded-2xl" />
                    ))}
                  </div>
                ) : favoriteFolders.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm font-medium text-base-content/60">
                      Nenhuma pasta favoritada
                    </p>

                    <p className="mt-1 text-xs text-base-content/40">
                      Favorite pastas importantes para acesso rápido.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {favoriteFolders.map((folder) => (
                      <FavoriteFolderCard key={folder.id} folder={folder} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RECENTS */}
          <div>
            <h2 className="text-sm font-bold text-base-content/70 uppercase tracking-wider mb-3">
              Acessos recentes
            </h2>

            <div className="card bg-base-100 border border-base-200 hover:border-primary/20 transition-all rounded-3xl shadow-sm">
              <div className="card-body p-5">
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="skeleton h-10 rounded-xl opacity-70"
                      />
                    ))}
                  </div>
                ) : recentItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <p className="font-medium text-sm text-base-content/60">
                      Nenhuma atividade recente
                    </p>

                    <p className="text-xs text-base-content/40 mt-1">
                      Seus últimos acessos aparecerão aqui.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {recentItems.map((item) => (
                      <RecentItemRow key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      {/* MODALS */}
      {activeModal === "event" && (
        <EventModal onClose={() => setActiveModal(null)} open={true} />
      )}
      {activeModal === "test" && <LabTestForm />}
      {activeModal === "content" && (
        <CreateDiagramModal onClose={() => setActiveModal(null)} open={true} />
      )}
      {activeModal === "theme" && (
        <StyleLabModal onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
}
