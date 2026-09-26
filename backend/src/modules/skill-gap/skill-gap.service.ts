import { AppError } from "../../utils/AppError.js";
import * as profileRepo from "../profile/profile.repository.js";
import * as skillGapRepo from "./skill-gap.repository.js";
import {
  PROFICIENCY_SCALE,
  type GapItem,
  type GapResult,
  type ProficiencyLevel,
} from "./skill-gap.types.js";

// Map a percentage score (0–100) to a proficiency level
function scoreToProficiency(score: number): ProficiencyLevel {
  if (score >= 80) return "expert";
  if (score >= 60) return "advanced";
  if (score >= 40) return "intermediate";
  return "beginner";
}

export async function computeGap(userId: string): Promise<GapResult> {
  // 1. Fetch profile for target companies
  const profile = await profileRepo.findByUserId(userId);
  if (!profile) {
    throw new AppError("PROFILE_NOT_FOUND", 404, "Profile not found — complete your profile first");
  }

  const targetCompanies: string[] = profile.target_companies ?? [];
  if (targetCompanies.length === 0) {
    throw new AppError(
      "NO_TARGET_COMPANIES",
      400,
      "No target companies set in your profile"
    );
  }

  // 2. Fetch what those companies require
  const requirements = await skillGapRepo.findCompanyRequirements(targetCompanies);
  if (requirements.length === 0) {
    throw new AppError(
      "NO_REQUIREMENTS_FOUND",
      404,
      "No requirements found for the specified companies"
    );
  }

  // 3. Fetch user's latest assessment proficiency per topic (score 0–100)
  const topicScores = await skillGapRepo.findLatestTopicScoresByUser(userId);

  // 4. Build the highest required level per topic across all target companies
  const topicRequirements: Record<string, ProficiencyLevel> = {};
  for (const req of requirements) {
    const existing = topicRequirements[req.topic];
    if (
      !existing ||
      PROFICIENCY_SCALE[req.expectedLevel] > PROFICIENCY_SCALE[existing]
    ) {
      topicRequirements[req.topic] = req.expectedLevel;
    }
  }

  // 5. Compute gap per topic
  const gaps: GapItem[] = [];

  for (const [topic, required] of Object.entries(topicRequirements)) {
    const requiredScore = PROFICIENCY_SCALE[required];
    const rawScore = topicScores[topic] ?? 0;
    const currentProficiency = Object.keys(topicScores).includes(topic)
      ? scoreToProficiency(rawScore)
      : ("none" as const);
    const currentScore =
      currentProficiency === "none" ? 0 : PROFICIENCY_SCALE[currentProficiency];
    const severity = requiredScore - currentScore;

    gaps.push({
      topic,
      required,
      requiredScore,
      current: currentProficiency,
      currentScore,
      severity,
      rank: 0, // set after sorting
    });
  }

  // 6. Rank by severity descending
  gaps.sort((a, b) => b.severity - a.severity);
  gaps.forEach((gap, idx) => {
    gap.rank = idx + 1;
  });

  return {
    gaps,
    targetCompanies,
    computedAt: new Date(),
  };
}
