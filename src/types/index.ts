export type CriteriaType = "benefit" | "cost";

export interface Criteria {
  id: string;
  name: string;
  code: string;
  type: CriteriaType;
  weight: number;
  targetValue?: number; // Needed for Profile Matching
  factorType?: "core" | "secondary"; // Needed for Profile Matching
}

export interface Alternative {
  id: string;
  name: string;
  code: string;
}

export interface AlternativeValue {
  alternativeId: string;
  criteriaId: string;
  value: number;
}

export interface MOORAResult {
  alternativeId: string;
  alternativeName: string;
  alternativeCode: string;
  normalizedMatrix: Record<string, number>;
  weightedMatrix: Record<string, number>;
  benefitSum: number;
  costSum: number;
  yi: number;
  rank: number;
}

export interface MOORASteps {
  originalMatrix: number[][];
  normalizedMatrix: number[][];
  weightedMatrix: number[][];
  results: MOORAResult[];
  criteriaOrder: string[];
  alternativeOrder: string[];
}

export type MethodType = 
  | "MOORA" 
  | "SAW" 
  | "TOPSIS" 
  | "AHP" 
  | "WP"
  | "SMART"
  | "WASPAS"
  | "ARAS"
  | "VIKOR"
  | "EDAS"
  | "PROMETHEE"
  | "ELECTRE"
  | "PROFILE_MATCHING";

export interface ProjectSnapshot {
  id: string;
  label: string;
  timestamp: string;
  criteria: Criteria[];
  alternatives: Alternative[];
  values: AlternativeValue[];
  results: MOORAResult[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  criteria: Criteria[];
  alternatives: Alternative[];
  values: AlternativeValue[];
  snapshots: ProjectSnapshot[];
  methods: MethodType[]; // Metode SPK yang diaktifkan untuk proyek ini
  ahpMatrix?: Record<string, Record<string, number>>; // Menyimpan matriks skala Saaty (criteriaId -> criteriaId -> nilai)
}
