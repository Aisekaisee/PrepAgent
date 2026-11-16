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
    ? `${education.degree}${education.institution ? ` at ${education.institution}` : ""}${education.year ? ` (Class of ${education.year})` : ""
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
2. Unique & Detailed Weekly Milestones:
   - EVERY week MUST have a unique, distinct, and detailed milestone topic (e.g., Week 1: "Arrays, Prefix Sums & Two Pointers", Week 2: "Sliding Window & Substring Invariants", Week 3: "Fast/Slow Pointers & Linked List Reversals", etc.). DO NOT repeat or duplicate topics across weeks.
   - Sequence topics progressively: Core Data Structures -> Advanced Patterns -> Trees & Graphs -> Dynamic Programming -> Low-Level & High-Level System Design -> Concurrency, OS & DBMS -> Company Mock Interviews.
3. Target Company Specialization: Tailor problem difficulty, system design expectations, and interview patterns directly to the hiring standards of ${companiesStr}.
4. Comprehensive Subject Coverage: Methodically distribute the student's selected technical subjects (${subjectsStr}) and programming languages (${languagesStr}) across the ${timelineWeeks} weeks.
5. NO REPEATED RESOURCES (Global Uniqueness Across All Weeks):
   - Every study material URL and title MUST BE 100% UNIQUE across the entire roadmap. Once a resource or article is recommended in one week, it MUST NOT appear in any other week.
   - Every practice problem URL and title MUST BE 100% UNIQUE across the entire roadmap. Once a problem is recommended in one week, it MUST NOT appear in any other week.
6. ALL URLS MUST BE REAL, WORKING, AND CANONICAL:
   - Practice Problems MUST be real, working canonical problem URLs on LeetCode with the exact kebab-case problem slug (e.g. "https://leetcode.com/problems/two-sum/", "https://leetcode.com/problems/course-schedule/", "https://leetcode.com/problems/lru-cache/", "https://leetcode.com/problems/trapping-rain-water/").
   - NEVER output search query URLs (e.g. NEVER output URLs containing "/problemset/all/?search=" or similar search queries).
   - NEVER output fake, broken, or non-existent slugs.
   - Study Materials MUST link directly to specific, genuine, working tutorials, articles, or documentation (e.g. real GeeksforGeeks articles, MDN guides, NeetCode topic pages). DO NOT repeatedly paste generic homepages (like "https://neetcode.io/practice" or "https://github.com/donnemartin/system-design-primer") for multiple weeks.
7. Structure for Each Week:
   - "weekNo": Sequential integer from 1 to ${timelineWeeks}.
   - "topic": Specific, descriptive milestone title specifying the core concept and company focus.
   - "goals": 3 to 5 clear, highly actionable and detailed goals detailing patterns, edge cases, target company standards, and complexity objectives.
   - "resourceHints": 2 to 4 high-quality resource keywords or best practice tips unique to this week.
   - "studyMaterial": 2 to 4 unique, real-world web study materials/articles with:
     * "title": Specific title of the article or guide
     * "url": Working direct web link
     * "platform": Platform name (e.g. "GeeksforGeeks", "NeetCode", "MDN", "GitHub", "Official Docs")
     * "type": Resource type (e.g. "Article", "Tutorial", "Guide", "Documentation")
   - "practiceProblems": 2 to 4 curated, distinct practice problems with:
     * "title": Exact problem name (e.g. "Longest Substring Without Repeating Characters", "Course Schedule II")
     * "url": Exact canonical URL ("https://leetcode.com/problems/<slug>/")
     * "platform": Platform name (e.g. "LeetCode")
     * "difficulty": Difficulty level ("Easy", "Medium", or "Hard")

Output ONLY valid JSON adhering strictly to the schema. No markdown formatting, no conversational text.`;
}
