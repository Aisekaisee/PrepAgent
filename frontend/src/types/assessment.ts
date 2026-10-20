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
  questionNumber?: number;
  totalQuestions?: number;
}

export interface DetailedQuestionAnswer {
  id: string;
  questionId: string;
  studentAnswer: {
    selectedOption?: string;
    code?: string;
    text?: string;
  };
  isCorrect: boolean | null;
  answeredAt: string;
  question?: {
    id: string;
    type: QuestionType;
    topic: string;
    difficulty: Difficulty;
    companyTags?: string[];
    prompt: string;
    options?: string[];
    codeTemplate?: string;
    testCases?: Array<{ input: string; output: string }>;
    hint?: string;
    correctOption?: string;
    explanation?: string;
  } | null;
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
  answers?: DetailedQuestionAnswer[];
}
