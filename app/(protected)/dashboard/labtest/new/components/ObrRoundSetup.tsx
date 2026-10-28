"use client";

import { useState } from "react";
import Link from "next/link";
import { Flag, Map as MapIcon, RefreshCw } from "lucide-react";

import ArenaMap from "@/components/labtest/obr/ArenaMap";
import { sampleProject, sanitizeProject } from "@/utils/quickbrick/ArenaBuilder/project";
import type { Project } from "@/utils/quickbrick/ArenaBuilder/types";
import { FieldLabel, Note, Segmented } from "./FormBits";

/** Mesma chave usada pelo Criador de Arenas para salvar o projeto no navegador. */
const ARENA_STORAGE_KEY = "obr-arena-builder:v1";

type Source = "none" | "builder" | "sample";

function readBuilderArena(): Project | null {
  try {
    const raw = localStorage.getItem(ARENA_STORAGE_KEY);
    return raw ? sanitizeProject(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

/** Configuração da rodada da OBR: explica o modo e liga (ou não) uma arena. */
export function ObrRoundSetup({
  arena,
  setArena,
}: {
  arena: Project | null;
  setArena: (arena: Project | null) => void;
}) {
  const [source, setSource] = useState<Source>(arena ? "builder" : "none");
  const [missing, setMissing] = useState(false);

  const choose = (next: Source) => {
    setSource(next);
    setMissing(false);
    if (next === "none") return setArena(null);
    if (next === "sample") return setArena(sampleProject());
    const fromBuilder = readBuilderArena();
    setMissing(!fromBuilder);
    setArena(fromBuilder);
  };

  return (
    <div className="flex flex-col gap-5 rounded-tl-2xl rounded-br-2xl border border-primary/25 bg-primary/5 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <Flag className="mt-0.5 size-5 shrink-0 text-primary" />
        <div className="text-sm">
          <p className="font-semibold">OBR Resgate · rodada de resgate</p>
          <p className="mt-1 text-base-content/65">
            Cada execução é uma rodada com o cronômetro do Pontuador (2 min de
            calibração e 5 min de round). Você registra perigos com tentativas,
            checkpoints, falhas e a sala de resgate. A pontuação é a mesma do
            Pontuador, e o LabTest compara as rodadas.
          </p>
        </div>
      </div>

      <div>
        <FieldLabel>Arena para marcar as falhas</FieldLabel>
        <Segmented
          label="Arena"
          value={source}
          options={[
            { value: "none", label: "Sem arena" },
            { value: "builder", label: "Do Criador de Arenas" },
            { value: "sample", label: "Arena de exemplo" },
          ]}
          onChange={choose}
        />
        <p className="mt-2 text-xs text-base-content/55">
          Com uma arena, cada falha é marcada no ladrilho em que aconteceu e a
          página do teste mostra um mapa de calor dos trechos críticos. Sem
          arena, a falha é ligada ao checkpoint.
        </p>
      </div>

      {source === "builder" && missing && (
        <Note tone="warning">
          Nenhuma arena encontrada neste navegador. Monte a arena no{" "}
          <Link href="/obr/quickbrick/criador-de-arenas" target="_blank" className="link link-primary">
            Criador de Arenas
          </Link>{" "}
          e volte para importar.
        </Note>
      )}

      {arena && (
        <div className="rounded-tl-xl rounded-br-xl border border-base-300 bg-base-100 p-3">
          <div className="mb-2 flex items-center gap-2 text-sm">
            <MapIcon className="size-4 text-base-content/50" />
            <span className="min-w-0 flex-1 truncate font-medium">{arena.name}</span>
            <span className="font-mono text-xs text-base-content/45">nível {arena.level}</span>
            {source === "builder" && (
              <button
                type="button"
                onClick={() => choose("builder")}
                className="btn btn-ghost btn-xs gap-1"
                title="Copiar de novo a arena do Criador"
              >
                <RefreshCw className="size-3.5" />
                Atualizar
              </button>
            )}
          </div>
          <ArenaMap arena={arena} className="max-h-72" label={`Arena ${arena.name}`} />
          <p className="mt-2 text-xs text-base-content/50">
            O teste guarda uma cópia: mudanças futuras no Criador não alteram
            as rodadas já registradas.
          </p>
        </div>
      )}
    </div>
  );
}
