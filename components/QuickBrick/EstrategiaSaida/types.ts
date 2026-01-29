export type MissionStatus = "pending" | "active" | "completed";
export type SubmissionStatus = "pending" | "completed";

export interface MissionSubmission {
  id: string;
  label: string;
  status: SubmissionStatus;
}

export interface Mission {
  id: string;
  apiMissionId: string;
  name: string;
  description: string;
  image?: string;
  status: MissionStatus;
  submissions?: MissionSubmission[];
  score?: number;
  notes?: string;
}

export interface MissionStep {
  id: string;
  missions: Mission[];
}

export interface ExitStrategy {
  id: string;
  name: string;
  createdAt: number;
  steps: MissionStep[];
  description?: string;
  author?: string;
}

export interface ApiMission {
  id: string;
  name: string;
  image?: string;
  description?: string;
  mission: string;
  "sub-mission"?: {
    submission: string;
  }[];
  baseScore?: number;
  category?: string;
}

export interface ExportedStrategy {
  meta: {
    name: string;
    createdAt: number;
    totalSteps: number;
    totalMissions: number;
  };
  steps: {
    order: number;
    missions: {
      apiMissionId: string;
      name: string;
      status: MissionStatus;
      submissions?: {
        label: string;
        status: SubmissionStatus;
      }[];
    }[];
  }[];
}