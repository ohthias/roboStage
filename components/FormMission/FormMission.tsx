"use client";
import { MissionCard } from "./MissionCard";

export default function FormMission({
  missions = [],
  responses = {},
  onSelect = () => {},
  className = "",
}: FormMissionProps) {
  return (
    <div className={`bg-base-100 p-4 rounded-2xl max-w-4xl sm:mx-auto w-full ${className}`}>
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
