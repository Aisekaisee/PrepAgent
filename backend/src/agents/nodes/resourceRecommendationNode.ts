import { getResourcesCollection } from "../../vector/chromaClient.js";
import { db } from "../../db/client.js";
import type { RoadmapGraphState } from "../graphs/roadmap.state.js";
import { logger } from "../../utils/logger.js";

const TOP_K = 3; // number of ChromaDB results per topic

/**
 * For each week in the roadmap draft, queries ChromaDB for the top-K
 * matching resources by topic and populates resourceRefs (PostgreSQL UUIDs).
 * Failures are logged and skipped — the roadmap is never blocked by missing resources.
 */
export async function resourceRecommendationNode(
  state: RoadmapGraphState
): Promise<Partial<RoadmapGraphState>> {
  const draft = state.roadmapDraft;
  if (!draft) return {};

  let collection: Awaited<ReturnType<typeof getResourcesCollection>> | null = null;
  try {
    collection = await getResourcesCollection();
  } catch (err) {
    logger.warn({ err }, "ChromaDB unavailable — skipping resource recommendations");
    return { roadmap: { ...state.roadmap!, weeks: draft.weeks } as any };
  }

  const enrichedWeeks = await Promise.all(
    draft.weeks.map(async (week) => {
      try {
        const queryResult = await collection!.query({
          queryTexts: [week.topic],
          nResults: TOP_K,
          where: { topic: week.topic },
        });

        // ChromaDB returns string IDs — look up matching PostgreSQL resource UUIDs
        const chromaIds: string[] = queryResult.ids?.[0] ?? [];
        const resourceRefs: string[] = [];

        if (chromaIds.length > 0) {
          const result = await db.query(
            `SELECT id FROM resources WHERE embedding_id = ANY($1::text[])`,
            [chromaIds]
          );
          resourceRefs.push(...result.rows.map((r: any) => r.id));
        }

        return { ...week, resourceRefs };
      } catch (err) {
        logger.warn({ topic: week.topic, err }, "Resource lookup failed for topic — skipping");
        return { ...week, resourceRefs: [] };
      }
    })
  );

  return {
    roadmap: {
      roadmapId: "", // filled by persistAndReturnNode
      userId: state.userId,
      version: 1,
      weeks: enrichedWeeks,
      generatedAt: new Date(),
    },
  };
}
