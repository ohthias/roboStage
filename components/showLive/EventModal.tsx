"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { BaseModal } from "../Dashboard/UI/BaseModal";

interface EventModalProps {
  open: boolean;
  session: any;
  onClose: () => void;
}

export function EventModal({ open, session, onClose }: EventModalProps) {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [nameEvent, setNameEvent] = useState("");
  const [competitionType, setCompetitionType] = useState("");
  const [season, setSeason] = useState("");

  const [rounds, setRounds] = useState<string[]>([]);
  const [roundInput, setRoundInput] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const nextStep = () => {
    if (step === 1 && !nameEvent.trim()) return;
    if (step === 2 && (!competitionType || !season)) return;
    setStep((s) => (s + 1) as 1 | 2 | 3);
  };

  const prevStep = () => {
    setStep((s) => (s - 1) as 1 | 2 | 3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rounds.length === 0) {
      setError("Adicione pelo menos uma rodada.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .insert({
          id_responsavel: session.user.id,
          name_event: nameEvent,
          code_event: crypto.randomUUID().slice(0, 6).toUpperCase(),
          code_visit: crypto.randomUUID().slice(0, 6).toUpperCase(),
          code_volunteer: crypto.randomUUID().slice(0, 6).toUpperCase(),
        })
        .select("id_evento, code_event")
        .single();

      if (eventError) throw eventError;

      const config = {
        base: competitionType,
        rodadas: rounds,
        temporada: season,
      };

      const { error: typeError } = await supabase
        .from("typeEvent")
        .insert({ id_event: eventData.id_evento, config });

      if (typeError) throw typeError;

      router.push(`/showlive/${eventData.code_event}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao criar evento");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="Criar Evento"
      description="Configure sua competição em poucos passos"
      size="xl"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          {error && (
            <span className="text-error text-sm font-medium mr-auto">
              {error}
            </span>
          )}

          <button
            type="button"
            onClick={step === 1 ? onClose : prevStep}
            className="btn btn-ghost"
          >
            {step === 1 ? "Cancelar" : "Voltar"}
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="btn btn-primary"
            >
              Próximo
            </button>
          ) : (
            <button
              type="submit"
              form="event-form"
              disabled={submitting || rounds.length === 0}
              className="btn btn-primary"
            >
              {submitting ? (
                <>
                  <span className="loading loading-spinner" />
                  Criando...
                </>
              ) : (
                "Criar Evento"
              )}
            </button>
          )}
        </div>
      }
    >
      {/* Stepper */}
      <div className="mb-8">
        <ul className="steps w-full">
          <li className={`step ${step >= 1 ? "step-primary" : ""}`}>Evento</li>
          <li className={`step ${step >= 2 ? "step-primary" : ""}`}>
            Competição
          </li>
          <li className={`step ${step >= 3 ? "step-primary" : ""}`}>Rodadas</li>
        </ul>
      </div>

      <form id="event-form" onSubmit={handleSubmit} className="space-y-6">
        {/* STEP 1 */}
        {step === 1 && (
          <div className="border border-base-300 rounded-2xl p-6 space-y-4">
            <h4 className="text-lg font-semibold">Informações do Evento</h4>

            <input
              type="text"
              required
              value={nameEvent}
              onChange={(e) => setNameEvent(e.target.value)}
              className="input input-bordered w-full"
              placeholder="Ex: Etapa Regional RoboStage"
            />
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="border border-base-300 rounded-2xl p-6 space-y-4">
            <h4 className="text-lg font-semibold">
              Configuração da Competição
            </h4>

            <select
              required
              value={competitionType}
              onChange={(e) => setCompetitionType(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="">Tipo de competição</option>
              <option value="FLL">FIRST LEGO League</option>
            </select>

            {competitionType === "FLL" && (
              <select
                required
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="select select-bordered w-full"
              >
                <option value="" disabled>
                  Temporada
                </option>
                <option value="UNEARTHED">UNEARTHED</option>
                <option value="SUBMERGED">SUBMERGED</option>
                <option value="MASTERPIECE">MASTERPIECE</option>
              </select>
            )}
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="border border-base-300 rounded-2xl p-6 space-y-4">
            <h4 className="text-lg font-semibold">Rodadas</h4>

            <div className="flex gap-2">
              <input
                type="text"
                value={roundInput}
                onChange={(e) => setRoundInput(e.target.value)}
                className="input input-bordered flex-1"
                placeholder="Ex: Classificatória 1"
              />
              <button
                type="button"
                className="btn btn-outline btn-primary"
                onClick={() => {
                  if (roundInput.trim()) {
                    setRounds([...rounds, roundInput.trim()]);
                    setRoundInput("");
                  }
                }}
              >
                Adicionar
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {rounds.map((r, i) => (
                <div
                  key={i}
                  className="badge badge-lg gap-2 px-4 py-3 bg-primary/10 text-primary border border-primary/20"
                >
                  {r}
                  <button
                    type="button"
                    className="font-bold hover:text-error"
                    onClick={() =>
                      setRounds(rounds.filter((_, idx) => idx !== i))
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {rounds.length === 0 && (
              <p className="text-sm text-warning">
                Adicione pelo menos uma rodada para continuar.
              </p>
            )}
          </div>
        )}
      </form>
    </BaseModal>
  );
}