import { AppError } from "../../utils/AppError.js";
import { roadmapGraph, createInitialState } from "../../agents/graphs/roadmap.graph.js";
import * as roadmapRepo from "./roadmap.repository.js";
import type { Roadmap, RoadmapItem, RoadmapItemStatus } from "./roadmap.types.js";
import * as profileRepo from "../profile/profile.repository.js";
import { logger } from "../../utils/logger.js";

export type ProgressCallback = (event: object) => void;

export async function generateRoadmap(
  userId: string,
  onProgress: ProgressCallback
): Promise<Roadmap & { items: RoadmapItem[] }> {
  // Fetch timeline and details from profile
  let profile = await profileRepo.findByUserId(userId);
  if (!profile) {
    profile = await profileRepo.upsertProfile(userId, {
      timelineWeeks: 8,
      targetCompanies: ["Google", "Amazon", "Microsoft"],
      technicalSubjects: [
        "Data Structures & Algorithms",
        "System Design",
        "Operating Systems",
        "Database Management Systems",
      ],
      programmingSkills: ["C++", "Java", "Python"],
      education: {
        degree: "B.Tech Computer Science & Engineering",
        institution: "University",
        year: 2026,
      },
    });
  }

  const timelineWeeks: number = profile.timeline_weeks ?? 8;
  const targetCompanies: string[] = profile.target_companies ?? [];
  const technicalSubjects: string[] = profile.technical_subjects ?? [];
  const programmingSkills: string[] = profile.programming_skills ?? [];
  const education = profile.education;

  const initialState = createInitialState(userId, {
    timelineWeeks,
    targetCompanies,
    technicalSubjects,
    programmingSkills,
    education,
  });

  onProgress({
    type: "progress",
    node: "profileNode",
    message: `Analyzing profile: ${timelineWeeks}w prep, ${targetCompanies.length} companies, ${technicalSubjects.length} subjects...`,
    percentage: 15,
  });

  // Invoke the graph (non-streaming — collect final state)
  const finalState = await roadmapGraph.invoke(initialState as any) as any;

  // Emit progress events for each node that ran (state keys set)
  const nodeProgress: Record<string, { message: string; percentage: number }> = {
    skillProfile: { message: "Profile & company expectations normalized ✓", percentage: 30 },
    assessedProfile: { message: "Assessment data merged ✓", percentage: 45 },
    gapList: { message: "Target skill gaps computed ✓", percentage: 60 },
    roadmapDraft: { message: "Curriculum synthesized with Gemini AI ✓", percentage: 80 },
    roadmap: { message: "Curated resource hints matched ✓", percentage: 95 },
  };

  for (const [key, info] of Object.entries(nodeProgress)) {
    if (finalState[key] !== null && finalState[key] !== undefined) {
      onProgress({
        type: "progress",
        node: key,
        message: info.message,
        percentage: info.percentage,
      });
    }
  }

  if (!finalState?.roadmap?.roadmapId) {
    throw new AppError("ROADMAP_GENERATION_FAILED", 500, "Roadmap generation did not complete successfully");
  }

  onProgress({
    type: "progress",
    node: "persistAndReturnNode",
    message: "Personalized roadmap saved successfully ✓",
    percentage: 100,
  });

  const result = await roadmapRepo.findRoadmapWithItems(finalState.roadmap.roadmapId);
  if (!result) {
    throw new AppError("ROADMAP_NOT_FOUND", 404, "Generated roadmap could not be retrieved");
  }

  logger.info({ userId, roadmapId: finalState.roadmap.roadmapId }, "Roadmap generation complete");

  return {
    ...result.roadmap,
    items: result.items,
  };
}

export async function getActiveRoadmap(
  userId: string
): Promise<{ roadmap: Roadmap; items: RoadmapItem[] }> {
  const active = await roadmapRepo.findActiveRoadmap(userId);
  if (!active) {
    throw new AppError("NO_ACTIVE_ROADMAP", 404, "No active roadmap found — generate one first");
  }

  const result = await roadmapRepo.findRoadmapWithItems(active.id);
  if (!result) {
    throw new AppError("ROADMAP_NOT_FOUND", 404, "Roadmap data could not be loaded");
  }

  return result;
}

export async function getRoadmapHistory(
  userId: string,
  pagination: { page: number; limit: number }
): Promise<Roadmap[]> {
  const page = Math.max(1, pagination.page);
  const limit = Math.min(20, Math.max(1, pagination.limit));
  return roadmapRepo.findRoadmapHistory(userId, page, limit);
}

export async function updateItemStatus(
  userId: string,
  itemId: string,
  status: RoadmapItemStatus
): Promise<RoadmapItem> {
  const ownerUserId = await roadmapRepo.findItemOwnerUserId(itemId);

  if (!ownerUserId) {
    throw new AppError("ITEM_NOT_FOUND", 404, "Roadmap item not found");
  }

  if (ownerUserId !== userId) {
    throw new AppError("FORBIDDEN", 403, "You do not own this roadmap item");
  }

  return roadmapRepo.updateItemStatus(itemId, status);
}
