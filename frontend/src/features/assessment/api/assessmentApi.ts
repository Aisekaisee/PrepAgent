import { api } from "@/lib/axios";
import type {
  AssessmentSession,
  Question,
  TopicBreakdown,
} from "@/types/assessment";

// Mock question bank for offline demo & adaptive testing
const MOCK_QUESTIONS: Question[] = [
  {
    id: "q-1",
    type: "technical",
    topic: "Data Structures & Algorithms",
    difficulty: "medium",
    companyTags: ["Google", "Amazon"],
    content: {
      prompt:
        "What is the average and worst-case time complexity of finding an element in a Hash Table with open addressing using linear probing?",
      options: [
        "Average: O(1), Worst: O(n)",
        "Average: O(log n), Worst: O(n)",
        "Average: O(1), Worst: O(log n)",
        "Average: O(n), Worst: O(n^2)",
      ],
      hint: "Recall how clustering affects collision resolution under high load factors.",
    },
  },
  {
    id: "q-2",
    type: "coding",
    topic: "Dynamic Programming",
    difficulty: "hard",
    companyTags: ["Uber", "Google"],
    content: {
      prompt:
        "Given an integer array nums and an integer target, write a function that returns the minimum number of elements required to sum up to target. If no combination matches, return -1.",
      codeTemplate: `function minCoins(coins, target) {\n  // Write your dynamic programming solution here\n  \n}`,
      testCases: [
        { input: "coins = [1, 2, 5], target = 11", output: "3" },
        { input: "coins = [2], target = 3", output: "-1" },
      ],
      hint: "Define dp[i] as the minimum coins needed for sub-target i.",
    },
  },
  {
    id: "q-3",
    type: "technical",
    topic: "Operating Systems",
    difficulty: "medium",
    companyTags: ["Microsoft", "Oracle"],
    content: {
      prompt:
        "Which of the following conditions is NOT required simultaneously for a Deadlock to occur according to Coffman's conditions?",
      options: [
        "Mutual Exclusion",
        "Hold and Wait",
        "Preemption Allowed",
        "Circular Wait",
      ],
      hint: "Remember that deadlock requires resources CANNOT be forcibly taken away.",
    },
  },
  {
    id: "q-4",
    type: "technical",
    topic: "Database Management Systems",
    difficulty: "easy",
    companyTags: ["Amazon", "Flipkart"],
    content: {
      prompt:
        "Which ACID property guarantees that all transactions either completely succeed or completely roll back without partial updates?",
      options: ["Atomicity", "Consistency", "Isolation", "Durability"],
      hint: "All-or-nothing execution.",
    },
  },
  {
    id: "q-5",
    type: "aptitude",
    topic: "Quantitative Aptitude",
    difficulty: "medium",
    companyTags: ["Goldman Sachs"],
    content: {
      prompt:
        "A pipe can fill a tank in 6 hours and another pipe can empty it in 8 hours. If both pipes are opened together, in how many hours will the tank be full?",
      options: ["18 hours", "24 hours", "12 hours", "30 hours"],
      hint: "Calculate the net work done per hour (1/6 - 1/8).",
    },
  },
];

const MOCK_PAST_SESSIONS: AssessmentSession[] = [
  {
    id: "sess-001",
    userId: "demo-student-id-001",
    topic: "Comprehensive Placement Diagnostic",
    startedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    submittedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000 + 1800000).toISOString(),
    score: 76.5,
    status: "submitted",
    topicBreakdown: {
      "Data Structures & Algorithms": { total: 4, correct: 3, accuracy: 0.75, proficiency: "advanced" },
      "Dynamic Programming": { total: 3, correct: 1, accuracy: 0.33, proficiency: "beginner" },
      "Operating Systems": { total: 3, correct: 2, accuracy: 0.67, proficiency: "intermediate" },
      "Database Management Systems": { total: 2, correct: 2, accuracy: 1.0, proficiency: "expert" },
    },
  },
  {
    id: "sess-002",
    userId: "demo-student-id-001",
    topic: "System Design & Concurrency Sprint",
    startedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    submittedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000 + 1200000).toISOString(),
    score: 62.0,
    status: "submitted",
    topicBreakdown: {
      "System Design": { total: 4, correct: 2, accuracy: 0.5, proficiency: "intermediate" },
      "Operating Systems": { total: 4, correct: 3, accuracy: 0.75, proficiency: "advanced" },
    },
  },
];

