import * as profileRepo from "../../modules/profile/profile.repository.js";
import * as skillGapRepo from "../../modules/skill-gap/skill-gap.repository.js";
import {
  PROFICIENCY_SCALE,
  type GapItem,
  type ProficiencyLevel,
} from "../../modules/skill-gap/skill-gap.types.js";
import type { RoadmapGraphState } from "../graphs/roadmap.state.js";

function scoreToLevel(score: number): ProficiencyLevel {
  if (score >= 4) return "expert";
  if (score >= 3) return "advanced";
  if (score >= 2) return "intermediate";
  return "beginner";
}

/**
 * Computes the ranked gap list from assessedProfile vs. company requirements.
 */
export async function skillGapNode(
  state: RoadmapGraphState
): Promise<Partial<RoadmapGraphState>> {
  const profile = await profileRepo.findByUserId(state.userId);
  const targetCompanies: string[] = profile?.target_companies ?? [];

  const requirements = await skillGapRepo.findCompanyRequirements(targetCompanies);
  const assessedProfile = state.assessedProfile ?? {};

  // Take highest required level per topic across all target companies
  const topicRequirements: Record<string, ProficiencyLevel> = {};
  for (const req of requirements) {
    const existing = topicRequirements[req.topic];
    if (!existing || PROFICIENCY_SCALE[req.expectedLevel] > PROFICIENCY_SCALE[existing]) {
      topicRequirements[req.topic] = req.expectedLevel;
    }
  }

  const gaps: GapItem[] = [];

  for (const [topic, required] of Object.entries(topicRequirements)) {
    const key = topic.toLowerCase().replace(/\s+/g, "-");
    const requiredScore = PROFICIENCY_SCALE[required];
    const currentScore = assessedProfile[key] ?? 0;
    const current = currentScore > 0 ? scoreToLevel(currentScore) : ("none" as const);
    const severity = requiredScore - currentScore;

    gaps.push({
      topic,
      required,
      requiredScore,
      current,
      currentScore,
      severity,
      rank: 0,
    });
  }

  gaps.sort((a, b) => b.severity - a.severity);
  gaps.forEach((g, i) => { g.rank = i + 1; });

  return { gapList: gaps };
}
