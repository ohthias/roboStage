export function RunsResultSection({
  test,
  missionScores,
  setMissionScores,
}: any) {
  return (
    <div className="space-y-4">
      {test.test_missions.map(
        (mission: any) => (
          <div
            key={mission.id}
            className="card bg-base-100 border"
          >
            <div className="card-body">
              <div className="flex justify-between">
                <span>
                  {mission.mission_key}
                </span>

                <span className="text-sm opacity-60">
                  máximo:
                  {mission.max_value}
                </span>
              </div>

              <input
                type="number"
                min={0}
                max={mission.max_value}
                className="input input-bordered"
                value={
                  missionScores[
                    mission.mission_key
                  ] ?? ""
                }
                onChange={(e) =>
                  setMissionScores({
                    ...missionScores,
                    [mission.mission_key]:
                      Number(
                        e.target.value
                      ),
                  })
                }
              />
            </div>
          </div>
        )
      )}
    </div>
  );
}