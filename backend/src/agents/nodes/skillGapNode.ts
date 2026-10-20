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
 * Computes the ranked gap list from assessedProfile vs. company requirements
 * combined with the student's selected technical subjects and programming skills.
 */
export async function skillGapNode(
  state: RoadmapGraphState
): Promise<Partial<RoadmapGraphState>> {
  const profile = await profileRepo.findByUserId(state.userId);
  const targetCompanies: string[] = profile?.target_companies ?? state.targetCompanies ?? [];
  const technicalSubjects: string[] = profile?.technical_subjects ?? state.technicalSubjects ?? [];
  const programmingSkills: string[] = profile?.programming_skills ?? state.programmingSkills ?? [];

  const requirements = await skillGapRepo.findCompanyRequirements(targetCompanies);
  const assessedProfile = state.assessedProfile ?? state.skillProfile ?? {};

  // Take highest required level per topic across all target companies
  const topicRequirements: Record<string, ProficiencyLevel> = {};
  for (const req of requirements) {
    const existing = topicRequirements[req.topic];
    if (!existing || PROFICIENCY_SCALE[req.expectedLevel] > PROFICIENCY_SCALE[existing]) {
      topicRequirements[req.topic] = req.expectedLevel;
    }
  }

  // Ensure student's selected technical subjects are represented in topic requirements
  for (const subject of technicalSubjects) {
    if (!topicRequirements[subject]) {
      topicRequirements[subject] = "advanced";
    }
  }

  // Ensure student's programming skills are represented
  for (const skill of programmingSkills) {
    if (!topicRequirements[skill]) {
      topicRequirements[skill] = "intermediate";
    }
  }

  const gaps: GapItem[] = [];

  for (const [topic, required] of Object.entries(topicRequirements)) {
    const key = topic.toLowerCase().replace(/\s+/g, "-");
    const requiredScore = PROFICIENCY_SCALE[required];
    const currentScore = assessedProfile[key] ?? 0;
    const current = currentScore > 0 ? scoreToLevel(currentScore) : "beginner";
    const gapScore = Math.max(0, requiredScore - currentScore);
    const severity: "low" | "moderate" | "high" | "critical" =
      gapScore >= 3 ? "critical" : gapScore === 2 ? "high" : gapScore === 1 ? "moderate" : "low";

    gaps.push({
      topic,
      requiredLevel: required,
      required,
      requiredScore,
      currentLevel: current,
      current,
      currentScore,
      gapScore,
      severity,
      rank: 0,
      relevantCompanies: targetCompanies.slice(0, 2),
      isAssessed: currentScore > 0,
    });
  }

  gaps.sort((a, b) => b.gapScore - a.gapScore);
  gaps.forEach((g, i) => {
    g.rank = i + 1;
  });

  return { gapList: gaps };
}
