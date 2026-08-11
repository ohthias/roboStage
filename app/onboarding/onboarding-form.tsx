"use client";

import { useMemo, useState, useTransition } from "react";
import { completeOnboarding, type LeagueSelectionInput } from "./actions";
import type { LeagueRow } from "@/db/schema";
import {
  Bot,
  GraduationCap,
  Heart,
  Trophy,
  Check,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Users,
} from "lucide-react";

type PersonaType =
  | "competidor"
  | "mentor_tecnico"
  | "entusiasta"
  | "organizador";

const PERSONAS: {
  value: PersonaType;
  name: string;
  desc: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "competidor",
    name: "Competidor",
    desc: "Corro missões, calibro o robô e persigo pontuação.",
    icon: <Trophy className="size-7" />,
  },
  {
    value: "mentor_tecnico",
    name: "Mentor / Técnico",
    desc: "Acompanho a equipe, reviso estratégias e o setup do robô.",
    icon: <GraduationCap className="size-7" />,
  },
  {
    value: "entusiasta",
    name: "Entusiasta",
    desc: "Acompanho o universo da robótica sem competir formalmente.",
    icon: <Heart className="size-7" />,
  },
  {
    value: "organizador",
    name: "Organizador",
    desc: "Coordeno eventos, torneios ou múltiplas equipes.",
    icon: <Users className="size-7" />,
  },
];

type LeagueState = {
  relationType: LeagueSelectionInput["relationType"] | null;
  teamName: string;
  season: string;
};

