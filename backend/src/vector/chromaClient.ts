import { ChromaClient, type Collection } from "chromadb";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

const RESOURCES_COLLECTION = "resources";

let client: ChromaClient | null = null;
let resourcesCollection: Collection | null = null;

export function getChromaClient(): ChromaClient {
  if (!client) {
    client = new ChromaClient({ path: env.CHROMA_HOST });
  }
  return client;
}

export async function getResourcesCollection(): Promise<Collection> {
  if (!resourcesCollection) {
    const chroma = getChromaClient();
    resourcesCollection = await chroma.getOrCreateCollection({
      name: RESOURCES_COLLECTION,
      metadata: { description: "PrepAgent learning resources" },
    });
    logger.info({ collection: RESOURCES_COLLECTION }, "ChromaDB collection ready");
  }
  return resourcesCollection;
}

export async function pingChroma(): Promise<boolean> {
  try {
    const chroma = getChromaClient();
    await chroma.heartbeat();
    return true;
  } catch (err) {
    logger.error({ err }, "ChromaDB health check failed");
    return false;
  }
}
