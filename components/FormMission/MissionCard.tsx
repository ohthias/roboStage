import { SwitchInput } from "./SwitchInput";
import { RangeInput } from "./RangeInput";
import { computeMissionBreakdown } from "@/utils/scores";

export function MissionCard({
  mission,
  responses = {},
  onSelect,
  imagesEnabled = true,
  isBadgeEnabled = true,
}: MissionCardProps) {
  const { mainPoints, subPoints, gated, unmet } = computeMissionBreakdown(
    mission,
    responses,
  );

  const renderInput = (
    index: number,
    type: Mission["type"],
    value: number | undefined,
  ) => {
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

    return <span className="badge badge-ghost">Tipo inválido</span>;
  };

  const subs = mission["sub-mission"] || [];

  return (
    <div className="card border border-base-200 mb-6">
      <div className="card-body p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="badge bg-base-300/50 text-base-content text-md p-4 rounded-md w-12 h-12 font-bold flex items-center justify-center">
            {mission.id}
          </div>
          <h3 className="card-title text-lg sm:text-xl font-bold flex-1">
            {mission.name.toUpperCase()}
          </h3>
          {mission.equipaments && (
            <img
              src="/images/icons/NoEquip.png"
              className="w-8 h-8 sm:w-10 sm:h-10"
              alt="Sem equipamentos"
            />
          )}
        </div>

        {gated && (
          <div className="alert alert-soft alert-warning text-xs sm:text-sm mb-3 py-2">
            Condição obrigatória não cumprida: esta missão e seus bônus pontuam
            0.
          </div>
        )}

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {mission.image && imagesEnabled && (
            <figure className="flex-shrink-0 mx-auto md:mx-0">
              <img
                src={mission.image}
                alt={`Missão ${mission.name}`}
                className="rounded-lg w-32 h-32 object-contain"
              />
            </figure>
          )}

          <div className="w-full">
            {mission.mission && (
              <div className="mb-4">
                <p className="mb-2 text-sm sm:text-base flex justify-between items-center">
                  <span className="max-w-3/4">{mission.mission}</span>
                  {mission.id !== "GP" && isBadgeEnabled && (
                    <span className="badge badge-outline rounded-md w-auto text-center badge-sm h-auto">
                      Pontos: {mainPoints}
                    </span>
                  )}
                </p>
                {renderInput(0, mission.type, responses[0])}
              </div>
            )}

            {subs.length ? <div className="divider my-2"></div> : null}

            {subs.map((sub, idx) => {
              const value = responses[idx + 1];
              const points = subPoints[idx];
              const requiresUnmet = !gated && unmet.includes(idx);

              return (
                <div key={sub.id ?? `${mission.id}-sub${idx}`} className="mb-4">
                  <p className="mb-2 text-sm sm:text-base flex justify-between items-center gap-2">
                    <span className="flex-1">
                      {sub.submission}
                      {sub.manual_tracking_required && (
                        <span
                          className="badge badge-warning badge-xs ml-2 align-middle"
                          title={sub.manual_tracking_note}
                        >
                          Acompanhamento manual
                        </span>
                      )}
                      {sub.bonus_exclusive && (
                        <span className="badge badge-ghost badge-xs ml-2 align-middle">
                          Bônus exclusivo
                        </span>
                      )}
                    </span>
                    {sub.zero_whole_mission_if_false && (
                      <span
                        className="badge badge-error rounded-md w-auto text-center badge-sm h-auto"
                        title="Se esta condição não for cumprida, a missão inteira pontua 0."
                      >
                        Obrigatório
                      </span>
                    )}
                    {isBadgeEnabled && sub.points !== 0 && (
                      <span className="badge badge-outline rounded-md w-auto text-center badge-sm h-auto">
                        Pontos: {points}
                      </span>
                    )}
                  </p>
                  {sub.note && (
                    <p className="text-xs opacity-60 mb-1">{sub.note}</p>
                  )}
                  {requiresUnmet && (
                    <p className="text-xs text-warning mb-1">
                      Condição não cumprida — este bônus não pontua.
                    </p>
                  )}
                  {renderInput(idx + 1, sub.type, value)}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
