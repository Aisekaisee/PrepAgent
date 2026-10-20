import { db } from "../../db/client.js";
import type { CompanyRequirement } from "./skill-gap.types.js";

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

export interface AssessedSessionRow {
  topic: string | null;
  score: number | null;
  topicBreakdown: Record<string, { total: number; correct: number; accuracy?: number; proficiency?: string }> | null;
  submittedAt: Date;
}

export async function findAllAssessedSessionsByUser(
  userId: string
): Promise<AssessedSessionRow[]> {
  const result = await db.query(
    `
    SELECT topic, score, topic_breakdown, submitted_at
    FROM assessment_sessions
    WHERE user_id = $1
      AND status = 'submitted'
    ORDER BY submitted_at DESC
    `,
    [userId]
  );

  return result.rows.map((row) => ({
    topic: row.topic,
    score: row.score !== null ? Number(row.score) : null,
    topicBreakdown:
      typeof row.topic_breakdown === "string"
        ? JSON.parse(row.topic_breakdown)
        : (row.topic_breakdown ?? null),
    submittedAt: new Date(row.submitted_at),
  }));
}

export async function findLatestTopicScoresByUser(
  userId: string
): Promise<Record<string, number>> {
  const sessions = await findAllAssessedSessionsByUser(userId);
  const map: Record<string, number> = {};

  for (const sess of sessions) {
    if (sess.topicBreakdown) {
      for (const [top, stats] of Object.entries(sess.topicBreakdown)) {
        if (map[top] === undefined && stats.total > 0) {
          map[top] = ((stats.correct || 0) / stats.total) * 100;
        }
      }
    }
  }

  return map;
}
