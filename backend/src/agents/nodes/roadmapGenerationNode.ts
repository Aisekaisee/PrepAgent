import { z } from "zod";
import { getLLM } from "../llm/index.js";
import { buildRoadmapGenerationPrompt } from "../prompts/roadmap.prompts.js";
import type { RoadmapGraphState, RoadmapDraft } from "../graphs/roadmap.state.js";
import { logger } from "../../utils/logger.js";

const MAX_RETRIES = 2;
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

  // Graceful degradation — return a dynamic profile-matched fallback instead of crashing
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
      const encodedTopic = encodeURIComponent(topic);
      return {
        weekNo: idx + 1,
        topic: `${topic}`,
        goals: [
          `Master fundamental and advanced patterns of ${topic}`,
          `Solve 10+ standard problems targeting ${targetCompStr} interview standards`,
          `Perform time-boxed mock coding and test edge cases thoroughly`,
        ],
        resourceHints: [
          `${topic} Interview Patterns`,
          `LeetCode Curated ${topic}`,
          `${targetCompStr} Question Archive`,
        ],
        studyMaterial: [
          {
            title: `${topic} In-Depth Tutorial & Guide`,
            url: `https://www.geeksforgeeks.org/${encodedTopic.toLowerCase()}/`,
            platform: "GeeksforGeeks",
            type: "Article",
          },
          {
            title: "NeetCode Roadmap & DSA Patterns",
            url: "https://neetcode.io/practice",
            platform: "NeetCode",
            type: "Curated Guide",
          },
          {
            title: "System Design & Architecture Primer",
            url: "https://github.com/donnemartin/system-design-primer",
            platform: "GitHub",
            type: "Documentation",
          },
        ],
        practiceProblems: [
          {
            title: `${topic} Core Problem Set`,
            url: `https://leetcode.com/problemset/all/?search=${encodedTopic}`,
            platform: "LeetCode",
            difficulty: "Medium",
          },
          {
            title: `${targetCompStr} Interview Tagged Questions`,
            url: `https://leetcode.com/problemset/all/?search=${encodeURIComponent(state.targetCompanies?.[0] || "google")}`,
            platform: "LeetCode",
            difficulty: "Hard",
          },
          {
            title: "HackerRank Data Structures & Algorithms",
            url: "https://www.hackerrank.com/domains/algorithms",
            platform: "HackerRank",
            difficulty: "Medium",
          },
        ],
      };
    }),
  };

  return {
    roadmapDraft: fallbackDraft,
    retryCount: MAX_RETRIES,
    errors: [...state.errors, `LLM generation failed: ${lastError}`],
  };
}
