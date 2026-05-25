"use client";

import Link from "next/link";

import { useState } from "react";

import {
  ClipboardCheck,
  LogOut,
  Trophy,
  Settings2,
} from "lucide-react";

import AvaliacaoRounds from "../RoundSubmission";

import TabelaEquipes from "../TabelaEquipes";

interface Props {
  event: any;
}

type TabType = "avaliacao" | "ranking";

export default function VolunteerView({ event }: Props) {
  const [activeTab, setActiveTab] =
    useState<TabType>("avaliacao");

  return (
    <div className="min-h-screen bg-base-200">
      {/* HEADER */}
      <div className="navbar bg-base-100 border-b border-base-300 px-4 md:px-8">
        <div className="flex-1">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {event.name_event}
            </h1>

            <p className="text-sm opacity-70 mt-1">
              Painel do voluntário
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/" className="btn btn-outline gap-2">
              <LogOut className="w-4 h-4" />
              Sair
          </Link>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* TABS */}
        <div
          role="tablist"
          className="tabs tabs-boxed bg-base-100 w-fit mb-6 shadow-sm"
        >
          <button
            role="tab"
            onClick={() => setActiveTab("avaliacao")}
            className={`tab gap-2 ${
              activeTab === "avaliacao" ? "tab-active" : ""
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            Avaliação
          </button>

          <button
            role="tab"
            onClick={() => setActiveTab("ranking")}
            className={`tab gap-2 ${
              activeTab === "ranking" ? "tab-active" : ""
            }`}
          >
            <Trophy className="w-4 h-4" />
            Ranking
          </button>
        </div>

        {/* ABA AVALIAÇÃO */}
        {activeTab === "avaliacao" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* FORM */}
            <div className="w-full col-span-3">
              <div className="card bg-base-100 shadow-md border border-base-300">
                <div className="card-body">
                  <div className="flex items-center gap-3 mb-2">
                    <ClipboardCheck className="w-6 h-6 text-primary" />

                    <h2 className="card-title text-2xl">
                      Lançar pontuação
                    </h2>
                  </div>

                  <p className="text-sm opacity-70 mb-4">
                    Selecione a equipe e o round para registrar a avaliação.
                  </p>

                  <AvaliacaoRounds
                    idEvento={String(event.id_evento)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA RANKING */}
        {activeTab === "ranking" && (
          <div className="card bg-base-100 shadow-md border border-base-300">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-6 h-6 text-warning" />

                <h2 className="card-title text-2xl">
                  Ranking ao vivo
                </h2>
              </div>

              <TabelaEquipes
                idEvent={String(event.id_evento)}
                primaryColor="#ffffff"
                secondaryColor="#570df8"
                textColor="#ffffff"
                backgroundUrl=""
                backgroundBlur={false}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}