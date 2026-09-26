import * as profileRepo from "../../modules/profile/profile.repository.js";
import { PROFICIENCY_SCALE } from "../../modules/skill-gap/skill-gap.types.js";
import type { RoadmapGraphState, SkillVector } from "../graphs/roadmap.state.js";
import { AppError } from "../../utils/AppError.js";

/**
 * Normalizes the raw profile into a typed SkillVector.
 * Programming skills → mapped to proficiency score 2 (intermediate) as baseline.
 * Technical subjects → mapped to score 1 (beginner) as baseline.
 */
export async function profileNode(
  state: RoadmapGraphState
): Promise<Partial<RoadmapGraphState>> {
  const profile = await profileRepo.findByUserId(state.userId);

  if (!profile) {
    throw new AppError("PROFILE_NOT_FOUND", 404, "Profile not found");
  }

  const skillProfile: SkillVector = {};

  // Programming skills treated as intermediate baseline
  for (const skill of profile.programming_skills ?? []) {
    const key = skill.toLowerCase().replace(/\s+/g, "-");
    skillProfile[key] = PROFICIENCY_SCALE["intermediate"];
  }

  // Technical subjects treated as beginner baseline
  for (const subject of profile.technical_subjects ?? []) {
    const key = subject.toLowerCase().replace(/\s+/g, "-");
    if (!skillProfile[key]) {
      skillProfile[key] = PROFICIENCY_SCALE["beginner"];
    }
  }

  return { skillProfile };
}
