import { asset } from "@/lib/assets";
import { SwitchInput } from "./SwitchInput";
import { RangeInput } from "./RangeInput";
import { computeMissionBreakdown } from "@/features/scoring/lib/scores";
import { Starburst, cn } from "@/components/stage";

export function MissionCard({
  mission,
  responses = {},
  onSelect,
  imagesEnabled = true,
  isBadgeEnabled = true,
}: MissionCardProps) {
  const { mainPoints, subPoints, total, gated, unmet } = computeMissionBreakdown(
    mission,
    responses,
  );

  const renderInput = (index: number, type: Mission["type"], value: number | undefined) => {
    if (type[0] === "switch") {
      return (
        <SwitchInput
          missionId={mission.id}
          index={index}
          options={type.slice(1).filter(Boolean).map(String)}
          value={value}
          onSelect={onSelect}
        />
      );
    }

    if (type[0] === "range") {
      return (
        <RangeInput
          missionId={mission.id}
          index={index}
          start={Number(type[1]) || 0}
          end={Number(type[2]) || 10}
          value={value}
          onSelect={onSelect}
        />
      );
    }

    return <span className="text-xs text-base-content/50">Tipo inválido</span>;
  };

  const subs = mission["sub-mission"] || [];
  const scored = total > 0;
  const showPoints = mission.id !== "GP" && isBadgeEnabled;

  return (
    <article
      className={cn(
        "stage-paper relative flex h-full flex-col rounded-2xl border bg-base-100 p-5 transition-[border-color,box-shadow] duration-300",
        gated
          ? "border-warning/60"
          : scored
            ? "border-primary/40 shadow-[4px_4px_0_0_var(--color-primary)]"
            : "border-base-300 hover:border-primary/30",
      )}
    >
      {showPoints && (
        <div
          className="absolute -right-4 -top-5 z-10 transition-transform duration-300"
          style={{ rotate: scored ? "8deg" : "0deg" }}
          aria-label={`${total} pontos nesta missão`}
        >
          <Starburst size={60} tone={scored ? "accent" : "paper"} shadow={false}>
            <span className="text-xl leading-none tabular-nums">
              {total}
              <span className="block text-[0.55rem] tracking-widest">PTS</span>
            </span>
          </Starburst>
        </div>
      )}

      <header className={cn("flex items-start gap-3", showPoints && "pr-12")}>
        <span className="grid size-10 shrink-0 place-items-center rounded-tl-lg rounded-br-lg bg-secondary font-mono text-sm font-bold tracking-wider text-secondary-content">
          {mission.id}
        </span>
          <h3 className="text-lg font-black uppercase leading-tight tracking-tight">{mission.name}</h3>
          {mission.equipaments && (
            <figure className="ml-auto grid size-10 shrink-0 place-items-center">
              <img src={asset("/images/icons/NoEquip.png")} alt="Equipamentos" className="h-full w-full object-contain" />
            </figure>
          )}
      </header>

      {gated && (
        <p role="alert" className="mt-4 rounded-tl-lg rounded-br-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs">
          Condição obrigatória não cumprida: esta missão e seus bônus pontuam 0.
        </p>
      )}

      <div className="mt-4 flex flex-1 flex-col gap-4 sm:flex-row">
        {mission.image && imagesEnabled && (
  <figure className="stage-dots mx-auto flex h-40 w-full shrink-0 items-center justify-center overflow-hidden rounded-tl-xl rounded-br-xl border border-base-300 bg-base-200/60 p-2 [background-size:12px_12px] sm:mx-0 sm:w-1/5">
    <img
      src={mission.image}
      alt={`Missão ${mission.name}`}
      className="h-full w-full object-contain"
    />
  </figure>
)}

        <div className="min-w-0 flex-1 space-y-3">
          {mission.mission && (
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm leading-snug text-base-content/80">{mission.mission}</p>
                {showPoints && subs.length > 0 && (
                  <span className="shrink-0 font-mono text-[11px] font-bold text-base-content/45">+{mainPoints}</span>
                )}
              </div>
              {renderInput(0, mission.type, responses[0])}
            </div>
          )}

          {subs.map((sub, idx) => {
            const value = responses[idx + 1];
            const points = subPoints[idx];
            const requiresUnmet = !gated && unmet.includes(idx);

            return (
              <div
                key={sub.id ?? `${mission.id}-sub${idx}`}
                className={cn("space-y-2", (mission.mission || idx > 0) && "border-t border-dashed border-base-300 pt-3")}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 text-sm leading-snug text-base-content/80">
                    {sub.submission}
                    {(sub.manual_tracking_required || sub.bonus_exclusive || sub.zero_whole_mission_if_false) && (
                      <span className="ml-2 inline-flex flex-wrap gap-1 align-middle">
                        {sub.manual_tracking_required && (
                          <span className="rounded bg-warning/20 px-1.5 py-0.5 text-[10px] font-bold uppercase" title={sub.manual_tracking_note}>
                            Acompanhamento manual
                          </span>
                        )}
                        {sub.bonus_exclusive && (
                          <span className="rounded bg-secondary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-secondary">
                            Bônus exclusivo
                          </span>
                        )}
                        {sub.zero_whole_mission_if_false && (
                          <span
                            className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary"
                            title="Se esta condição não for cumprida, a missão inteira pontua 0."
                          >
                            Obrigatório
                          </span>
                        )}
                      </span>
                    )}
                  </p>
                  {showPoints && sub.points !== 0 && (
                    <span className="shrink-0 font-mono text-[11px] font-bold text-base-content/45">+{points}</span>
                  )}
                </div>
                {sub.note && <p className="text-xs text-base-content/55">{sub.note}</p>}
                {requiresUnmet && (
                  <p className="text-xs font-semibold text-[color-mix(in_oklab,var(--color-warning)_60%,var(--color-base-content))]">
                    Condição não cumprida — este bônus não pontua.
                  </p>
                )}
                {renderInput(idx + 1, sub.type, value)}
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}
