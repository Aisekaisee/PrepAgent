import { db } from "../../db/client.js";
import type { RoadmapGraphState } from "../graphs/roadmap.state.js";
import { logger } from "../../utils/logger.js";

/**
 * The ONLY node that writes to PostgreSQL.
 * 1. Supersedes any existing active roadmap for this user.
 * 2. Inserts the new roadmap + all items in a single transaction.
 * 3. Returns the finalized roadmap with its generated ID and version.
 */
export async function persistAndReturnNode(
  state: RoadmapGraphState
): Promise<Partial<RoadmapGraphState>> {
  const roadmap = state.roadmap;
  if (!roadmap) return {};

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // 1. Find latest version for this user
    const versionResult = await client.query(
      `SELECT COALESCE(MAX(version), 0) AS max_version
       FROM roadmaps WHERE user_id = $1`,
      [state.userId]
    );
    const nextVersion: number = (versionResult.rows[0].max_version as number) + 1;

    // 2. Mark all active roadmaps as superseded
    await client.query(
      `UPDATE roadmaps SET status = 'superseded'
       WHERE user_id = $1 AND status = 'active'`,
      [state.userId]
    );

    // 3. Insert new roadmap
    const roadmapResult = await client.query(
      `INSERT INTO roadmaps (user_id, version, status, source, weeks)
       VALUES ($1, $2, 'active', 'ai_generated', $3)
       RETURNING id, version, generated_at`,
      [state.userId, nextVersion, JSON.stringify(roadmap.weeks)]
    );

    const { id: roadmapId, version, generated_at } = roadmapResult.rows[0];

    // 4. Insert roadmap items
    for (const week of roadmap.weeks) {
      await client.query(
        `INSERT INTO roadmap_items
           (roadmap_id, week_no, topic, goals, resource_refs, status)
         VALUES ($1, $2, $3, $4, $5, 'pending')`,
        [
          roadmapId,
          week.weekNo,
          week.topic,
          week.goals,
          week.resourceRefs ?? [],
        ]
      );
    }

    await client.query("COMMIT");

    logger.info({ roadmapId, userId: state.userId, version }, "Roadmap persisted successfully");

    return {
      roadmap: {
        ...roadmap,
        roadmapId,
        version,
        generatedAt: new Date(generated_at),
      },
    };
  } catch (err) {
    await client.query("ROLLBACK");
    logger.error({ err, userId: state.userId }, "Failed to persist roadmap — rolled back");
    throw err;
  } finally {
    client.release();
  }
}
