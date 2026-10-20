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
  requiredLevel: ProficiencyLevel;
  required: ProficiencyLevel;
  requiredScore: number;
  currentLevel: ProficiencyLevel;
  current: ProficiencyLevel;
  currentScore: number;
  gapScore: number;
  severity: "low" | "moderate" | "high" | "critical";
  rank: number;
  relevantCompanies: string[];
  isAssessed: boolean;
}

export interface SkillGapInsights {
  priority1?: {
    topic: string;
    currentLevel: string;
    requiredLevel: string;
    companies: string[];
    description: string;
  };
  priority2?: {
    topic: string;
    currentLevel: string;
    requiredLevel: string;
    companies: string[];
    description: string;
  };
  strongFoundation?: {
    topic: string;
    currentLevel: string;
    companies: string[];
    description: string;
  };
}

export interface GapResult {
  userId?: string;
  targetCompanies: string[];
  gaps: GapItem[];
  computedAt: Date;
  insights?: SkillGapInsights;
}

export type TopicProficiencyMap = Record<
  string,
  {
    accuracy: number;
    score: number;
    proficiency: ProficiencyLevel;
    assessmentsCount: number;
  }
>;
