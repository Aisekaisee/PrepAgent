/**
 * Resource ingestion script.
 * Usage: npx tsx src/scripts/ingestResources.ts --file=resources.json
 *
 * JSON format:
 * [
 *   {
 *     "type": "article" | "problem" | "question",
 *     "topic": "data-structures",
 *     "difficulty": "easy" | "medium" | "hard",
 *     "companyTags": ["Google", "Amazon"],
 *     "title": "Introduction to Arrays",
 *     "url": "https://...",
 *     "content": "Full text content to embed..."
 *   }
 * ]
 */
import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "../db/client.js";
import { getResourcesCollection } from "../vector/chromaClient.js";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

const fileArg = process.argv.find((a) => a.startsWith("--file="));
if (!fileArg) {
  console.error("Usage: npx tsx src/scripts/ingestResources.ts --file=resources.json");
  process.exit(1);
}

const filePath = path.resolve(process.cwd(), fileArg.replace("--file=", ""));
const resources: any[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));

async function embedText(text: string): Promise<number[]> {
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

async function ingest() {
  logger.info({ count: resources.length }, "Starting resource ingestion");

  const collection = await getResourcesCollection();
  let ingested = 0;
  let skipped = 0;

  for (const resource of resources) {
    try {
      const contentToEmbed = `${resource.title}\n${resource.topic}\n${resource.content ?? ""}`.trim();
      const embedding = await embedText(contentToEmbed);

      // Upsert into PostgreSQL
      const result = await db.query(
        `INSERT INTO resources (type, topic, difficulty, company_tags, title, url, content)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [
          resource.type,
          resource.topic,
          resource.difficulty,
          resource.companyTags ?? [],
          resource.title,
          resource.url ?? null,
          resource.content ?? null,
        ]
      );

      if (result.rows.length === 0) {
        skipped++;
        continue;
      }

      const resourceId: string = result.rows[0].id;

      // Upsert into ChromaDB
      await collection.upsert({
        ids: [resourceId],
        embeddings: [embedding],
        documents: [contentToEmbed],
        metadatas: [
          {
            topic: resource.topic,
            difficulty: resource.difficulty,
            company_tags: (resource.companyTags ?? []).join(","),
            resource_id: resourceId,
          },
        ],
      });

      // Store ChromaDB ID reference back in Postgres
      await db.query(
        `UPDATE resources SET embedding_id = $1 WHERE id = $2`,
        [resourceId, resourceId]
      );

      ingested++;
      logger.info({ resourceId, title: resource.title }, "Ingested resource");
    } catch (err) {
      logger.error({ err, title: resource.title }, "Failed to ingest resource — skipping");
      skipped++;
    }
  }

  logger.info({ ingested, skipped }, "Ingestion complete");
  process.exit(0);
}

ingest().catch((err) => {
  logger.error({ err }, "Fatal error during ingestion");
  process.exit(1);
});
