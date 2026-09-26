export type ProficiencyLevel = "beginner" | "intermediate" | "advanced" | "expert";

export const PROFICIENCY_SCALE: Record<ProficiencyLevel, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
};

export interface CompanyRequirement {
  companyId: string;
  companyName: string;
  topic: string;
  expectedLevel: ProficiencyLevel;
}

export interface GapItem {
  topic: string;
  required: ProficiencyLevel;
  requiredScore: number;
  current: ProficiencyLevel | "none";
  currentScore: number;
  severity: number; // requiredScore - currentScore (higher = bigger gap)
  rank: number;
}

export interface GapResult {
  gaps: GapItem[];
  targetCompanies: string[];
  computedAt: Date;
}

export type TopicProficiencyMap = Record<string, number>; // topic -> score (0–100)
