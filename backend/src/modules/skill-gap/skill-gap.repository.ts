import { db } from "../../db/client.js";
import type { CompanyRequirement, TopicProficiencyMap } from "./skill-gap.types.js";

export async function findCompanyRequirements(
  companyNames: string[]
): Promise<CompanyRequirement[]> {
  if (companyNames.length === 0) return [];

  const result = await db.query(
    `
    SELECT
      cr.company_id,
      c.name AS company_name,
      cr.topic,
      cr.expected_level
    FROM company_requirements cr
    JOIN companies c ON c.id = cr.company_id
    WHERE c.name = ANY($1::text[])
    ORDER BY c.name, cr.topic
    `,
    [companyNames]
  );

  return result.rows.map((row) => ({
    companyId: row.company_id,
    companyName: row.company_name,
    topic: row.topic,
    expectedLevel: row.expected_level,
  }));
}

export async function findLatestTopicScoresByUser(
  userId: string
): Promise<TopicProficiencyMap> {
  // Fetch the most recently submitted session and its topic breakdown
  const result = await db.query(
    `
    SELECT topic_breakdown
    FROM assessment_sessions
    WHERE user_id = $1
      AND status = 'submitted'
      AND topic_breakdown IS NOT NULL
    ORDER BY submitted_at DESC
    LIMIT 1
    `,
    [userId]
  );

  if (result.rows.length === 0) return {};

  const breakdown: Record<string, { total: number; correct: number }> =
    result.rows[0].topic_breakdown;

  const proficiencyMap: TopicProficiencyMap = {};

  for (const [topic, stats] of Object.entries(breakdown)) {
    proficiencyMap[topic] = stats.total > 0
      ? (stats.correct / stats.total) * 100
      : 0;
  }

  return proficiencyMap;
}
