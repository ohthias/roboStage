"use client";

import Image from "next/image";
import { Target } from "lucide-react";
import { Button, Callout, Chip, Modal, StickerTag } from "@/components/stage";
import type { MissionGuideMission, MissionGuideRequirement } from "@/features/leagues/fll/mission-guide/lib/types";
import { formatMissionType, formatPoints, getPointsDistribution } from "@/features/leagues/fll/mission-guide/lib/utils";

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

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="stage-kicker text-base-content/45">/ {title}</h3>
      <div className="mt-1.5 text-sm leading-6">{children}</div>
    </section>
  );
}

export function MissionModal({ mission, onClose }: MissionModalProps) {
  const distribution = mission ? getPointsDistribution(mission.points) : null;
  const typeLabel = mission ? formatMissionType(mission.type) : null;

  return (
    <Modal
      open={!!mission}
      onClose={onClose}
      size="lg"
      kicker={mission ? `MISSÃO ${mission.id}` : undefined}
      title={mission?.name ?? "Detalhes da missão"}
      icon={<Target size={20} />}
      sticker={false}
      footer={
        <Button tone="outline" size="sm" onClick={onClose}>
          Fechar
        </Button>
      }
    >
      {mission && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="stage-dots relative aspect-square w-full overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-200/60 [background-size:16px_16px]">
              {mission.image ? (
                <Image
                  src={mission.image}
                  alt={mission.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain p-4"
                />
              ) : (
                <div className="stage-display flex h-full w-full items-center justify-center text-5xl text-base-content/20">
                  {mission.id}
                </div>
              )}
              <StickerTag tone="primary" rotate={-4} className="absolute bottom-3 left-3">
                {formatPoints(mission.points)}
              </StickerTag>
            </div>

            <div className="flex flex-col gap-5">
              <Block title="OBJETIVO">
                <p>{mission.description}</p>
                {mission.objective && <p className="mt-1 text-base-content/70">{mission.objective}</p>}
              </Block>

              {mission.mechanism && (
                <Block title="MECANISMO">
                  <p>{mission.mechanism}</p>
                </Block>
              )}

              {mission.strategy && (
                <Block title="ESTRATÉGIA">
                  <p>{mission.strategy}</p>
                </Block>
              )}

              {mission.tips.length > 0 && (
                <Block title="DICAS">
                  <ul className="list-inside list-disc space-y-0.5">
                    {mission.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </Block>
              )}

              <Block title="PONTUAÇÃO">
                <p className="font-bold">{formatPoints(mission.points)}</p>
                {distribution && (
                  <ul className="mt-1 space-y-0.5 font-mono text-xs text-base-content/70">
                    {distribution.map((row) => (
                      <li key={row.step}>
                        {row.step} → {row.points} pts
                      </li>
                    ))}
                  </ul>
                )}
              </Block>

              {(mission.equipments || typeLabel) && (
                <div className="flex flex-wrap gap-2">
                  {mission.equipments && <Chip>Equipamento</Chip>}
                  {typeLabel && <Chip>Tipo: {typeLabel}</Chip>}
                </div>
              )}
            </div>
          </div>

          {mission.manualTrackingRequired && (
            <Callout type="warning">
              {mission.manualTrackingNote ??
                "Esta condição precisa ser acompanhada durante a partida. O estado final do tapete não é suficiente para determinar o resultado."}
            </Callout>
          )}

          {mission.zeroWholeMissionIfFalse && (
            <Callout type="danger" title="Regra importante">
              Se esta condição não for cumprida, a missão e suas sub-missões pontuam 0.
            </Callout>
          )}

          {mission.subMissions.length > 0 && (
            <section className="border-t border-dashed border-base-300 pt-5">
              <h3 className="stage-kicker text-base-content/45">/ OBJETIVOS ADICIONAIS</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {mission.subMissions.map((sub) => (
                  <div key={sub.id} className="rounded-tl-xl rounded-br-xl border border-base-300 bg-base-100 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary">{formatPoints(sub.points)}</span>
                      {sub.bonusExclusive && (
                        <span className="rounded-tl-md rounded-br-md bg-secondary px-1.5 py-0.5 text-[10px] font-bold uppercase text-secondary-content">
                          Bônus exclusivo
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm leading-6">{sub.description}</p>

                    {sub.note && <p className="mt-1 text-xs text-base-content/60">{sub.note}</p>}

                    {sub.requires.length > 0 && (
                      <div className="mt-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-base-content/50">
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
                      <p role="note" className="mt-2 rounded-md border border-warning/40 bg-warning/10 px-2 py-1 text-xs">
                        ⚠ {sub.manualTrackingNote ?? "Esta condição precisa ser acompanhada durante a partida."}
                      </p>
                    )}

                    {sub.zeroWholeMissionIfFalse && (
                      <p role="note" className="mt-2 rounded-md border border-error/30 bg-error/10 px-2 py-1 text-xs text-error">
                        Se esta condição não for cumprida, a missão e suas sub-missões pontuam 0.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </Modal>
  );
}
