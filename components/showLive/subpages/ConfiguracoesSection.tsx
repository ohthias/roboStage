"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Settings2,
  Trophy,
  Layers3,
  Plus,
  GripVertical,
  Trash2,
  Save,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/app/context/ToastContext";
import Loader from "@/components/Loader";
import DangerZone from "../configs/DangerZone";
import EventSettings from "../configs/EventSettings";
import { useEvent } from "@/hooks/useEvent";

const supabase = createClient();

interface Props {
  codeEvent: string;
}

export default function ConfiguracoesSection({ codeEvent }: Props) {
  const { addToast } = useToast();
  const {
    loading: eventLoading,
    eventData,
    eventConfig,
  } = useEvent(codeEvent);
  const [saving, setSaving] = useState(false);
  const [eventName, setEventName] = useState("");
  const [season, setSeason] = useState("");
  const [rounds, setRounds] = useState<string[]>([]);
  const [roundInput, setRoundInput] = useState("");
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!eventData || !eventConfig) return;
    setEventName(eventData.name_event);
    setSeason(eventConfig.config?.temporada || "");
    setRounds(eventConfig.config?.rodadas || []);
  }, [eventData, eventConfig]);

  const totalRounds = useMemo(() => rounds.length, [rounds]);

  const handleAddRound = () => {
    if (!roundInput.trim()) return;
    setRounds((prev) => [...prev, roundInput.trim()]);
    setRoundInput("");
  };

  const handleSave = async () => {
    if (!eventData) return;

    try {
      setSaving(true);
      await supabase
        .from("events")
        .update({
          name_event: eventName,
        })
        .eq("id_evento", eventData.id_evento);

      await supabase
        .from("typeEvent")
        .update({
          config: {
            ...eventConfig?.config,
            base: "FLL",
            temporada: season,
            rodadas: rounds,
          },
        })
        .eq("id_event", eventData.id_evento);

      const { data: teams } = await supabase
        .from("team")
        .select("id_team, points")
        .eq("id_event", eventData.id_evento);

      for (const team of teams || []) {
        const current = team.points || {};
        const merged = {
          ...current,
        };

        rounds.forEach((round) => {
          if (!(round in merged)) {
            merged[round] = -1;
          }
        });

        await supabase
          .from("team")
          .update({
            points: merged,
          })
          .eq("id_team", team.id_team);
      }

      addToast("Configurações salvas.", "success");
    } catch (err) {
      console.error(err);
      addToast("Erro ao salvar configurações.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggingIndex(index);
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    index: number,
  ) => {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === index) return;
    const updated = [...rounds];
    const [moved] = updated.splice(draggingIndex, 1);
    updated.splice(index, 0, moved);
    setRounds(updated);
    setDraggingIndex(index);
  };

  if (eventLoading || !eventData) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <section className="space-y-8 px-4 md:px-8 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Settings2 size={22} className="text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold">Configurações</h1>
          </div>

          <p className="text-sm text-base-content/60 mt-1">
            Gerencie as informações e regras do evento.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary btn-sm"
        >
          <Save size={16} />
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>

      {/* Informações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-primary" />
            <h2 className="font-semibold">Evento</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-base-content/60">
                Nome do evento
              </label>

              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="input input-bordered w-full mt-1"
              />
            </div>

            <div>
              <label className="text-sm text-base-content/60">Temporada</label>

              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="select rounded-lg w-full mt-1 px-3 py-2"
              >
                <option disabled>Selecione</option>
                <option value="UNEARTHED">UNEARTHED</option>
                <option value="SUBMERGED">SUBMERGED</option>
                <option value="MASTERPIECE">MASTERPIECE</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resumo */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Layers3 size={18} className="text-primary" />
            <h2 className="font-semibold">Resumo</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-base-200 p-4">
              <p className="text-sm text-base-content/60">Rodadas</p>

              <h3 className="text-2xl font-bold mt-1">{totalRounds}</h3>
            </div>

            <div className="rounded-xl bg-base-200 p-4">
              <p className="text-sm text-base-content/60">Base</p>

              <h3 className="text-2xl font-bold mt-1">FLL</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Rodadas */}
      <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
        <div className="flex items-center gap-2 mb-5">
          <Layers3 size={18} className="text-primary" />
          <h2 className="font-semibold">Rodadas</h2>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={roundInput}
            onChange={(e) => setRoundInput(e.target.value)}
            placeholder="Nova rodada"
            className="input input-bordered flex-1"
          />

          <button onClick={handleAddRound} className="btn btn-outline">
            <Plus size={16} />
            Adicionar
          </button>
        </div>

        <div className="mt-5 space-y-2">
          {rounds.map((round, index) => (
            <div
              key={`${round}-${index}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              className="flex items-center justify-between rounded-xl border border-base-300 px-4 py-3 bg-base-100"
            >
              <div className="flex items-center gap-3">
                <GripVertical size={16} className="text-base-content/40" />
                <span className="font-medium">{round}</span>
              </div>

              <button
                onClick={() => setRounds(rounds.filter((_, i) => i !== index))}
                className="btn btn-ghost btn-sm text-error"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Configurações extras */}
      <EventSettings eventId={eventData.id_evento} />

      {/* Danger zone */}
      <DangerZone eventId={String(eventData.id_evento)} />
    </section>
  );
}
