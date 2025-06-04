import React from "react";

type KnockoutBracketProps = {
  leftSemiFinal?: string[];
  rightSemiFinal?: string[];
  finalTeams?: string[];
  finalWinner?: string | null;
};

export default function KnockoutBracket({
  leftSemiFinal = [],
  rightSemiFinal = [],
  finalTeams = [],
  finalWinner = null,
}: KnockoutBracketProps) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <h1 className="text-3xl font-bold mb-10">Chaveamento</h1>

      <div className="flex justify-center items-center gap-8 relative">
        {/* Left Semifinal */}
        <div className="flex flex-col gap-4 relative">
          {leftSemiFinal.map((team, index) => (
            <div key={index} className="bg-white border-2 border-gray-400 rounded p-4 w-40 text-center">
              {team}
            </div>
          ))}

          {/* Linha curva para final */}
          <div className="absolute top-0 left-full h-full w-10 flex flex-col justify-between items-start pointer-events-none">
            <div className="border-l-2 border-b-2 border-gray-400 w-6 h-10 rounded-bl-md"></div>
            <div className="border-l-2 border-t-2 border-gray-400 w-6 h-10 rounded-tl-md"></div>
          </div>
        </div>

        {/* Final */}
        <div className="flex flex-col items-center gap-2 bg-white border-2 border-gray-400 rounded p-4 min-w-[150px] text-center font-medium">
          {finalTeams.length > 0 ? (
            <>
              {finalTeams.map((team, i) => (
                <div key={i}>{team}</div>
              ))}
            </>
          ) : (
            <div className="text-gray-400">Sem finalistas</div>
          )}
        </div>

        {/* Right Semifinal */}
        <div className="flex flex-col gap-4 relative">
          {rightSemiFinal.map((team, index) => (
            <div key={index} className="bg-white border-2 border-gray-400 rounded p-4 w-40 text-center">
              {team}
            </div>
          ))}

          {/* Linha curva para final */}
          <div className="absolute top-0 right-full h-full w-10 flex flex-col justify-between items-end pointer-events-none">
            <div className="border-r-2 border-b-2 border-gray-400 w-6 h-20 rounded-br-md"></div>
            <div className="border-r-2 border-t-2 border-gray-400 w-6 h-10 rounded-tr-md"></div>
          </div>
        </div>
      </div>

      {/* Vencedor */}
      {finalWinner && (
        <div className="mt-8 text-2xl font-bold text-green-700">
          Campeão: {finalWinner} 🏆
        </div>
      )}
    </div>
  );
}
