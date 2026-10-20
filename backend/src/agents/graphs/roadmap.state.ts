import type { GapItem } from "../../modules/skill-gap/skill-gap.types.js";

export type SkillVector = Record<string, number>; // topic -> proficiency score (1-4)

export interface StudyMaterial {
  title: string;
  url: string;
  platform: string;
  type?: string;
}

export interface PracticeProblem {
  title: string;
  url: string;
  platform: string;
  difficulty?: string;
}

export interface RoadmapWeek {
  weekNo: number;
  topic: string;
  goals: string[];
  resourceHints: string[];
  studyMaterial?: StudyMaterial[];
  practiceProblems?: PracticeProblem[];
  resourceRefs?: string[]; // populated by resourceRecommendationNode
}

export interface RoadmapDraft {
  weeks: RoadmapWeek[];
}

export interface FinalRoadmap {
  roadmapId: string;
  userId: string;
  version: number;
  weeks: RoadmapWeek[];
  generatedAt: Date;
}

export interface RoadmapGraphState {
  userId: string;
  timelineWeeks: number;
  targetCompanies: string[];
  technicalSubjects: string[];
  programmingSkills: string[];
  education?: {
    degree?: string;
    institution?: string;
    year?: number;
  };
  skillProfile: SkillVector | null;
  assessedProfile: SkillVector | null;
  gapList: GapItem[] | null;
  roadmapDraft: RoadmapDraft | null;
  roadmap: FinalRoadmap | null;
  errors: string[];
  retryCount: number;
}
