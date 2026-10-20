import { api } from "@/lib/axios";
import type {
  AssessmentSession,
  Question,
} from "@/types/assessment";

export const assessmentApi = {
  startSession: async (topic?: string): Promise<AssessmentSession> => {
    const response = await api.post<{ success: boolean; data: AssessmentSession }>("/assessments", { topic });
    const session = response.data?.data || (response.data as any)?.session || (response.data as any);
    return session;
  },

  getNextQuestion: async (sessionId: string): Promise<Question | null> => {
    const response = await api.get<{ success: boolean; data: Question | null }>(
      `/assessments/${sessionId}/next-question`
    );
    const question = response.data?.data !== undefined ? response.data.data : (response.data as any)?.question ?? null;
    return question;
  },

  submitAnswer: async (
    sessionId: string,
    questionId: string,
    answer: { selectedOption?: string; code?: string; text?: string }
  ): Promise<{ isCorrect: boolean; feedback: string }> => {
    const response = await api.post<{ success: boolean; data: { isCorrect: boolean; feedback: string } }>(
      `/assessments/${sessionId}/answer`,
      { questionId, answer }
    );
    const data = response.data?.data || (response.data as any);
    return {
      isCorrect: Boolean(data?.isCorrect),
      feedback: data?.feedback || (data?.isCorrect ? "Correct answer!" : "Incorrect answer."),
    };
  },

  submitSession: async (sessionId: string): Promise<AssessmentSession> => {
    const response = await api.post<{ success: boolean; data: AssessmentSession }>(
      `/assessments/${sessionId}/submit`
    );
    const session = response.data?.data || (response.data as any)?.session || (response.data as any);
    return session;
  },

  getSession: async (sessionId: string): Promise<AssessmentSession> => {
    const response = await api.get<{ success: boolean; data: AssessmentSession }>(
      `/assessments/${sessionId}`
    );
    const session = response.data?.data || (response.data as any)?.session || (response.data as any);
    return session;
  },

  getHistory: async (): Promise<AssessmentSession[]> => {
    try {
      const response = await api.get<{ success: boolean; data: { sessions: AssessmentSession[] } }>(
        "/assessments/history"
      );
      const sessions =
        response.data?.data?.sessions ||
        (response.data as any)?.sessions ||
        (response.data as any)?.data ||
        [];
      return Array.isArray(sessions) ? sessions : [];
    } catch (err) {
      console.error("Failed to fetch assessment history:", err);
      return [];
    }
  },
};
