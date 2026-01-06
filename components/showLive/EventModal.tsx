"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/utils/supabase/client";

interface EventModalProps {
  session: any;
  onClose: () => void;
}

export function EventModal({ session, onClose }: EventModalProps) {
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

      router.push(`/dashboard/showlive/${eventData.code_event}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao criar evento");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal modal-open backdrop-blur-md">
      <div className="modal-box w-full max-w-5xl p-0 overflow-hidden shadow-xl">
        {/* Header */}
        <div className="px-8 py-6 bg-primary/10 border-b border-base-300">
          <h3 className="text-2xl font-bold text-primary">Criar Evento</h3>
          <p className="text-sm text-base-content/70">
            Configure sua competição em poucos passos
          </p>
        </div>

        {/* Stepper */}
        <div className="px-8 py-4 border-b border-base-300 bg-base-100">
          <ul className="steps w-full">
            <li className={`step ${step >= 1 ? "step-primary" : ""}`}>
              Evento
            </li>
            <li className={`step ${step >= 2 ? "step-primary" : ""}`}>
              Competição
            </li>
            <li className={`step ${step >= 3 ? "step-primary" : ""}`}>
              Rodadas
            </li>
          </ul>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-8 max-h-[70vh] overflow-y-auto"
        >
          {/* STEP 1 */}
          {step === 1 && (
            <div className="bg-base-100 border border-base-300 rounded-2xl p-6 space-y-4">
              <h4 className="text-lg font-semibold">Informações do Evento</h4>

              <input
                type="text"
                required
                value={nameEvent}
                onChange={(e) => setNameEvent(e.target.value)}
                className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ex: Etapa Regional RoboStage"
              />
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="bg-base-100 border border-base-300 rounded-2xl p-6 space-y-4">
              <h4 className="text-lg font-semibold">
                Configuração da Competição
              </h4>

              <select
                required
                value={competitionType}
                onChange={(e) => setCompetitionType(e.target.value)}
                className="select select-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary rounded-lg px-3"
              >
                <option value="">Tipo de competição</option>
                <option value="FLL">FIRST LEGO League</option>
              </select>

              {competitionType === "FLL" && (
                <select
                  required
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  className="select select-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary rounded-lg px-3"
                >
                  <option value="" disabled>Temporada</option>
                  <option value="UNEARTHED">UNEARTHED</option>
                  <option value="SUBMERGED">SUBMERGED</option>
                  <option value="MASTERPIECE">MASTERPIECE</option>
                </select>
              )}
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="bg-base-100 border border-base-300 rounded-2xl p-6 space-y-4">
              <h4 className="text-lg font-semibold">Rodadas</h4>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={roundInput}
                  onChange={(e) => setRoundInput(e.target.value)}
                  className="input input-bordered flex-1 focus:outline-none focus:ring-2 focus:ring-primary"
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

              {/* Chips */}
              <div className="flex flex-wrap gap-2">
                {rounds.map((r, i) => (
                  <div
                    key={i}
                    className="badge badge-lg gap-2 px-4 py-3 bg-primary/10 text-primary border border-primary/20"
                  >
                    {r}
                    <button
                      type="button"
                      className="font-bold hover:text-error transition"
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

          {/* Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-base-300">
            {error && (
              <span className="text-error text-sm font-medium">{error}</span>
            )}

            <div className="flex gap-3 ml-auto">
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
                  disabled={submitting || rounds.length === 0}
                  className="btn btn-primary"
                >
                  {submitting ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      Criando...
                    </>
                  ) : (
                    "Criar Evento"
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
