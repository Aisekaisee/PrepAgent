import { db } from "../../db/client.js";
import type { Resource, ResourceFilters } from "./resources.types.js";

function mapRow(row: any): Resource {
  return {
    id: row.id,
    type: row.type,
    topic: row.topic,
    difficulty: row.difficulty,
    companyTags: row.company_tags ?? [],
    title: row.title,
    url: row.url ?? null,
    content: row.content ?? null,
    embeddingId: row.embedding_id ?? null,
    createdAt: new Date(row.created_at),
  };
}

export async function findResources(filters: ResourceFilters): Promise<{ data: Resource[]; total: number }> {
  const { topic, difficulty, companyTag, page, limit } = filters;
  const offset = (page - 1) * limit;

  const params: unknown[] = [];
  const conditions: string[] = [];

  if (topic) {
    params.push(topic);
    conditions.push(`topic = $${params.length}`);
  }
  if (difficulty) {
    params.push(difficulty);
    conditions.push(`difficulty = $${params.length}`);
  }
  if (companyTag) {
    params.push(companyTag);
    conditions.push(`$${params.length} = ANY(company_tags)`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countResult = await db.query(
    `SELECT COUNT(*) FROM resources ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  params.push(limit, offset);
  const dataResult = await db.query(
    `SELECT * FROM resources ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  return { data: dataResult.rows.map(mapRow), total };
}

export async function findResourcesByIds(ids: string[]): Promise<Resource[]> {
  if (ids.length === 0) return [];
  const result = await db.query(
    `SELECT * FROM resources WHERE id = ANY($1::uuid[])`,
    [ids]
  );
  return result.rows.map(mapRow);
}
