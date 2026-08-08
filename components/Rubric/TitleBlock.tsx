"use client";

interface TitleBlockProps {
  teamNumber: string;
  setTeamNumber: (v: string) => void;
  teamName: string;
  setTeamName: (v: string) => void;
  room: string;
  setRoom: (v: string) => void;
}

export default function TitleBlock({
  teamNumber,
  setTeamNumber,
  teamName,
  setTeamName,
  room,
  setRoom,
}: TitleBlockProps) {
  const fieldCls =
    "input input-sm w-full font-mono-tech text-sm";
  const labelCls = "font-mono-tech text-[10px] uppercase tracking-widest text-base-content/55";

  return (
    <div className="relative paper-sheet rounded-box border border-base-content/15 p-4 sm:p-5">
      <p className="font-bold text-base-content/80">Informações da Equipe</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
        <div>
          <label className={labelCls}>Equipe #</label>
          <input
            className={fieldCls}
            value={teamNumber}
            onChange={(e) => setTeamNumber(e.target.value)}
            placeholder="Nº"
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className={labelCls}>Nome da Equipe</label>
          <input
            className={fieldCls}
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Nome"
          />
        </div>
        <div>
          <label className={labelCls}>Sala de Avaliação</label>
          <input
            className={fieldCls}
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Sala"
          />
        </div>
      </div>
    </div>
  );
}
