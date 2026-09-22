export type QuestionType = "coding" | "aptitude" | "technical";
export type Difficulty = "easy" | "medium" | "hard";
export type SessionStatus = "active" | "submitted";

export interface QuestionContent {
  prompt: string;
  options?: string[];
  codeTemplate?: string;
  testCases?: Array<{ input: string; output: string }>;
  hint?: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  topic: string;
  difficulty: Difficulty;
  companyTags?: string[];
  content: QuestionContent;
}

export interface QuestionAnswer {
  id: string;
  sessionId: string;
  questionId: string;
  studentAnswer: {
    selectedOption?: string;
    code?: string;
    text?: string;
  };
  isCorrect: boolean | null;
  feedback?: string;
  answeredAt: string;
}

export interface TopicBreakdown {
  [topic: string]: {
    total: number;
    correct: number;
    accuracy: number;
    proficiency: "beginner" | "intermediate" | "advanced" | "expert";
  };
}

export interface AssessmentSession {
  id: string;
  userId: string;
  topic?: string;
  startedAt: string;
  submittedAt?: string;
  score?: number;
  topicBreakdown?: TopicBreakdown;
  status: SessionStatus;
  answersCount?: number;
}
