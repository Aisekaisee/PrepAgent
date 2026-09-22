import { api } from "@/lib/axios";
import type { AdminAnalytics } from "@/types/admin";
import type { Question } from "@/types/assessment";

const MOCK_ANALYTICS: AdminAnalytics = {
  activeStudents7d: 1428,
  totalAssessments: 8940,
  avgRoadmapCompletion: 68.4,
  mostCommonGaps: [
    { topic: "Dynamic Programming", count: 842, avgGap: 2.8 },
    { topic: "System Design & Distributed Systems", count: 614, avgGap: 2.3 },
    { topic: "Graph Algorithms & Shortest Path", count: 490, avgGap: 1.9 },
    { topic: "Concurrency & Multi-threading", count: 375, avgGap: 1.7 },
  ],
  weeklySignups: [
    { week: "Wk 1", count: 120 },
    { week: "Wk 2", count: 180 },
    { week: "Wk 3", count: 240 },
    { week: "Wk 4", count: 320 },
  ],
};

export const adminApi = {
  getAnalytics: async (): Promise<AdminAnalytics> => {
    try {
      const response = await api.get<{ analytics: AdminAnalytics }>("/admin/analytics");
      return response.data.analytics;
    } catch {
      return MOCK_ANALYTICS;
    }
  },

  createQuestion: async (question: Partial<Question>): Promise<Question> => {
    try {
      const response = await api.post<{ question: Question }>("/admin/questions", question);
      return response.data.question;
    } catch {
      return {
        id: "q-" + Date.now(),
        type: question.type || "technical",
        topic: question.topic || "General CS",
        difficulty: question.difficulty || "medium",
        content: question.content || { prompt: "Sample question prompt" },
      };
    }
  },
};
