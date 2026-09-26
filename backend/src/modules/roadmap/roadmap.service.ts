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
): Promise<Roadmap> {
  // Fetch timeline from profile
  const profile = await profileRepo.findByUserId(userId);
  if (!profile) {
    throw new AppError("PROFILE_NOT_FOUND", 404, "Complete your profile before generating a roadmap");
  }
  const timelineWeeks: number = profile.timeline_weeks ?? 12;

  const initialState = createInitialState(userId, timelineWeeks);

  onProgress({ type: "progress", node: "profileNode", message: "Analyzing your profile..." });

  // Invoke the graph (non-streaming — collect final state)
  const finalState = await roadmapGraph.invoke(initialState as any) as any;

  // Emit progress events for each node that ran (state keys set)
  const nodeMessages: Record<string, string> = {
    skillProfile: "Profile analyzed ✓",
    assessedProfile: "Assessment data merged ✓",
    gapList: "Skill gaps computed ✓",
    roadmapDraft: "Roadmap structure generated ✓",
    roadmap: "Resources matched ✓",
  };
  for (const [key, message] of Object.entries(nodeMessages)) {
    if (finalState[key] !== null && finalState[key] !== undefined) {
      onProgress({ type: "progress", node: key, message });
    }
  }

  if (!finalState?.roadmap?.roadmapId) {
    throw new AppError("ROADMAP_GENERATION_FAILED", 500, "Roadmap generation did not complete successfully");
  }

  onProgress({ type: "progress", node: "persistAndReturnNode", message: "Roadmap saved ✓" });

  const result = await roadmapRepo.findRoadmapWithItems(finalState.roadmap.roadmapId);
  if (!result) {
    throw new AppError("ROADMAP_NOT_FOUND", 404, "Generated roadmap could not be retrieved");
  }

  logger.info({ userId, roadmapId: finalState.roadmap.roadmapId }, "Roadmap generation complete");

  return result.roadmap;
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
