/**
 * Interfaces for FormMission component and its subcomponents
 */
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

/* Interface Range Input */

interface RangeInputProps {
  missionId: string;
  index: number;
  points: number | number[];
  start?: number;
  end?: number;
  value?: number | string; 
  onSelect: (missionId: string, index: number, value: number) => void;
}

/* Interface Switch Input */

interface SwitchInputProps {
  missionId: string;
  index: number;
  points: number | number[];
  options?: string[];
  value?: string | number;
  onSelect: (missionId: string, index: number, value: number) => void;
}


/* Interface Mission Card */

interface SubMission {
  submission: string;
  points: number | number[];
  type: ["switch" | "range", ...(string | number | null)[]];
}

interface Mission {
  id: string;
  name: string;
  mission: string;
  points: number | number[];
  equipaments: boolean;
  type: ["switch" | "range", ...(string | number | null)[]];
  image?: string;
  ["sub-mission"]?: SubMission[];
}

interface MissionCardProps {
  mission: Mission;
  responses?: { [index: number]: string | number };
  onSelect: (missionId: string, index: number, value: string | number) => void;
}