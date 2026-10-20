import { api } from "@/lib/axios";
import type { SkillGapResponse } from "@/types/skillgap";

export const skillGapApi = {
  getGapAnalysis: async (): Promise<SkillGapResponse> => {
    try {
      const response = await api.get<SkillGapResponse>("/skill-gap");
      const data = (response.data as any)?.data || response.data;
      return {
        userId: data?.userId || "student",
        targetCompanies: Array.isArray(data?.targetCompanies) ? data.targetCompanies : [],
        gaps: Array.isArray(data?.gaps)
          ? data.gaps.map((g: any) => ({
              topic: g.topic || "Technical Pillar",
              requiredLevel: g.requiredLevel || g.required || "advanced",
              currentLevel: g.currentLevel || g.current || "beginner",
              gapScore: g.gapScore !== undefined ? g.gapScore : 1,
              severity: g.severity || "moderate",
              rank: g.rank || 1,
              relevantCompanies: Array.isArray(g.relevantCompanies) ? g.relevantCompanies : [],
              isAssessed: Boolean(g.isAssessed),
            }))
          : [],
        computedAt: data?.computedAt || new Date().toISOString(),
        insights: data?.insights,
      };
    } catch (err) {
      console.error("Failed to fetch dynamic skill gap analysis:", err);
      return {
        userId: "student",
        targetCompanies: ["Google", "Amazon", "Microsoft", "Meta"],
        gaps: [],
        computedAt: new Date().toISOString(),
      };
    }
  },
};
