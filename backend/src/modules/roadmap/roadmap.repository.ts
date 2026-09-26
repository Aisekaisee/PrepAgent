import { db } from "../../db/client.js";
import type { Roadmap, RoadmapItem, RoadmapItemStatus } from "./roadmap.types.js";

function mapRoadmapRow(row: any): Roadmap {
  return {
    id: row.id,
    userId: row.user_id,
    version: row.version,
    generatedAt: new Date(row.generated_at),
    status: row.status,
    source: row.source,
    weeks: typeof row.weeks === "string" ? JSON.parse(row.weeks) : row.weeks,
  };
}

function mapItemRow(row: any): RoadmapItem {
  return {
    id: row.id,
    roadmapId: row.roadmap_id,
    weekNo: row.week_no,
    topic: row.topic,
    goals: row.goals ?? [],
    resourceRefs: row.resource_refs ?? [],
    status: row.status,
    updatedAt: new Date(row.updated_at),
  };
}

export async function findActiveRoadmap(userId: string): Promise<Roadmap | null> {
  const result = await db.query(
    `SELECT * FROM roadmaps WHERE user_id = $1 AND status = 'active' LIMIT 1`,
    [userId]
  );
  return result.rows.length > 0 ? mapRoadmapRow(result.rows[0]) : null;
}

export async function findRoadmapWithItems(
  roadmapId: string
): Promise<{ roadmap: Roadmap; items: RoadmapItem[] } | null> {
  const roadmapResult = await db.query(
    `SELECT * FROM roadmaps WHERE id = $1 LIMIT 1`,
    [roadmapId]
  );
  if (roadmapResult.rows.length === 0) return null;

  const itemsResult = await db.query(
    `SELECT * FROM roadmap_items WHERE roadmap_id = $1 ORDER BY week_no ASC`,
    [roadmapId]
  );

  return {
    roadmap: mapRoadmapRow(roadmapResult.rows[0]),
    items: itemsResult.rows.map(mapItemRow),
  };
}

export async function findRoadmapHistory(
  userId: string,
  page: number,
  limit: number
): Promise<Roadmap[]> {
  const offset = (page - 1) * limit;
  const result = await db.query(
    `SELECT * FROM roadmaps WHERE user_id = $1
     ORDER BY version DESC LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return result.rows.map(mapRoadmapRow);
}

export async function findRoadmapItemById(itemId: string): Promise<RoadmapItem | null> {
  const result = await db.query(
    `SELECT ri.*, r.user_id FROM roadmap_items ri
     JOIN roadmaps r ON r.id = ri.roadmap_id
     WHERE ri.id = $1 LIMIT 1`,
    [itemId]
  );
  return result.rows.length > 0 ? mapItemRow(result.rows[0]) : null;
}

export async function findItemOwnerUserId(itemId: string): Promise<string | null> {
  const result = await db.query(
    `SELECT r.user_id FROM roadmap_items ri
     JOIN roadmaps r ON r.id = ri.roadmap_id
     WHERE ri.id = $1 LIMIT 1`,
    [itemId]
  );
  return result.rows[0]?.user_id ?? null;
}

export async function updateItemStatus(
  itemId: string,
  status: RoadmapItemStatus
): Promise<RoadmapItem> {
  const result = await db.query(
    `UPDATE roadmap_items SET status = $1, updated_at = now()
     WHERE id = $2 RETURNING *`,
    [status, itemId]
  );
  return mapItemRow(result.rows[0]);
}
