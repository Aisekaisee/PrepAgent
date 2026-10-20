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

export interface RoadmapWeekItem {
  weekNo: number;
  topic: string;
  goals: string[];
  resourceHints: string[];
  resourceRefs: string[];
  studyMaterial?: StudyMaterial[];
  practiceProblems?: PracticeProblem[];
}

export interface Roadmap {
  id: string;
  userId: string;
  version: number;
  generatedAt: Date;
  status: "active" | "superseded";
  source: string;
  weeks: RoadmapWeekItem[];
}

export interface RoadmapItem {
  id: string;
  roadmapId: string;
  weekNo: number;
  topic: string;
  goals: string[];
  resourceRefs: string[];
  status: "pending" | "started" | "completed" | "skipped";
  updatedAt: Date;
  studyMaterial?: StudyMaterial[];
  practiceProblems?: PracticeProblem[];
  resourceHints?: string[];
}

export type RoadmapItemStatus = RoadmapItem["status"];
