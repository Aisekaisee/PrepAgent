import type { GapItem } from "../../modules/skill-gap/skill-gap.types.js";

export function buildRoadmapGenerationPrompt(
  gapList: GapItem[],
  timelineWeeks: number
): string {
  const topGaps = gapList.slice(0, 10); // Focus on top 10 gaps

  const gapSummary = topGaps
    .map(
      (g) =>
        `- Topic: "${g.topic}" | Required: ${g.required} | Current: ${g.current} | Severity: ${g.severity}/3`
    )
    .join("\n");

  return `You are an expert placement preparation coach. Generate a structured, week-by-week study roadmap for a student preparing for technical job interviews.

## Student's Skill Gaps (ranked by severity, highest first):
${gapSummary}

## Timeline:
The student has ${timelineWeeks} week(s) to prepare.

## Instructions:
- Distribute the topics across exactly ${timelineWeeks} week(s).
- Prioritize topics with higher severity scores (they need more time).
- Each week should have 1-2 focused topics.
- For each week, provide 3-5 clear, actionable learning goals.
- For each week, suggest 2-3 specific resource types or keywords to look for (e.g., "LeetCode medium arrays", "System Design Primer chapter 3").
- The roadmap should build progressively (fundamentals first, advanced later).
- Output ONLY valid JSON matching the exact schema provided. No markdown, no explanation.`;
}
