export type ProficiencyLevel = "beginner" | "intermediate" | "advanced" | "expert";

export interface GapItem {
  topic: string;
  requiredLevel: ProficiencyLevel;
  currentLevel: ProficiencyLevel;
  gapScore: number; // 0: on track, 1: mild, 2: moderate, 3: severe
  severity: "low" | "moderate" | "high" | "critical";
  rank: number;
  relevantCompanies: string[];
}

export interface SkillGapResponse {
  userId: string;
  targetCompanies: string[];
  gaps: GapItem[];
  computedAt: string;
}

export interface CompanyRequirement {
  id: string;
  companyName: string;
  topic: string;
  expectedLevel: ProficiencyLevel;
}
