export type TestMode = "runs" | "calibrabot" | "individual";

export type TestSeason = "submerged" | "unearthed";

export interface TestMission {
  mission_key: string;
  mission_name: string;
  mission_order: number;
  season?: TestSeason;
  max_value?: number;
}

export interface TestVariable {
  name: string;
  value?: any;
  unit?: string;
  variable_order?: number;
}

export interface CreateLabTestDTO {
  name: string;
  description?: string;

  mode: TestMode;
  season?: TestSeason;

  team_id?: number;
  folder_id?: number;

  config?: Record<string, any>;

  missions?: TestMission[];

  variables?: TestVariable[];
}