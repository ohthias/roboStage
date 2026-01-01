"use client";

interface UserAchievement {
  unlocked_at: string;
  achievement: {
    id: number;
    code: string;
    title: string;
    description: string;
    icon: string;
    xp: number;
  };
}

interface Props {
  achievements: UserAchievement[];
}

export default function AchievementSummary({ achievements }: Props) {
  if (!achievements.length) {
    return (
      <div className="card bg-base-100 shadow-md border border-base-300">
        <div className="card-body">
          <h2 className="card-title flex items-center gap-2">
            🏆 Conquistas
          </h2>
          <p className="text-sm opacity-70">
            Nenhuma conquista desbloqueada ainda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-md border border-base-300">
      <div className="card-body">
        <h2 className="card-title flex items-center gap-3">
          🏆 Conquistas
          <span className="badge badge-primary badge-lg">
            {achievements.length}
          </span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
          {achievements.slice(0, 4).map((a) => (
            <div
              key={a.achievement.code}
              className="flex items-center gap-4 p-4 rounded-2xl 
                         bg-gradient-to-br from-base-200 to-base-300
                         border border-base-300
                         hover:scale-[1.02] transition"
            >
              {/* Medal / Icon */}
              <div className="flex items-center justify-center w-12 h-12 rounded-full
                              bg-primary/10 text-primary">
                <i
                  className={`fi fi-br-${a.achievement.icon} text-2xl`}
                />
              </div>

              {/* Info */}
              <div className="flex-1">
                <p className="font-semibold text-sm">
                  {a.achievement.title}
                </p>
                <p className="text-xs opacity-70 leading-snug">
                  {a.achievement.description}
                </p>

                <div className="mt-1">
                  <span className="badge badge-outline badge-sm">
                    +{a.achievement.xp} XP
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {achievements.length > 4 && (
          <p className="text-xs opacity-60 mt-3">
            +{achievements.length - 4} conquistas desbloqueadas
          </p>
        )}
      </div>
    </div>
  );
}