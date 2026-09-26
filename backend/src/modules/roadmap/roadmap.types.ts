export interface RoadmapWeekItem {
  weekNo: number;
  topic: string;
  goals: string[];
  resourceHints: string[];
  resourceRefs: string[];
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
}

export type RoadmapItemStatus = RoadmapItem["status"];
