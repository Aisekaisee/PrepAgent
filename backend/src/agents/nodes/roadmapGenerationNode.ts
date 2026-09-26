import { z } from "zod";
import { getLLM } from "../llm/index.js";
import { buildRoadmapGenerationPrompt } from "../prompts/roadmap.prompts.js";
import type { RoadmapGraphState, RoadmapDraft } from "../graphs/roadmap.state.js";
import { logger } from "../../utils/logger.js";

const MAX_RETRIES = 2;
const LLM_TIMEOUT_MS = 15_000;

const RoadmapDraftSchema = z.object({
  weeks: z.array(
    z.object({
      weekNo: z.number().int().positive(),
      topic: z.string().min(1),
      goals: z.array(z.string()).min(1).max(6),
      resourceHints: z.array(z.string()).min(1).max(4),
    })
  ).min(1),
});

async function generateWithTimeout(
  prompt: string
): Promise<RoadmapDraft> {
  const llm = getLLM();

  const result = await Promise.race([
    llm.generate(prompt, RoadmapDraftSchema),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("LLM_TIMEOUT")), LLM_TIMEOUT_MS)
    ),
  ]);

  return result as RoadmapDraft;
}

/**
 * Calls the LLM to generate a week-by-week roadmap draft.
 * Retries up to MAX_RETRIES times on schema validation failure.
 * On persistent failure, sets an error flag and returns a minimal fallback roadmap.
 */
export async function roadmapGenerationNode(
  state: RoadmapGraphState
): Promise<Partial<RoadmapGraphState>> {
  const gapList = state.gapList ?? [];
  const prompt = buildRoadmapGenerationPrompt(gapList, state.timelineWeeks);

  let lastError: string | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const roadmapDraft = await generateWithTimeout(prompt);
      logger.info({ attempt, weeks: roadmapDraft.weeks.length }, "Roadmap draft generated");
      return {
        roadmapDraft,
        retryCount: attempt,
      };
    } catch (err: any) {
      lastError = err?.message ?? "UNKNOWN_ERROR";
      logger.warn({ attempt, error: lastError }, "Roadmap generation attempt failed, retrying...");
    }
  }

  // Graceful degradation — return a minimal fallback instead of crashing
  logger.error({ userId: state.userId, error: lastError }, "Roadmap generation failed after all retries");

  const fallbackDraft: RoadmapDraft = {
    weeks: gapList.slice(0, state.timelineWeeks).map((gap, idx) => ({
      weekNo: idx + 1,
      topic: gap.topic,
      goals: [`Study ${gap.topic} fundamentals`, `Practice ${gap.topic} problems`],
      resourceHints: [`${gap.topic} tutorial`, `LeetCode ${gap.topic}`],
    })),
  };

  return {
    roadmapDraft: fallbackDraft,
    retryCount: MAX_RETRIES,
    errors: [...state.errors, `LLM generation failed: ${lastError}`],
  };
}
