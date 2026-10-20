import * as profileRepo from "../../modules/profile/profile.repository.js";
import { PROFICIENCY_SCALE } from "../../modules/skill-gap/skill-gap.types.js";
import type { RoadmapGraphState, SkillVector } from "../graphs/roadmap.state.js";
import { AppError } from "../../utils/AppError.js";

/**
 * Normalizes the raw profile into a typed SkillVector.
 * Programming skills → mapped to proficiency score 2 (intermediate) as baseline.
 * Technical subjects → mapped to score 1 (beginner) as baseline.
 * Propagates student profile details: timelineWeeks, targetCompanies, technicalSubjects, programmingSkills, education.
 */
export async function profileNode(
  state: RoadmapGraphState
): Promise<Partial<RoadmapGraphState>> {
  const profile = await profileRepo.findByUserId(state.userId);

  if (!profile) {
    throw new AppError("PROFILE_NOT_FOUND", 404, "Profile not found");
  }

  const programmingSkills: string[] = profile.programming_skills ?? state.programmingSkills ?? [];
  const technicalSubjects: string[] = profile.technical_subjects ?? state.technicalSubjects ?? [];
  const targetCompanies: string[] = profile.target_companies ?? state.targetCompanies ?? [];
  const timelineWeeks: number = profile.timeline_weeks ?? state.timelineWeeks ?? 8;
  const education = profile.education ?? state.education;

  const skillProfile: SkillVector = {};

  // Programming skills treated as intermediate baseline
  for (const skill of programmingSkills) {
    const key = skill.toLowerCase().replace(/\s+/g, "-");
    skillProfile[key] = PROFICIENCY_SCALE["intermediate"];
  }

  // Technical subjects treated as beginner baseline
  for (const subject of technicalSubjects) {
    const key = subject.toLowerCase().replace(/\s+/g, "-");
    if (!skillProfile[key]) {
      skillProfile[key] = PROFICIENCY_SCALE["beginner"];
    }
  }

  return {
    skillProfile,
    timelineWeeks,
    targetCompanies,
    technicalSubjects,
    programmingSkills,
    education,
  };
}
