export type QuestionType =
    | "coding"
    | "aptitude"
    | "technical";

export type Difficulty =
    | "easy"
    | "medium"
    | "hard";

export interface QuestionContent {
    prompt: string;
    options?: string[];
    codeTemplate?: string;
    testCases?: unknown[];
}

export interface AnswerKey {
    correct_option?: string;
    expectedOutput?: string;
    rubric?: unknown;
}

export interface Question {
    id: string;
    type: QuestionType;
    topic: string;
    difficulty: Difficulty;
    companyTags: string[];
    content: QuestionContent;
    answerKey: AnswerKey;
    createdAt: Date;
}

export interface AssessmentSession {
    id: string;
    userId: string;
    topic: string | null;
    startedAt: Date;
    submittedAt: Date | null;
    score: number | null;
    topicBreakdown: Record<string, unknown> | null;
    status: "active" | "submitted";
}

export interface QuestionAnswer {
    id: string;
    sessionId: string;
    questionId: string;
    studentAnswer: unknown;
    isCorrect: boolean | null;
    answeredAt: Date;
}