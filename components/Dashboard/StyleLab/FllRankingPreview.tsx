import { StyleLabTheme } from "@/app/(private)/dashboard/stylelab/page";

interface FllRankingPreviewProps {
  theme: StyleLabTheme;
}

export function FllRankingPreview({ theme }: FllRankingPreviewProps) {
  const primary = theme.colors?.[0] || "#2563eb";
  const secondary = theme.colors?.[1] || "#1e293b";

  return (
    <div
      className="relative min-h-[420px] p-8"
      style={{
        backgroundImage: `url(${
          theme.background_url || "/images/showLive/banners/banner_default.webp"
        })`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Conteúdo */}
      <div className="relative z-10 space-y-6">
        {/* Título */}
        <div
          className="rounded-xl p-4 text-white"
        >
          <h2 className="text-2xl font-bold text-center" style={{color: primary}}>
            FIRST LEGO League – Ranking Geral
          </h2>
          <p className="text-sm opacity-90 font-italic text-center">Pré-visualização de tabela</p>
        </div>

        {/* Tabela */}
        <div className="overflow-hidden rounded-xl border border-white/20">
          <table className="w-full text-sm text-white" style={{color: theme.colors?.[2] || "#ffffff"}}>
            <thead style={{ backgroundColor: secondary }}>
              <tr>
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Equipe</th>
                <th className="p-3 text-center">Melhor</th>
                <th className="p-3 text-center">Round 1</th>
                <th className="p-3 text-center">Round 2</th>
                <th className="p-3 text-center">Round 3</th>
              </tr>
            </thead>
            <tbody className="bg-black/40">
              {["Alpha", "Beta", "Gamma", "Delta"].map((team, i) => (
                <tr
                  key={team}
                  className="border-t border-white/10 hover:bg-white/10 transition"
                >
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3">{team}</td>
                  <td className="p-3 text-center">{320 - i * 15}</td>
                  <td className="p-3 text-center">{100 - i * 5}</td>
                  <td className="p-3 text-center">{110 - i * 5}</td>
                  <td className="p-3 text-center">{110 - i * 5}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legenda */}
        <div className="flex gap-2 items-center text-xs text-white/70">
          <span
            className="w-3 h-3 rounded"
            style={{ backgroundColor: primary }}
          />
          <span>Título</span>

          <span
            className="w-3 h-3 rounded ml-4"
            style={{ backgroundColor: secondary }}
          />
          <span>Cabeçalho da tabela</span>
        </div>
      </div>
    </div>
  );
}
