export interface SubCause {
  name: string;
  details: string[];
}

export interface Cause {
  name: string;
  subcauses: SubCause[];
}

export interface FishboneData {
  problem: string;
  causes: Cause[];
}
