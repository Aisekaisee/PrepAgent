import { z } from "zod";
import { getLLM } from "../llm/index.js";
import { buildRoadmapGenerationPrompt } from "../prompts/roadmap.prompts.js";
import type { RoadmapGraphState, RoadmapDraft } from "../graphs/roadmap.state.js";
import { logger } from "../../utils/logger.js";

const MAX_RETRIES = 1;
const LLM_TIMEOUT_MS = 60_000;

const StudyMaterialSchema = z.object({
  title: z.string().min(1),
  url: z.string().min(1),
  platform: z.string().min(1),
  type: z.string().optional(),
});

const PracticeProblemSchema = z.object({
  title: z.string().min(1),
  url: z.string().min(1),
  platform: z.string().min(1),
  difficulty: z.string().optional(),
});

const RoadmapDraftSchema = z.object({
  weeks: z.array(
    z.object({
      weekNo: z.number().int().min(1),
      topic: z.string().min(1),
      goals: z.array(z.string()).min(1).max(6),
      resourceHints: z.array(z.string()).min(1).max(5),
      studyMaterial: z.array(StudyMaterialSchema).optional().default([]),
      practiceProblems: z.array(PracticeProblemSchema).optional().default([]),
    })
  ).min(1),
});

/**
 * Deduplicates study materials and practice problems across all weeks so no link
 * is repeated anywhere in the roadmap. Filters out any search query URLs.
 * Strictly adheres to rule: NO HARDCODED RESOURCES IN SOURCE CODE.
 */
function cleanUrl(rawUrl: string): string {
  let url = rawUrl.trim();
  url = url.replace(/geeksforgeeks\.\d+org/gi, "geeksforgeeks.org");
  return url;
}

function deduplicateAndSanitizeRoadmap(draft: RoadmapDraft): RoadmapDraft {
  const seenStudyUrls = new Set<string>();
  const seenProblemUrls = new Set<string>();

  const cleanedWeeks = draft.weeks.map((week) => {
    const uniqueStudy = (week.studyMaterial || [])
      .map((item) => ({ ...item, url: cleanUrl(item.url) }))
      .filter((item) => {
        if (!item.url || !item.url.startsWith("http")) return false;
        const normalized = item.url.toLowerCase().replace(/\/$/, "");
        if (seenStudyUrls.has(normalized)) return false;
        seenStudyUrls.add(normalized);
        return true;
      });

    const uniqueProblems = (week.practiceProblems || [])
      .map((prob) => ({ ...prob, url: cleanUrl(prob.url) }))
      .filter((prob) => {
        if (!prob.url || !prob.url.startsWith("http")) return false;
        if (prob.url.includes("/problemset/all/?search=")) return false;
        const normalized = prob.url.toLowerCase().replace(/\/$/, "");
        if (seenProblemUrls.has(normalized)) return false;
        seenProblemUrls.add(normalized);
        return true;
      });

    return {
      ...week,
      studyMaterial: uniqueStudy,
      practiceProblems: uniqueProblems,
    };
  });

  return { weeks: cleanedWeeks };
}

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

  return deduplicateAndSanitizeRoadmap(result as RoadmapDraft);
}

/**
 * Calls the LLM to generate a week-by-week roadmap draft tailored to
 * the student's preparation time, target companies, and subjects.
 * Includes curated web study materials and practice problem links for each week.
 */
export async function roadmapGenerationNode(
  state: RoadmapGraphState
): Promise<Partial<RoadmapGraphState>> {
  const gapList = state.gapList ?? [];
  const prompt = buildRoadmapGenerationPrompt({
    timelineWeeks: state.timelineWeeks,
    targetCompanies: state.targetCompanies,
    technicalSubjects: state.technicalSubjects,
    programmingSkills: state.programmingSkills,
    education: state.education,
    gapList,
  });

  let lastError: string | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      logger.info({ attempt, timelineWeeks: state.timelineWeeks }, "Initiating LLM roadmap generation");
      const roadmapDraft = await generateWithTimeout(prompt);
      logger.info({ attempt, weeks: roadmapDraft.weeks.length }, "Roadmap draft generated successfully with resources");
      return {
        roadmapDraft,
        retryCount: attempt,
      };
    } catch (err: any) {
      lastError = err?.message ?? "UNKNOWN_ERROR";
      logger.warn({ attempt, error: lastError }, "Roadmap generation attempt failed, retrying...");
    }
  }

  // Graceful degradation without any hardcoded resources
  logger.error({ userId: state.userId, error: lastError }, "Roadmap generation failed after all retries");

  const topicsPool = [
    ...gapList.map((g) => g.topic),
    ...(state.technicalSubjects ?? []),
    ...(state.programmingSkills?.map((s) => `${s} Problem Solving & Algorithms`) ?? []),
    "System Design & Architecture",
    "Company Mock Interviews & Behavioral Prep",
  ];
  const uniqueTopics = Array.from(new Set(topicsPool)).filter(Boolean);
  const targetCompStr = state.targetCompanies?.length > 0 ? state.targetCompanies.join(", ") : "Tech";

  const fallbackDraft: RoadmapDraft = {
    weeks: Array.from({ length: state.timelineWeeks }, (_, idx) => {
      const topic = uniqueTopics[idx % uniqueTopics.length] || `Interview Preparation Pillar ${idx + 1}`;
      return {
        weekNo: idx + 1,
        topic: `${topic}`,
        goals: [
          `Master fundamental and advanced patterns of ${topic}`,
          `Solve standard problems targeting ${targetCompStr} interview standards`,
          `Perform time-boxed mock coding and test edge cases thoroughly`,
        ],
        resourceHints: [
          `${topic} Interview Patterns`,
          `${targetCompStr} Core Requirements`,
        ],
        studyMaterial: [],
        practiceProblems: [],
      };
    }),
  };

  return {
    roadmapDraft: fallbackDraft,
    retryCount: MAX_RETRIES,
    errors: [...state.errors, `LLM generation failed: ${lastError}`],
  };
}
