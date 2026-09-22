import type { Resource } from "./resource";

export type RoadmapItemStatus = "pending" | "started" | "completed" | "skipped";
export type RoadmapStatus = "active" | "superseded";

export interface RoadmapItem {
  id: string;
  roadmapId: string;
  weekNo: number;
  topic: string;
  goals: string[];
  status: RoadmapItemStatus;
  resourceRefs?: string[];
  resources?: Resource[];
  updatedAt?: string;
}

export interface Roadmap {
  id: string;
  userId: string;
  version: number;
  generatedAt: string;
  status: RoadmapStatus;
  source: "ai_generated" | "custom";
  weeks: Array<{
    weekNo: number;
    topic: string;
    goals: string[];
    resourceHints?: string[];
  }>;
  items: RoadmapItem[];
}

export interface RoadmapProgressEvent {
  type: "progress" | "complete" | "error";
  node?: string;
  message: string;
  percentage: number;
  data?: Roadmap;
}