export const assessmentApi = {
  startSession: async (topic?: string): Promise<AssessmentSession> => {
    try {
      const response = await api.post<{ session: AssessmentSession }>("/assessments", { topic });
      return response.data.session;
    } catch {
      const newSession: AssessmentSession = {
        id: "sess-" + Date.now(),
        userId: "demo-student-id-001",
        topic: topic || "Full Placement Diagnostic (Adaptive)",
        startedAt: new Date().toISOString(),
        status: "active",
        answersCount: 0,
      };
      return newSession;
    }
  },

  getNextQuestion: async (sessionId: string): Promise<Question | null> => {
    try {
      const response = await api.get<{ question: Question }>(`/assessments/${sessionId}/next-question`);
      return response.data.question;
    } catch {
      // Pick a question from mock bank
      const localAnswers = JSON.parse(localStorage.getItem(`answers_${sessionId}`) || "[]");
      const unused = MOCK_QUESTIONS.filter((q) => !localAnswers.includes(q.id));
      return unused.length > 0 ? unused[0] : null;
    }
  },

  submitAnswer: async (
    sessionId: string,
    questionId: string,
    answer: { selectedOption?: string; code?: string; text?: string }
  ): Promise<{ isCorrect: boolean; feedback: string }> => {
    try {
      const response = await api.post<{ isCorrect: boolean; feedback: string }>(
        `/assessments/${sessionId}/answer`,
        { questionId, answer }
      );
      return response.data;
    } catch {
      // Store question id in local answered list
      const localAnswers = JSON.parse(localStorage.getItem(`answers_${sessionId}`) || "[]");
      localAnswers.push(questionId);
      localStorage.setItem(`answers_${sessionId}`, JSON.stringify(localAnswers));

      // Instant auto-grading mock
      const isCorrect = Math.random() > 0.3; // 70% chance of correct
      return {
        isCorrect,
        feedback: isCorrect
          ? "Excellent reasoning! Your answer aligns with industry benchmarks."
          : "Not quite. Check the time-complexity constraints and edge case handling.",
      };
    }
  },

  submitSession: async (sessionId: string): Promise<AssessmentSession> => {
    try {
      const response = await api.post<{ session: AssessmentSession }>(`/assessments/${sessionId}/submit`);
      return response.data.session;
    } catch {
      const breakdown: TopicBreakdown = {
        "Data Structures & Algorithms": { total: 3, correct: 2, accuracy: 0.67, proficiency: "intermediate" },
        "Dynamic Programming": { total: 2, correct: 1, accuracy: 0.5, proficiency: "intermediate" },
        "Operating Systems": { total: 2, correct: 2, accuracy: 1.0, proficiency: "expert" },
        "Database Management Systems": { total: 2, correct: 1, accuracy: 0.5, proficiency: "intermediate" },
      };

      const session: AssessmentSession = {
        id: sessionId,
        userId: "demo-student-id-001",
        topic: "Adaptive Placement Assessment",
        startedAt: new Date(Date.now() - 15 * 60000).toISOString(),
        submittedAt: new Date().toISOString(),
        score: 72.5,
        status: "submitted",
        topicBreakdown: breakdown,
      };

      return session;
    }
  },

  getHistory: async (): Promise<AssessmentSession[]> => {
    try {
      const response = await api.get<{ sessions: AssessmentSession[] }>("/assessments/history");
      return response.data.sessions;
    } catch {
      return MOCK_PAST_SESSIONS;
    }
  },
};
