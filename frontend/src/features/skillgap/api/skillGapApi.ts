import { api } from "@/lib/axios";
import type { SkillGapResponse, GapItem } from "@/types/skillgap";

const MOCK_GAPS: GapItem[] = [
  {
    topic: "Dynamic Programming",
    requiredLevel: "expert",
    currentLevel: "beginner",
    gapScore: 3,
    severity: "critical",
    rank: 1,
    relevantCompanies: ["Google", "Uber", "Amazon"],
  },
  {
    topic: "System Design & Scalability",
    requiredLevel: "advanced",
    currentLevel: "intermediate",
    gapScore: 2,
    severity: "high",
    rank: 2,
    relevantCompanies: ["Uber", "Microsoft", "Meta"],
  },
  {
    topic: "Graph Algorithms & Shortest Path",
    requiredLevel: "advanced",
    currentLevel: "intermediate",
    gapScore: 1,
    severity: "moderate",
    rank: 3,
    relevantCompanies: ["Google", "Amazon"],
  },
  {
    topic: "Operating Systems & Concurrency",
    requiredLevel: "advanced",
    currentLevel: "intermediate",
    gapScore: 1,
    severity: "moderate",
    rank: 4,
    relevantCompanies: ["Microsoft", "Oracle"],
  },
  {
    topic: "Data Structures (Trees & Heaps)",
    requiredLevel: "expert",
    currentLevel: "advanced",
    gapScore: 1,
    severity: "low",
    rank: 5,
    relevantCompanies: ["Google", "Amazon", "Microsoft"],
  },
  {
    topic: "Database Management & SQL",
    requiredLevel: "intermediate",
    currentLevel: "intermediate",
    gapScore: 0,
    severity: "low",
    rank: 6,
    relevantCompanies: ["Amazon", "Flipkart"],
  },
];

export const skillGapApi = {
  getGapAnalysis: async (): Promise<SkillGapResponse> => {
    try {
      const response = await api.get<SkillGapResponse>("/skill-gap");
      return response.data;
    } catch {
      return {
        userId: "demo-student-id-001",
        targetCompanies: ["Google", "Amazon", "Microsoft", "Uber"],
        gaps: MOCK_GAPS,
        computedAt: new Date().toISOString(),
      };
    }
  },
};
