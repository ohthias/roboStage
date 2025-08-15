import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/utils/supabase/client";

interface EventModalProps {
  session: any;
}

export function EventModal({session} : EventModalProps) {
  const [showModal, setShowModal] = useState(true); // Começa aberto
  const [nameEvent, setNameEvent] = useState("");
  const [competitionType, setCompetitionType] = useState("");
  const [rounds, setRounds] = useState<string[]>([]);
  const [roundInput, setRoundInput] = useState("");
  const [season, setSeason] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
  if (rounds.length === 0) {
    setError("Adicione ao menos uma rodada.");
    setSubmitting(false);
    return;
  }

  if (!nameEvent || !competitionType) {
    setError("Preencha todos os campos obrigatórios.");
    setSubmitting(false);
    return;
  }

  if (competitionType === "FLL" && !season) {
    setError("Selecione a temporada para FLL.");
    setSubmitting(false);
    return;
  }
  e.preventDefault();

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

    const { error: typeError } = await supabase.from("typeEvent").insert({
    id_event: eventData.id_evento,
    config: config,
    });

    if (typeError) throw typeError;

    router.push(`/dashboard/showlive/${eventData.code_event}`);
  } catch (err: any) {
    console.error(err);
    setError(err.message || "Erro ao criar evento");
  } finally {
    setSubmitting(false);
  }
  };

  if (!showModal) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-full max-w-4xl p-0 overflow-hidden">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center border-b border-base-300 p-4">
          <h3 className="text-lg font-semibold text-info">Criar Evento</h3>
          <button
            onClick={() => setShowModal(false)}
            className="btn btn-sm btn-ghost"
          >
            ✕
          </button>
        </div>

        {/* Formulário */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 p-4 max-h-[70vh] overflow-y-auto"
        >
          <div className="flex flex-col md:flex-row gap-6">
            {/* Coluna esquerda */}
            <div className="flex-1 space-y-4">
              <div>
                <label className="label">
                  <span className="label-text font-semibold">
                    Nome do Evento
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={nameEvent}
                  onChange={(e) => setNameEvent(e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Digite o nome do evento"
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">
                    Tipo de competição
                  </span>
                </label>
                <select
                  required
                  value={competitionType}
                  onChange={(e) => setCompetitionType(e.target.value)}
                  className="select select-bordered w-full"
                >
                  <option value="">Selecione o tipo de competição</option>
                  <option value="FLL">FIRST LEGO League</option>
                </select>
              </div>

              {competitionType === "FLL" && (
                <div>
                  <label className="label">
                    <span className="label-text font-semibold">Temporada</span>
                  </label>
                  <select
                    required
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="select select-bordered w-full"
                  >
                    <option value="">Selecione a temporada</option>
                    <option value="UNEARTHED">UNEARTHED</option>
                    <option value="SUBMERGED">SUBMERGED</option>
                  </select>
                </div>
              )}
            </div>

            {/* Coluna direita */}
            <div className="flex-1 space-y-2">
              <label className="label">
                <span className="label-text font-semibold">Rodadas</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={roundInput}
                  onChange={(e) => setRoundInput(e.target.value)}
                  placeholder="Digite o nome da rodada"
                  className="input input-bordered flex-1"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (roundInput.trim() !== "") {
                      setRounds([...rounds, roundInput.trim()]);
                      setRoundInput("");
                    }
                  }}
                  className="btn btn-outline btn-info"
                >
                  Adicionar
                </button>
              </div>

              {rounds.length > 0 && (
                <ul className="space-y-1 max-h-40 overflow-y-auto">
                  {rounds.map((r, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between bg-base-200 p-2 rounded"
                    >
                      <span>{r}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setRounds(rounds.filter((_, index) => index !== i))
                        }
                        className="btn btn-xs btn-error"
                      >
                        Remover
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Rodapé */}
          <div className="flex justify-end gap-4 border-t border-base-300 pt-4">
            {error && <div className="text-error text-sm mr-auto">{error}</div>}
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn"
            >
              Fechar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-info"
            >
              {submitting ? (
                <>
                  <span className="loading loading-spinner"></span> Criando...
                </>
              ) : (
                "Criar Evento"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