export function OnboardingForm({ leagues }: { leagues: LeagueRow[] }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [persona, setPersona] = useState<PersonaType | null>(null);
  const [selections, setSelections] = useState<Record<string, LeagueState>>(
    {},
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeCount = useMemo(
    () => Object.values(selections).filter((s) => s.relationType).length,
    [selections],
  );

  function setRelation(
    leagueId: string,
    relationType: LeagueSelectionInput["relationType"],
  ) {
    setSelections((prev) => {
      const current = prev[leagueId];
      const next =
        current?.relationType === relationType ? null : relationType;

      return {
        ...prev,
        [leagueId]: {
          relationType: next,
          teamName: current?.teamName ?? "",
          season: current?.season ?? "",
        },
      };
    });
  }

  function setField(
    leagueId: string,
    field: "teamName" | "season",
    value: string,
  ) {
    setSelections((prev) => ({
      ...prev,
      [leagueId]: {
        relationType: prev[leagueId]?.relationType ?? null,
        teamName: prev[leagueId]?.teamName ?? "",
        season: prev[leagueId]?.season ?? "",
        [field]: value,
      },
    }));
  }

  function goToStep2() {
    if (!persona) {
      setError("Escolha um perfil para continuar.");
      return;
    }

    setError(null);
    setStep(2);
  }

  function handleSubmit() {
    if (!persona) return;

    const payload: LeagueSelectionInput[] = Object.entries(selections)
      .filter(([, s]) => s.relationType)
      .map(([leagueId, s]) => ({
        leagueId,
        relationType: s.relationType!,
        teamName: s.teamName,
        season: s.season,
      }));

    if (payload.length === 0) {
      setError("Selecione ao menos uma competição ou liga.");
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        await completeOnboarding({
          personaType: persona,
          leagues: payload,
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível salvar. Tente novamente.",
        );
      }
    });
  }

  return (
    <div className="bg-base-200 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-4xl items-center justify-center">
        <div className="w-full">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mb-3 flex items-center justify-center gap-2">
              <Bot className="text-primary size-5" />
              <span className="text-primary text-xs font-bold tracking-[0.2em]">
                Carrgando...
              </span>
            </div>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2">
              <span
                className={`size-2.5 rounded-full transition-colors ${
                  step === 1
                    ? "bg-primary"
                    : "bg-success ring-success/20 ring-4"
                }`}
              />

              <span
                className={`h-px w-12 transition-colors ${
                  step === 2 ? "bg-primary" : "bg-base-300"
                }`}
              />

              <span
                className={`size-2.5 rounded-full transition-colors ${
                  step === 2 ? "bg-primary" : "bg-base-300"
                }`}
              />
            </div>
          </div>

          {/* Main card */}
          <div className="card border border-base-300 bg-base-100 shadow-xl">
            <div className="card-body p-5 sm:p-8">
              {step === 1 ? (
                <>
                  <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                      Como você participa da robótica?
                    </h1>

                    <p className="mt-2 text-sm leading-relaxed text-base-content/60 sm:text-base">
                      Isso ajusta o que aparece pra você primeiro. Dá pra mudar
                      depois nas configurações.
                    </p>
                  </div>

                  {/* Personas */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {PERSONAS.map((p) => {
                      const selected = persona === p.value;

                      return (
                        <button
                          key={p.value}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => {
                            setPersona(p.value);
                            setError(null);
                          }}
                          className={`card border text-left transition-all duration-200 ${
                            selected
                              ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                              : "border-base-300 bg-base-100 hover:border-primary/40 hover:bg-base-200/50"
                          }`}
                        >
                          <div className="card-body p-4 sm:p-5">
                            <div className="flex items-start justify-between gap-4">
                              <div
                                className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                                  selected
                                    ? "bg-primary text-primary-content"
                                    : "bg-base-200 text-base-content/60"
                                }`}
                              >
                                {p.icon}
                              </div>

                              <div
                                className={`flex size-6 items-center justify-center rounded-full border-2 transition-all ${
                                  selected
                                    ? "border-primary bg-primary text-primary-content"
                                    : "border-base-300"
                                }`}
                              >
                                {selected && <Check className="size-3.5" />}
                              </div>
                            </div>

                            <div className="mt-4">
                              <h2 className="font-bold">{p.name}</h2>

                              <p className="mt-1 text-sm leading-relaxed text-base-content/60">
                                {p.desc}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="mt-8 flex justify-end">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={goToStep2}
                    >
                      Continuar
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        Quais competições te interessam?
                      </h1>

                      {activeCount > 0 && (
                        <span className="badge badge-primary">
                          {activeCount}{" "}
                          {activeCount === 1
                            ? "selecionada"
                            : "selecionadas"}
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm leading-relaxed text-base-content/60 sm:text-base">
                      Marque as que você já participa ou só quer acompanhar.
                      Se participa, conte a equipe e a temporada.
                    </p>
                  </div>

                  {/* Leagues */}
                  <div className="space-y-3">
                    {leagues.map((league) => {
                      const s = selections[league.id];
                      const isActive = Boolean(s?.relationType);
                      const isParticipant =
                        s?.relationType === "participante";
                      const isInterested = s?.relationType === "interessado";

                      return (
                        <div
                          key={league.id}
                          className={`rounded-2xl border transition-all ${
                            isActive
                              ? "border-primary/40 bg-primary/5"
                              : "border-base-300 bg-base-100"
                          }`}
                        >
                          <div className="p-4 sm:p-5">
                            {/* League header */}
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  {isActive && (
                                    <span className="size-2 rounded-full bg-primary" />
                                  )}

                                  <h2 className="font-bold">
                                    {league.name}
                                  </h2>
                                </div>

                                <span className="mt-1 block text-xs font-medium uppercase tracking-wider text-base-content/50">
                                  {league.code}
                                </span>
                              </div>

                              {/* Relation selector */}
                              <div className="join w-full sm:w-auto gap-2">
                                <button
                                  type="button"
                                  className={`btn join-item flex-1 sm:flex-none ${
                                    isParticipant
                                      ? "btn-warning"
                                      : "btn-outline"
                                  }`}
                                  aria-pressed={isParticipant}
                                  onClick={() =>
                                    setRelation(
                                      league.id,
                                      "participante",
                                    )
                                  }
                                >
                                  <Trophy className="size-4" />
                                  Participo
                                </button>

                                <button
                                  type="button"
                                  className={`btn join-item flex-1 sm:flex-none ${
                                    isInterested
                                      ? "btn-info"
                                      : "btn-outline"
                                  }`}
                                  aria-pressed={isInterested}
                                  onClick={() =>
                                    setRelation(
                                      league.id,
                                      "interessado",
                                    )
                                  }
                                >
                                  Quero conhecer
                                </button>
                              </div>
                            </div>

                            {/* Participant fields */}
                            {isParticipant && (
                              <div className="mt-4 grid gap-3 border-t border-base-300 pt-4 sm:grid-cols-2">
                                <div className="form-control">
                                  <label
                                    className="label"
                                    htmlFor={`team-${league.id}`}
                                  >
                                    <span className="label-text font-medium">
                                      Equipe
                                    </span>
                                  </label>

                                  <input
                                    id={`team-${league.id}`}
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={s.teamName}
                                    onChange={(e) =>
                                      setField(
                                        league.id,
                                        "teamName",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Nome da equipe"
                                  />
                                </div>

                                <div className="form-control">
                                  <label
                                    className="label"
                                    htmlFor={`season-${league.id}`}
                                  >
                                    <span className="label-text font-medium">
                                      Temporada
                                    </span>
                                  </label>

                                  <input
                                    id={`season-${league.id}`}
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={s.season}
                                    onChange={(e) =>
                                      setField(
                                        league.id,
                                        "season",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="ex: 2024-SUBMERGED"
                                  />
                                </div>
                              </div>
                            )}

                            {/* Interested state */}
                            {isInterested && (
                              <div className="mt-4">
                                <div className="alert alert-info py-3">
                                  <Heart className="size-4" />
                                  <span className="text-sm">
                                    Você receberá informações terá acesso a recursos
                                    relacionados a esta competição.
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => {
                        setError(null);
                        setStep(1);
                      }}
                      disabled={isPending}
                    >
                      <ChevronLeft className="size-4" />
                      Voltar
                    </button>

                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSubmit}
                      disabled={isPending || activeCount === 0}
                    >
                      {isPending ? (
                        <>
                          <span className="loading loading-spinner loading-sm" />
                          Salvando…
                        </>
                      ) : (
                        <>
                          Concluir
                          <Check className="size-4" />
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}

              {/* Error */}
              {error && (
                <div className="alert alert-error mt-6">
                  <AlertCircle className="size-5" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer hint */}
          <p className="mt-4 text-center text-xs text-base-content/40">
            Você poderá alterar suas preferências posteriormente nas
            configurações.
          </p>
        </div>
      </div>
    </div>
  );
}