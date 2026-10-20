import type { GapItem } from "../../modules/skill-gap/skill-gap.types.js";

export interface RoadmapPromptParams {
  timelineWeeks: number;
  targetCompanies?: string[];
  technicalSubjects?: string[];
  programmingSkills?: string[];
  education?: { degree?: string; institution?: string; year?: number };
  gapList?: GapItem[];
}

export function buildRoadmapGenerationPrompt(params: RoadmapPromptParams): string {
  const {
    timelineWeeks,
    targetCompanies = [],
    technicalSubjects = [],
    programmingSkills = [],
    education,
    gapList = [],
  } = params;

  const topGaps = gapList.slice(0, 15);

  const gapSummary =
    topGaps.length > 0
      ? topGaps
          .map(
            (g) =>
              `- Topic: "${g.topic}" | Required Level: ${g.required} | Current Level: ${g.current} | Severity Gap: ${g.severity}/3`
          )
          .join("\n")
      : "No prior assessment diagnostics. Tailor curriculum baseline to student target companies and core subjects.";

  const companiesStr =
    targetCompanies.length > 0
      ? targetCompanies.join(", ")
      : "Tier-1 Tech Companies (Product & Systems)";

  const subjectsStr =
    technicalSubjects.length > 0
      ? technicalSubjects.join(", ")
      : "Data Structures & Algorithms, System Design, Operating Systems, Database Management Systems";

  const languagesStr =
    programmingSkills.length > 0 ? programmingSkills.join(", ") : "C++, Java, Python";

  const educationStr = education?.degree
    ? `${education.degree}${education.institution ? ` at ${education.institution}` : ""}${
        education.year ? ` (Class of ${education.year})` : ""
      }`
    : "Computer Science / Engineering Student";

  return `You are an elite technical interview placement coach. Generate an individualized, highly structured, week-by-week study roadmap for a student preparing for technical hiring interviews.

## Student Profile & Placement Targets:
- Academic Background: ${educationStr}
- Total Preparation Horizon: Exactly ${timelineWeeks} Week(s)
- Target Companies: ${companiesStr}
- Core Technical Subjects: ${subjectsStr}
- Primary Programming Languages: ${languagesStr}

## Assessed Skill Gaps & Focus Priorities:
${gapSummary}

## Requirements:
1. Timeline: You MUST output exactly ${timelineWeeks} weeks (from weekNo: 1 to weekNo: ${timelineWeeks}).
2. Target Company Specialization: Tailor problem difficulty, system design expectations, and interview patterns directly to the hiring standards of ${companiesStr}.
3. Comprehensive Subject Coverage: Methodically distribute the student's selected technical subjects (${subjectsStr}) and programming languages (${languagesStr}) across the ${timelineWeeks} weeks.
4. Progressive Progression: Build from core foundations (data structures, core algorithms) to advanced company questions, system design, and final mock interview / behavioral rounds.
5. Structure for Each Week:
   - "weekNo": Sequential integer from 1 to ${timelineWeeks}.
   - "topic": Focused, descriptive milestone title specifying the core concept and company focus.
   - "goals": 3 to 5 clear, actionable goals (e.g. "Master Two Pointers and Sliding Window techniques on Arrays and Strings", "Solve 12 LeetCode Medium problems asked by ${targetCompanies[0] || "top companies"}").
   - "resourceHints": 2 to 4 high-quality resource keywords or best practice tips.
   - "studyMaterial": 2 to 4 real-world web study materials, articles, tutorials, or documentation matching this week's topic (e.g., from GeeksforGeeks, NeetCode, GitHub System Design Primer, MDN, Official Language/DB Docs).
     Each must include:
       * "title": Clear title of the article/guide
       * "url": Valid web link (e.g. "https://www.geeksforgeeks.org/...", "https://neetcode.io/practice", "https://github.com/donnemartin/system-design-primer", etc.)
       * "platform": Platform name (e.g. "GeeksforGeeks", "NeetCode", "GitHub", "Official Docs", "MIT OCW")
       * "type": Resource type (e.g. "Article", "Tutorial", "Guide", "Documentation", "Video")
   - "practiceProblems": 2 to 4 curated practice problems from popular coding platforms (e.g., LeetCode, HackerRank, Codeforces, GeeksforGeeks) directly aligned with this week's milestone and targeted companies.
     Each must include:
       * "title": Problem title (e.g. "Trapping Rain Water", "LRU Cache", "Course Schedule", "Subarray Sum Equals K")
       * "url": Valid platform URL (e.g. "https://leetcode.com/problems/lru-cache/", "https://leetcode.com/problems/trapping-rain-water/", etc.)
       * "platform": Platform name (e.g. "LeetCode", "HackerRank", "Codeforces", "GeeksforGeeks")
       * "difficulty": Difficulty level ("Easy", "Medium", or "Hard")

Output ONLY valid JSON adhering strictly to the schema. No markdown formatting, no conversational text.`;
}
