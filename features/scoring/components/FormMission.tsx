import { cn } from "@/components/stage";
import { MissionCard } from "./MissionCard";

export default function FormMission({
  missions = [],
  responses = {},
  onSelect = () => {},
  imagesEnabled = true,
  isBadgeEnabled = true,
  className = "",
}: FormMissionProps) {
  return (
    <div className={cn("flex flex-col w-full gap-x-5 gap-y-7 pt-3", className)}>
      {missions.map((mission) => (
        <MissionCard
          key={mission.id}
          mission={mission}
          responses={responses[mission.id]}
          onSelect={onSelect}
          imagesEnabled={imagesEnabled}
          isBadgeEnabled={isBadgeEnabled}
        />
      ))}
    </div>
  );
}
