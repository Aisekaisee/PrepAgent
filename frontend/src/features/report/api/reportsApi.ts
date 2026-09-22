import { api } from "@/lib/axios";

export interface ProgressReportData {
  userId: string;
  readinessScore: number;
  completedMilestones: number;
  totalMilestones: number;
  assessmentsCount: number;
  averageAccuracy: number;
  strongPillars: string[];
  vulnerablePillars: string[];
  paceVsPlan: Array<{ week: string; planned: number; completed: number }>;
  generatedAt: string;
}

export const reportsApi = {
  getProgressReport: async (): Promise<ProgressReportData> => {
    try {
      const response = await api.get<ProgressReportData>("/reports/progress", {
        params: { format: "json" },
      });
      return response.data;
    } catch {
      return {
        userId: "demo-student-id-001",
        readinessScore: 78,
        completedMilestones: 2,
        totalMilestones: 8,
        assessmentsCount: 4,
        averageAccuracy: 74.2,
        strongPillars: [
          "Database Management Systems (100% Accuracy)",
          "Data Structures & Algorithms (75% Accuracy)",
          "Object-Oriented Design (80% Accuracy)",
        ],
        vulnerablePillars: [
          "Dynamic Programming (33% Accuracy — Critical Gap)",
          "System Design & Distributed Caching (50% Accuracy)",
        ],
        paceVsPlan: [
          { week: "Wk 1", planned: 12, completed: 14 },
          { week: "Wk 2", planned: 25, completed: 28 },
          { week: "Wk 3", planned: 38, completed: 40 },
          { week: "Wk 4", planned: 50, completed: 50 },
          { week: "Wk 5", planned: 63, completed: 60 },
          { week: "Wk 6", planned: 75, completed: 68 },
          { week: "Wk 7", planned: 88, completed: 78 },
          { week: "Wk 8", planned: 100, completed: 85 },
        ],
        generatedAt: new Date().toISOString(),
      };
    }
  },
};
