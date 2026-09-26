import * as skillGapRepo from "../../modules/skill-gap/skill-gap.repository.js";
import { PROFICIENCY_SCALE, type ProficiencyLevel } from "../../modules/skill-gap/skill-gap.types.js";
import type { RoadmapGraphState, SkillVector } from "../graphs/roadmap.state.js";

/**
 * Merges assessed proficiency scores from the latest assessment session
 * into the profile's skill vector. Assessed scores override profile baselines.
 */
export async function skillAssessmentNode(
  state: RoadmapGraphState
): Promise<Partial<RoadmapGraphState>> {
  const topicScores = await skillGapRepo.findLatestTopicScoresByUser(state.userId);

  const assessedProfile: SkillVector = { ...(state.skillProfile ?? {}) };

  // Convert percentage scores (0–100) to the 1–4 proficiency scale
  for (const [topic, score] of Object.entries(topicScores)) {
    const key = topic.toLowerCase().replace(/\s+/g, "-");
    let level: ProficiencyLevel;
    if (score >= 80) level = "expert";
    else if (score >= 60) level = "advanced";
    else if (score >= 40) level = "intermediate";
    else level = "beginner";

    // Assessed score always overrides profile baseline
    assessedProfile[key] = PROFICIENCY_SCALE[level];
  }

  return { assessedProfile };
}
