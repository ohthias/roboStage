"use client";
import { MissionCard } from "./MissionCard";

interface Responses {
  [missionId: string]: {
    [index: number]: string | number;
  };
}

interface FormMissionProps {
  missions?: any[];
  responses?: Responses;
  onSelect?: (missionId: string, index: number, value: string | number) => void;
  className?: string;
}

export default function FormMission({
  missions = [],
  responses = {},
  onSelect = () => {},
  className = "",
}: FormMissionProps) {
  return (
    <div className={`bg-base-100 p-4 rounded-lg max-w-4xl sm:mx-auto w-full ${className}`}>
      {missions.map((mission) => (
        <MissionCard
          key={mission.id}
          mission={mission}
          responses={responses[mission.id]}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
