"use client";

interface RankedTeam {
  id_team: number;
  name_team: string;
  totalPoints: number;
}

interface EventConfig {
  base: string;
  rodadas: string[];
  temporada?: string;
  preset?: {
    colors: [string, string, string];
    url_background: string;
  };
}

interface EventStats {
  totalTeams: number;
  highestScore: number;
  averageScore: number;
  bestTeam: RankedTeam | null;
  topTeams: RankedTeam[];
}

interface GeneralPageProps {
  name_event: string;
  event_config: EventConfig | null;
  stats: EventStats;
  ranking: RankedTeam[];
  event_active: boolean;
}

const SEASON_ASSETS: Record<
  string,
  {
    banner: string;
    logo: string;
    accent: string;
  }
> = {
  MASTERPIECE: {
    banner:
      "/images/showLive/banners/banner_masterpiece.webp",
    logo:
      "/images/logos/Masterpiece.png",

    accent: "from-pink-500/30",
  },

  SUBMERGED: {
    banner:
      "/images/showLive/banners/banner_submerged.webp",
    logo:
      "/images/logos/Submerged.webp",
    accent: "from-cyan-500/30",
  },

  UNEARTHED: {
    banner:
      "/images/showLive/banners/banner_uneartherd.webp",
    logo:
      "/images/logos/Unearthed.webp",
    accent: "from-amber-500/30",
  },
};

const DEFAULT_ASSETS = {
  banner:
    "/images/showLive/banners/banner_default.webp",
  logo: "/images/logos/Icone.png",
  accent: "from-primary/30",
};

function getSeasonAssets(
  temporada?: string
) {
  return temporada
    ? SEASON_ASSETS[
        temporada
      ] ?? DEFAULT_ASSETS
    : DEFAULT_ASSETS;
}

