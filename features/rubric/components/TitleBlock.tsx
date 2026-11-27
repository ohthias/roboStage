"use client";

import { Panel, ToolInput } from "@/components/stage";
import { Users } from "lucide-react";

interface TitleBlockProps {
  teamNumber: string;
  setTeamNumber: (v: string) => void;
  teamName: string;
  setTeamName: (v: string) => void;
  room: string;
  setRoom: (v: string) => void;
}

const labelCls = "mb-1 block text-[11px] font-semibold uppercase tracking-wider text-base-content/50";

export default function TitleBlock({ teamNumber, setTeamNumber, teamName, setTeamName, room, setRoom }: TitleBlockProps) {
  return (
    <Panel title="Informações da equipe" icon={<Users />}>
      <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-[8rem_1fr_12rem]">
        <label>
          <span className={labelCls}>Equipe #</span>
          <ToolInput className="font-mono" value={teamNumber} onChange={(e) => setTeamNumber(e.target.value)} placeholder="Nº" />
        </label>
        <label className="col-span-2 sm:col-span-1">
          <span className={labelCls}>Nome da equipe</span>
          <ToolInput value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Nome" />
        </label>
        <label>
          <span className={labelCls}>Sala de avaliação</span>
          <ToolInput value={room} onChange={(e) => setRoom(e.target.value)} placeholder="Sala" />
        </label>
      </div>
    </Panel>
  );
}
