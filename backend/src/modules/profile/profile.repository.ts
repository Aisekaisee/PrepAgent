export interface ProfileData {
  education?: {
    degree: string;
    institution: string;
    year: number;
  };

  programmingSkills?: string[];

  technicalSubjects?: string[];

  targetCompanies?: string[];

  timelineWeeks?: number;
}

import { db } from "../../db/client.js";

export async function findByUserId(
  userId: string
) {
  const result = await db.query(
    `
    SELECT
      user_id,
      education,
      programming_skills,
      technical_subjects,
      target_companies,
      timeline_weeks,
      updated_at
    FROM profiles
    WHERE user_id = $1
    `,
    [userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}


export async function upsertProfile(
  userId: string,
  data: ProfileData
) {
  const result = await db.query(
    `
    INSERT INTO profiles (
      user_id,
      education,
      programming_skills,
      technical_subjects,
      target_companies,
      timeline_weeks
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
      education = EXCLUDED.education,
      programming_skills = EXCLUDED.programming_skills,
      technical_subjects = EXCLUDED.technical_subjects,
      target_companies = EXCLUDED.target_companies,
      timeline_weeks = EXCLUDED.timeline_weeks,
      updated_at = now()
    RETURNING *
    `,
    [
      userId,
      data.education ?? null,
      data.programmingSkills ?? [],
      data.technicalSubjects ?? [],
      data.targetCompanies ?? [],
      data.timelineWeeks ?? null
    ]
  );

  return result.rows[0];
}

export async function recordHistory(
  userId: string,
  snapshot: unknown
): Promise<void> {
  await db.query(
    `
    INSERT INTO profile_history (
      user_id,
      snapshot
    )
    VALUES ($1, $2)
    `,
    [
      userId,
      JSON.stringify(snapshot)
    ]
  );
}