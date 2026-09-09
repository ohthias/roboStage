"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { MissionGuideMission, MissionGuideRequirement } from "@/utils/competitions/fll/mission-guide/types";
import { formatMissionType, formatPoints, getPointsDistribution } from "@/utils/competitions/fll/mission-guide/utils";

interface MissionModalProps {
  mission: MissionGuideMission | null;
  onClose: () => void;
}

function formatRequirement(req: MissionGuideRequirement): string {
  const parts: string[] = [];
  if (req.whenSelf) parts.push(`Quando selecionado "${req.whenSelf}"`);
  if (req.missionRef) parts.push(`requer ${req.missionRef}`);
  if (req.value !== null && req.value !== undefined) {
    parts.push(`= ${JSON.stringify(req.value)}`);
  }
  return parts.length > 0 ? parts.join(" ") : "Condição adicional aplicável.";
}

export function MissionModal({ mission, onClose }: MissionModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (mission) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [mission]);

  // Bound via addEventListener (rather than React's onClose/onCancel JSX
  // props) so this compiles regardless of the project's @types/react
  // version — native <dialog> "close" fires on ESC, backdrop-form submit,
  // and .close(), covering every way the modal can be dismissed.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  const distribution = mission ? getPointsDistribution(mission.points) : null;
  const typeLabel = mission ? formatMissionType(mission.type) : null;

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      aria-label={mission ? `Detalhes da missão ${mission.id} — ${mission.name}` : "Detalhes da missão"}
    >
      {mission && (
        <div className="modal-box max-w-3xl p-0 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-base-300 px-5 py-4">
            <h2 className="text-lg font-bold">
              {mission.id} — {mission.name}
            </h2>
            <form method="dialog">
              <button
                type="submit"
                className="btn btn-sm btn-circle btn-ghost"
                aria-label="Fechar detalhes da missão"
              >
                ✕
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 gap-6 p-5 md:grid-cols-2">
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-base-200">
              {mission.image ? (
                <Image
                  src={mission.image}
                  alt={mission.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-5xl font-bold text-base-content/20">
                  {mission.id}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-5">
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
                  Objetivo
                </h3>
                <p className="mt-1 text-sm">{mission.description}</p>
                {mission.objective && (
                  <p className="mt-1 text-sm text-base-content/70">{mission.objective}</p>
                )}
              </section>

              {mission.mechanism && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
                    Mecanismo
                  </h3>
                  <p className="mt-1 text-sm">{mission.mechanism}</p>
                </section>
              )}

              {mission.strategy && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
                    Estratégia
                  </h3>
                  <p className="mt-1 text-sm">{mission.strategy}</p>
                </section>
              )}

              {mission.tips.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
                    Dicas
                  </h3>
                  <ul className="mt-1 list-inside list-disc text-sm">
                    {mission.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </section>
              )}

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
                  Pontuação
                </h3>
                <p className="mt-1 text-sm font-semibold">{formatPoints(mission.points)}</p>
                {distribution && (
                  <ul className="mt-1 space-y-0.5 text-sm text-base-content/70">
                    {distribution.map((row) => (
                      <li key={row.step}>
                        {row.step} → {row.points} pts
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <div className="flex flex-wrap gap-2">
                {mission.equipments && <span className="badge badge-outline">Equipamento</span>}
                {typeLabel && <span className="badge badge-ghost">Tipo: {typeLabel}</span>}
              </div>

              {mission.manualTrackingRequired && (
                <div role="alert" className="alert alert-warning text-sm">
                  <span>
                    ⚠ Atenção — {mission.manualTrackingNote ??
                      "Esta condição precisa ser acompanhada durante a partida. O estado final do tapete não é suficiente para determinar o resultado."}
                  </span>
                </div>
              )}

              {mission.zeroWholeMissionIfFalse && (
                <div role="alert" className="alert alert-error text-sm">
                  <span>
                    Regra importante — se esta condição não for cumprida, a missão e suas
                    sub-missões pontuam 0.
                  </span>
                </div>
              )}
            </div>
          </div>

          {mission.subMissions.length > 0 && (
            <div className="border-t border-base-300 p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
                Objetivos adicionais
              </h3>
              <div className="mt-2 flex flex-col gap-3">
                {mission.subMissions.map((sub) => (
                  <div key={sub.id} className="rounded-xl border border-base-300 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="badge badge-primary badge-outline badge-sm">
                        {formatPoints(sub.points)}
                      </span>
                      {sub.bonusExclusive && (
                        <span className="badge badge-secondary badge-sm">Bônus exclusivo</span>
                      )}
                    </div>
                    <p className="mt-2 text-sm">{sub.description}</p>

                    {sub.note && <p className="mt-1 text-xs text-base-content/60">{sub.note}</p>}

                    {sub.requires.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
                          Requisitos
                        </p>
                        <ul className="mt-1 list-inside list-disc text-xs text-base-content/70">
                          {sub.requires.map((req, i) => (
                            <li key={i}>{formatRequirement(req)}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {sub.manualTrackingRequired && (
                      <div role="alert" className="alert alert-warning mt-2 text-xs">
                        <span>
                          ⚠ {sub.manualTrackingNote ??
                            "Esta condição precisa ser acompanhada durante a partida."}
                        </span>
                      </div>
                    )}

                    {sub.zeroWholeMissionIfFalse && (
                      <div role="alert" className="alert alert-error mt-2 text-xs">
                        <span>
                          Se esta condição não for cumprida, a missão e suas sub-missões pontuam 0.
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="modal-action border-t border-base-300 px-5 py-4">
            <form method="dialog">
              <button type="submit" className="btn">
                Fechar
              </button>
            </form>
          </div>
        </div>
      )}

      <form method="dialog" className="modal-backdrop">
        <button type="submit" aria-label="Fechar">
          close
        </button>
      </form>
    </dialog>
  );
}