export default function GeneralPage({
  name_event,
  event_config,
  stats,
  ranking,
  event_active,
}: GeneralPageProps) {
  const { banner, logo, accent } =
    getSeasonAssets(
      event_config?.temporada
    );

  const tips = [
    "Mantenha os dados do evento atualizados para garantir uma experiência fluida.",
    "Revise as pontuações regularmente para evitar surpresas no ranking.",
    "Ative brackets para competições eliminatórias.",
    "Compartilhe os códigos de visitante e voluntário com sua equipe.",
  ];

  return (
    <div className="px-4 md:px-6 pb-10 space-y-8">
      {/* HERO */}
      <section
        className="
          relative overflow-hidden
          rounded-[2rem]
          border border-base-300
          min-h-[320px]
          lg:min-h-[420px]
          shadow-xl
        "
      >
        <img
          src={banner}
          alt={name_event}
          className="
            absolute inset-0
            w-full h-full
            object-cover
          "
        />

        <div
          className={`
            absolute inset-0
            bg-gradient-to-br
            ${accent}
            via-black/30
            to-black/80
          `}
        />

        <div
          className="
            relative z-10
            flex flex-col justify-end
            h-full
            p-6 md:p-10
          "
        >
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className={`badge ${event_active ? 'badge-success' : 'badge-error'} gap-2 border-none px-3 py-3`}>
                <span className={`w-2 h-2 rounded-full bg-${event_active ? 'green-500' : 'red-500'} animate-pulse`} />
                {event_active ? "Ativo" : "Inativo"}
              </span>

              {event_config?.temporada && (
                <span
                  className="
                    badge badge-outline
                    bg-white/10
                    backdrop-blur
                    border-white/20
                    text-white
                    px-3 py-3
                  "
                >
                  {
                    event_config.temporada
                  }
                </span>
              )}

              {event_config?.base && (
                <span
                  className="
                    badge badge-outline
                    bg-black/20
                    border-white/10
                    text-white
                    px-3 py-3
                  "
                >
                  {event_config.base}
                </span>
              )}
            </div>

            <h1
              className="
                text-4xl md:text-5xl
                font-black
                text-white
                leading-tight
              "
            >
              {name_event}
            </h1>

            <p
              className="
                text-white/70
                mt-4
                text-sm md:text-base
                max-w-2xl
              "
            >
              Central de gerenciamento do evento.
              Controle equipes, ranking,
              visualização pública e acompanhe
              tudo em tempo real.
            </p>
          </div>
        </div>

        <div
          className="
            absolute top-6 right-6
            hidden lg:flex
            h-28 w-28
            rounded-3xl
            bg-white/10
            backdrop-blur-xl
            border border-white/10
            items-center justify-center
            p-4
          "
        >
          <img
            src={logo}
            alt="Logo temporada"
            className="
              w-full h-full
              object-contain
            "
          />
        </div>
      </section>

      {/* STATS */}
      <section
        className="
          grid grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4
          gap-4
        "
      >
        <StatCard
          title="Equipes"
          value={String(stats.totalTeams)}
          description="Participando do evento"
        />

        <StatCard
          title="Maior Pontuação"
          value={`${stats.highestScore}`}
          description="Maior score registrado"
        />

        <StatCard
          title="Média Geral"
          value={`${stats.averageScore}`}
          description="Pontuação média"
        />

        <StatCard
          title="Melhor Equipe"
          value={
            stats.bestTeam?.name_team ??
            "N/A"
          }
          description={
            stats.bestTeam
              ? `${stats.bestTeam.totalPoints} pts`
              : "Sem pontuação"
          }
        />
      </section>

      {/* CONTENT */}
      <section
        className="
          grid grid-cols-1
          xl:grid-cols-3
          gap-6
        "
      >
        {/* LEFT */}
        <div className="xl:col-span-2 space-y-6">
          {/* TOP TEAMS */}
          <div
            className="
              rounded-3xl
              border border-base-300
              bg-base-100
              p-6
              shadow-sm
            "
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold">
                Top Equipes
              </h2>

              <p className="text-sm text-base-content/50 mt-1">
                Ranking geral baseado nas
                pontuações atuais.
              </p>
            </div>

            {stats.topTeams.length > 0 ? (
              <div className="space-y-3">
                {stats.topTeams.map(
                  (team, index) => (
                    <div
                      key={team.id_team}
                      className="
                        flex items-center justify-between
                        rounded-2xl
                        border border-base-300
                        bg-base-200/50
                        p-4
                      "
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="
                            h-12 w-12
                            rounded-2xl
                            bg-primary/10
                            text-primary
                            flex items-center justify-center
                            font-bold
                          "
                        >
                          #{index + 1}
                        </div>

                        <div>
                          <h3 className="font-semibold">
                            {team.name_team}
                          </h3>

                          <p className="text-sm text-base-content/50">
                            Equipe ranqueada
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-black text-primary">
                          {
                            team.totalPoints < 0 ? 0 : team.totalPoints
                          }
                        </p>

                        <p className="text-xs text-base-content/40">
                          pontos
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <EmptyCard text="Nenhuma pontuação disponível." />
            )}
          </div>

          {/* ROUNDS */}
          <div
            className="
              rounded-3xl
              border border-base-300
              bg-base-100
              p-6
              shadow-sm
            "
          >
            <div className="mb-5">
              <h2 className="text-xl font-bold">
                Rodadas do Evento
              </h2>

              <p className="text-sm text-base-content/50 mt-1">
                Estrutura utilizada para
                organização da competição.
              </p>
            </div>

            {event_config?.rodadas
              ?.length ? (
              <div
                className="
                  flex flex-wrap gap-3
                "
              >
                {event_config.rodadas.map(
                  (rodada) => (
                    <div
                      key={rodada}
                      className="
                        px-4 py-3
                        rounded-2xl
                        bg-base-200
                        border border-base-300
                        font-medium text-sm
                      "
                    >
                      {rodada}
                    </div>
                  )
                )}
              </div>
            ) : (
              <EmptyCard text="Nenhuma rodada cadastrada." />
            )}
          </div>

          {/* FULL RANKING */}
          <div
            className="
              rounded-3xl
              border border-base-300
              bg-base-100
              p-6
              shadow-sm
            "
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold">
                Ranking Geral
              </h2>

              <p className="text-sm text-base-content/50 mt-1">
                Todas as equipes ordenadas
                por pontuação.
              </p>
            </div>

            {ranking.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Equipe</th>
                      <th>Pontos</th>
                    </tr>
                  </thead>

                  <tbody>
                    {ranking.map(
                      (team, index) => (
                        <tr
                          key={
                            team.id_team
                          }
                        >
                          <td>
                            {index + 1}
                          </td>

                          <td>
                            {
                              team.name_team
                            }
                          </td>

                          <td className="font-bold text-primary">
                            {
                              team.totalPoints < 0 ? 0 : team.totalPoints
                            }
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyCard text="Nenhuma equipe cadastrada." />
            )}
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          {/* SEASON */}
          <div
            className="
              rounded-3xl
              border border-base-300
              bg-base-100
              p-6
              shadow-sm
            "
          >
            <div className="flex items-center gap-4">
              <div
                className="
                  h-20 w-20
                  rounded-2xl
                  bg-base-200
                  flex items-center justify-center
                  p-3
                "
              >
                <img
                  src={logo}
                  alt="Temporada"
                  className="
                    w-full h-full
                    object-contain
                  "
                />
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-base-content/40">
                  Temporada
                </p>

                <h2 className="text-xl font-bold mt-1">
                  {event_config?.temporada ??
                    "Padrão"}
                </h2>
              </div>
            </div>
          </div>

          {/* QUICK INFO */}
          <div
            className="
              rounded-3xl
              border border-base-300
              bg-base-100
              p-6
              shadow-sm
            "
          >
            <h2 className="text-lg font-bold mb-5">
              Informações rápidas
            </h2>

            <div className="space-y-4">
              <InfoItem
                label="Modalidade"
                value={
                  event_config?.base ??
                  "Não definida"
                }
              />

              <InfoItem
                label="Rodadas"
                value={String(
                  event_config
                    ?.rodadas?.length ?? 0
                )}
              />

              <InfoItem
                label="Equipes"
                value={String(
                  stats.totalTeams
                )}
              />

              <InfoItem
                label="Status"
                value="Ativo"
              />
            </div>
          </div>

          {/* TIPS */}
          <div
            className="
              rounded-3xl
              border border-primary/20
              bg-primary/5
              p-6
            "
          >
            <div className="flex items-center gap-3 mb-5">
              <div
                className="
                  h-10 w-10
                  rounded-2xl
                  bg-primary/10
                  text-primary
                  flex items-center justify-center
                "
              >
                💡
              </div>

              <div>
                <h2 className="font-bold">
                  Dicas rápidas
                </h2>

                <p className="text-xs text-base-content/50">
                  Melhor experiência no
                  evento
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {tips.map((tip) => (
                <div
                  key={tip}
                  className="
                    flex items-start gap-3
                    text-sm
                  "
                >
                  <div
                    className="
                      mt-1
                      w-2 h-2
                      rounded-full
                      bg-primary
                      shrink-0
                    "
                  />

                  <p className="text-base-content/70 leading-relaxed">
                    {tip}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

interface StatCardProps {
  title: string;

  value: string;

  description: string;
}

function StatCard({
  title,
  value,
  description,
}: StatCardProps) {
  return (
    <div
      className="
        rounded-3xl
        border border-base-300
        bg-base-100
        p-6
        shadow-sm
      "
    >
      <p className="text-sm text-base-content/50">
        {title}
      </p>

      <h2 className="text-3xl font-black mt-3">
        {value}
      </h2>

      <p className="text-xs text-base-content/40 mt-2">
        {description}
      </p>
    </div>
  );
}

interface InfoItemProps {
  label: string;

  value: string;
}

function InfoItem({
  label,
  value,
}: InfoItemProps) {
  return (
    <div
      className="
        flex items-center justify-between
        gap-4
        rounded-2xl
        border border-base-300
        bg-base-200/50
        px-4 py-3
      "
    >
      <span className="text-sm text-base-content/50">
        {label}
      </span>

      <span className="font-semibold text-sm">
        {value}
      </span>
    </div>
  );
}

function EmptyCard({
  text,
}: {
  text: string;
}) {
  return (
    <div
      className="
        rounded-2xl
        border border-dashed
        border-base-300
        p-6
        text-sm
        text-base-content/50
      "
    >
      {text}
    </div>
  );
}