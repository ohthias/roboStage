"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { BaseModal } from "../Dashboard/UI/BaseModal";

import { useAuth } from "@/hooks/useAuth";
import { eventService } from "@/services/event.service";

interface EventModalProps {
  open: boolean;
  onClose: () => void;
}

export function EventModal({
  open,
  onClose,
}: EventModalProps) {
  const router = useRouter();

  const { user } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [nameEvent, setNameEvent] = useState("");
  const [competitionType, setCompetitionType] =
    useState("");

  const [season, setSeason] = useState("");

  const [rounds, setRounds] = useState<string[]>(
    []
  );

  const [roundInput, setRoundInput] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  const resetModal = () => {
    setStep(1);
    setNameEvent("");
    setCompetitionType("");
    setSeason("");
    setRounds([]);
    setRoundInput("");
    setError("");
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const nextStep = () => {
    if (step === 1 && !nameEvent.trim()) {
      setError("Digite um nome para o evento");
      return;
    }

    if (
      step === 2 &&
      (!competitionType || !season)
    ) {
      setError(
        "Selecione o tipo e a temporada"
      );

      return;
    }

    setError("");

    setStep((s) => (s + 1) as 1 | 2 | 3);
  };

  const prevStep = () => {
    setError("");

    setStep((s) => (s - 1) as 1 | 2 | 3);
  };

  const handleAddRound = () => {
    if (!roundInput.trim()) return;

    setRounds((prev) => [
      ...prev,
      roundInput.trim(),
    ]);

    setRoundInput("");
  };

  const handleRemoveRound = (
    index: number
  ) => {
    setRounds((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!user?.id) {
      setError("Usuário não autenticado");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const event =
        await eventService.createEvent({
          userId: user.id,
          name: nameEvent,
          competitionType,
          season,
          rounds,
        });

      handleClose();

      router.push(
        `/showlive/${event.code_event}`
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err.message ||
          "Erro ao criar evento"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BaseModal
      open={open}
      onClose={handleClose}
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
            onClick={
              step === 1
                ? handleClose
                : prevStep
            }
            className="btn btn-ghost"
          >
            {step === 1
              ? "Cancelar"
              : "Voltar"}
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
              disabled={
                submitting ||
                rounds.length === 0
              }
              className="btn btn-primary"
            >
              {submitting ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
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
      {/* STEPPER */}
      <div className="mb-8">
        <ul className="steps w-full">
          <li
            className={`step ${
              step >= 1
                ? "step-primary"
                : ""
            }`}
          >
            Evento
          </li>

          <li
            className={`step ${
              step >= 2
                ? "step-primary"
                : ""
            }`}
          >
            Competição
          </li>

          <li
            className={`step ${
              step >= 3
                ? "step-primary"
                : ""
            }`}
          >
            Rodadas
          </li>
        </ul>
      </div>

      <form
        id="event-form"
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* STEP 1 */}
        {step === 1 && (
          <div className="border border-base-300 rounded-3xl p-6 space-y-5 bg-base-100">
            <div>
              <h4 className="text-lg font-bold">
                Informações do Evento
              </h4>

              <p className="text-sm text-base-content/50 mt-1">
                Defina o nome principal da
                competição.
              </p>
            </div>

            <fieldset className="space-y-2">
              <label className="text-sm font-medium">
                Nome do evento
              </label>

              <input
                type="text"
                required
                value={nameEvent}
                onChange={(e) =>
                  setNameEvent(
                    e.target.value
                  )
                }
                className="input input-bordered w-full"
                placeholder="Ex: Etapa Regional RoboStage"
              />
            </fieldset>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="border border-base-300 rounded-3xl p-6 space-y-5 bg-base-100">
            <div>
              <h4 className="text-lg font-bold">
                Configuração da
                Competição
              </h4>

              <p className="text-sm text-base-content/50 mt-1">
                Escolha a modalidade e
                temporada.
              </p>
            </div>

            <fieldset className="space-y-2">
              <label className="text-sm font-medium">
                Tipo de competição
              </label>

              <select
                required
                value={competitionType}
                onChange={(e) =>
                  setCompetitionType(
                    e.target.value
                  )
                }
                className="select select-bordered w-full"
              >
                <option value="">
                  Selecione
                </option>

                <option value="FLL">
                  FIRST LEGO League
                </option>
              </select>
            </fieldset>

            {competitionType ===
              "FLL" && (
              <fieldset className="space-y-2">
                <label className="text-sm font-medium">
                  Temporada
                </label>

                <select
                  required
                  value={season}
                  onChange={(e) =>
                    setSeason(
                      e.target.value
                    )
                  }
                  className="select select-bordered w-full"
                >
                  <option
                    value=""
                    disabled
                  >
                    Selecione
                  </option>

                  <option value="UNEARTHED">
                    UNEARTHED
                  </option>

                  <option value="SUBMERGED">
                    SUBMERGED
                  </option>

                  <option value="MASTERPIECE">
                    MASTERPIECE
                  </option>
                </select>
              </fieldset>
            )}
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="border border-base-300 rounded-3xl p-6 space-y-5 bg-base-100">
            <div>
              <h4 className="text-lg font-bold">
                Rodadas
              </h4>

              <p className="text-sm text-base-content/50 mt-1">
                Adicione as rodadas da
                competição.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={roundInput}
                onChange={(e) =>
                  setRoundInput(
                    e.target.value
                  )
                }
                className="input input-bordered flex-1"
                placeholder="Ex: Classificatória 1"
              />

              <button
                type="button"
                className="btn btn-outline btn-primary"
                onClick={handleAddRound}
              >
                Adicionar
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {rounds.map((round, i) => (
                <div
                  key={i}
                  className="
                    badge badge-lg gap-2
                    px-4 py-4
                    bg-primary/10
                    text-primary
                    border border-primary/20
                  "
                >
                  {round}

                  <button
                    type="button"
                    className="font-bold hover:text-error transition-colors"
                    onClick={() =>
                      handleRemoveRound(
                        i
                      )
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {rounds.length === 0 && (
              <div className="alert alert-warning">
                <span className="text-sm">
                  Adicione pelo menos uma
                  rodada.
                </span>
              </div>
            )}
          </div>
        )}
      </form>
    </BaseModal>
  );
}