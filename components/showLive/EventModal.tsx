"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BaseModal } from "../Dashboard/UI/BaseModal";
import { useAuth } from "@/hooks/useAuth";
import { eventService } from "@/server/services/event.service";

interface EventModalProps {
  open: boolean;
  onClose: () => void;
}

export function EventModal({ open, onClose }: EventModalProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [nameEvent, setNameEvent] = useState("");
  const [competitionType, setCompetitionType] = useState("");
  const [season, setSeason] = useState("");
  const [rounds, setRounds] = useState<string[]>([]);
  const [roundInput, setRoundInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const resetModal = () => {
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

  const handleAddRound = () => {
    const value = roundInput.trim();
    if (!value) return;
    if (rounds.includes(value)) return;
    setRounds((prev) => [...prev, value]);
    setRoundInput("");
  };

  const handleRemoveRound = (index: number) => {
    setRounds((prev) => prev.filter((_, i) => i !== index));
  };

  const addTemplateRounds = () => {
    setRounds(["Round Teste", "Rodada 1", "Rodada 2", "Rodada 3"]);
  };

  const isValid =
    nameEvent.trim() && competitionType && season && rounds.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      setError("Usuário não autenticado.");
      return;
    }

    if (!isValid) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      handleClose();

      const event = await eventService.createEvent({
        userId: user.id,
        name: nameEvent,
        competitionType,
        season,
        rounds,
      });
      router.push(`/showlive/${event.code_event}`);
    } catch (err: any) {
      setError(err.message || "Erro ao criar evento");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BaseModal
      open={open}
      onClose={handleClose}
      title="Criar Evento"
      description="Configure sua competição rapidamente."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* INFORMAÇÕES */}
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body">
            <h3 className="card-title">Informações Básicas</h3>

            <p className="text-sm text-base-content/60">
              Defina um nome para seu evento.
            </p>

            <fieldset className="space-y-2">
              <label className="font-medium">Nome do Evento *</label>

              <input
                type="text"
                value={nameEvent}
                onChange={(e) => setNameEvent(e.target.value)}
                className={`input input-bordered w-full ${
                  !nameEvent ? "input-error" : ""
                }`}
                placeholder="Ex: Regional RoboStage São Paulo"
              />

              {!nameEvent && (
                <span className="text-error text-sm">Campo obrigatório.</span>
              )}
            </fieldset>
          </div>
        </div>

        {/* COMPETIÇÃO */}
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body">
            <h3 className="card-title">Competição</h3>

            <p className="text-sm text-base-content/60">
              Escolha a modalidade do evento.
            </p>

            <div className="grid gap-3">
              <button
                type="button"
                onClick={() => setCompetitionType("FLL")}
                className={`card border transition-all cursor-pointer ${
                  competitionType === "FLL"
                    ? "border-primary bg-primary/5"
                    : "border-base-300"
                }`}
              >
                <div className="card-body py-4">
                  <h4 className="font-bold">FIRST LEGO League Challenge</h4>

                  <p className="text-sm opacity-70">
                    Torneios e festivais FLL.
                  </p>
                </div>
              </button>
            </div>

            {!competitionType && (
              <span className="text-error text-sm">
                Selecione uma competição.
              </span>
            )}

            {competitionType === "FLL" && (
              <>
                <div className="divider">Temporada</div>

                <div className="grid md:grid-cols-3 gap-3">
                  {["UNEARTHED", "SUBMERGED", "MASTERPIECE"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setSeason(item)}
                      className={`card border cursor-pointer transition-all ${
                        season === item
                          ? "border-primary bg-primary/5"
                          : "border-base-300"
                      }`}
                    >
                      <div className="card-body items-center py-6">
                        <span className="font-semibold">{item}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {!season && (
                  <span className="text-error text-sm">
                    Selecione uma temporada.
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* RODADAS */}
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h3 className="card-title">Rodadas *</h3>

              <button
                type="button"
                onClick={addTemplateRounds}
                className="btn btn-xs btn-outline"
              >
                Usar modelo FLL
              </button>
            </div>

            <p className="text-sm text-base-content/60">
              Adicione pelo menos uma rodada.
            </p>

            <div className="w-full flex gap-2">
              <input
                value={roundInput}
                onChange={(e) => setRoundInput(e.target.value)}
                className="input input-bordered flex-1 w-full"
                placeholder="Ex: Rodada 1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddRound();
                  }
                }}
              />

              <button
                type="button"
                onClick={handleAddRound}
                className="btn btn-primary"
                disabled={!roundInput.trim()}
              >
                Adicionar
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {rounds.map((round, index) => (
                <div
                  key={index}
                  className="badge badge-primary badge-lg gap-2 p-4 cursor-default"
                >
                  {round}

                  <button
                    type="button"
                    className="cursor-pointer"
                    onClick={() => handleRemoveRound(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {rounds.length === 0 && (
              <div className="alert alert-soft alert-error">
                <span>Pelo menos uma rodada é obrigatória.</span>
              </div>
            )}
          </div>
        </div>

        {/* RESUMO */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-lg font-semibold text-base-content">
                Resumo do Evento
              </h4>
              <p className="text-sm text-base-content/60">
                Confira os detalhes antes de criar.
              </p>
            </div>

            <div className="badge badge-primary badge-outline px-3 py-2 text-xs font-medium">
              {rounds.length} rodada{rounds.length === 1 ? "" : "s"}
            </div>
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-xl bg-base-200/60 p-3">
              <span className="text-xs uppercase tracking-wide text-base-content/50">
                Evento
              </span>
              <p className="mt-1 font-medium text-base-content">
                {nameEvent || "Não definido"}
              </p>
            </div>

            <div className="rounded-xl bg-base-200/60 p-3">
              <span className="text-xs uppercase tracking-wide text-base-content/50">
                Competição
              </span>
              <p className="mt-1 font-medium text-base-content">
                {competitionType || "Não definida"}
              </p>
            </div>

            <div className="rounded-xl bg-base-200/60 p-3 sm:col-span-2">
              <span className="text-xs uppercase tracking-wide text-base-content/50">
                Temporada
              </span>
              <p className="mt-1 font-medium text-base-content">
                {season || "Não definida"}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-soft alert-error">
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button type="button" className="btn btn-ghost" onClick={handleClose}>
            Cancelar
          </button>

          <button
            type="submit"
            disabled={!isValid || submitting}
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
        </div>
      </form>
    </BaseModal>
  );
}