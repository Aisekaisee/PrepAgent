import { AppError } from "../../utils/AppError.js";
import * as repository from "./assessment.repository.js";
import * as profileRepo from "../profile/profile.repository.js";
import { gradeAnswer } from "./grader.js";
import { generateDynamicQuestion } from "./questionGenerator.js";
import type { AssessmentSession, Question } from "./assessment.types.js";

export async function startSession(
    userId: string,
    topic?: string
): Promise<AssessmentSession> {
    return repository.createSession(userId, topic);
}

function calculateDifficulty(
    answers: { isCorrect: boolean | null }[]
): "easy" | "medium" | "hard" {
    if (answers.length === 0) {
        return "medium";
    }

    const recent = answers.slice(-3);
    const graded = recent.filter(a => a.isCorrect !== null);

    if (graded.length === 0) {
        return "medium";
    }

    const correct = graded.filter(a => a.isCorrect === true).length;
    const accuracy = correct / graded.length;

    if (accuracy < 0.4) {
        return "easy";
    }

    if (accuracy < 0.75) {
        return "medium";
    }

    return "hard";
}

export async function getNextQuestion(
    sessionId: string,
    userId: string
): Promise<Omit<Question, "answerKey"> | null> {
    const session = await repository.findSessionById(sessionId);

    if (!session) {
        throw new AppError(
            "SESSION_NOT_FOUND",
            404,
            "Assessment session not found"
        );
    }

    if (session.userId !== userId) {
        throw new AppError(
            "FORBIDDEN",
            403,
            "You do not own this assessment"
        );
    }

    if (session.status !== "active") {
        throw new AppError(
            "SESSION_NOT_ACTIVE",
            400,
            "Assessment has already been submitted"
        );
    }

    const answers = await repository.getSessionAnswers(sessionId);

    // Limit assessments to 5 questions per sprint/diagnostic
    if (answers.length >= 5) {
        return null;
    }

    const difficulty = calculateDifficulty(answers);

    // Fetch user profile for dynamic personalization
    const profile = await profileRepo.findByUserId(userId);

    const profileContext = {
        targetCompanies: (profile?.target_companies as string[]) ?? [],
        programmingSkills: (profile?.programming_skills as string[]) ?? [],
        technicalSubjects: (profile?.technical_subjects as string[]) ?? [],
        education: profile?.education as any,
    };

    // Gather already asked prompts to avoid repeating questions
    const excludePrompts: string[] = [];
    for (const ans of answers) {
        const q = await repository.findQuestionById(ans.questionId);
        if (q?.content?.prompt) {
            excludePrompts.push(q.content.prompt);
        }
    }

    // Generate dynamic question tailored to profile & adaptive difficulty
    const dynamicQuestion = await generateDynamicQuestion({
        profile: profileContext,
        topic: session.topic || "Full Placement Diagnostic (Adaptive)",
        difficulty,
        questionIndex: answers.length + 1,
        excludePrompts,
    });

    // Sanitize answerKey so the answer is never exposed to the client
    const { answerKey: _key, ...sanitizedQuestion } = dynamicQuestion;
    return {
        ...sanitizedQuestion,
        questionNumber: answers.length + 1,
        totalQuestions: 5
    };
}

export async function submitAnswer(
    sessionId: string,
    userId: string,
    questionId: string,
    answer: unknown
) {
    const session = await repository.findSessionById(sessionId);

    if (!session) {
        throw new AppError(
            "SESSION_NOT_FOUND",
            404,
            "Assessment session not found"
        );
    }

    if (session.userId !== userId) {
        throw new AppError(
            "FORBIDDEN",
            403,
            "You do not own this assessment"
        );
    }

    if (session.status !== "active") {
        throw new AppError(
            "SESSION_NOT_ACTIVE",
            400,
            "Assessment has already been submitted"
        );
    }

    const existingAnswers = await repository.getSessionAnswers(sessionId);
    const alreadyAnswered = existingAnswers.some(a => a.questionId === questionId);

    if (alreadyAnswered) {
        throw new AppError(
            "QUESTION_ALREADY_ANSWERED",
            400,
            "This question has already been answered in this session"
        );
    }

    const question = await repository.findQuestionById(questionId);

    if (!question) {
        throw new AppError(
            "QUESTION_NOT_FOUND",
            404,
            "Question not found"
        );
    }

    const grade = await gradeAnswer(question, answer);
    const saved = await repository.saveAnswer(
        sessionId,
        questionId,
        answer,
        grade.isCorrect
    );

    return {
        answerId: saved.id,
        isCorrect: grade.isCorrect,
        feedback: grade.feedback
    };
}

export async function finalizeSession(
    sessionId: string,
    userId: string
): Promise<AssessmentSession> {
    const session = await repository.findSessionById(sessionId);

    if (!session) {
        throw new AppError(
            "SESSION_NOT_FOUND",
            404,
            "Assessment session not found"
        );
    }

    if (session.userId !== userId) {
        throw new AppError(
            "FORBIDDEN",
            403,
            "You do not own this assessment"
        );
    }

    if (session.status !== "active") {
        return session;
    }

    const answers = await repository.getSessionAnswers(sessionId);

    let score = 0;
    const rawCounts: Record<string, { total: number; correct: number }> = {};

    if (answers.length > 0) {
        let correctCount = 0;

        for (const ans of answers) {
            const q = await repository.findQuestionById(ans.questionId);
            const topic = q?.topic ?? session.topic ?? "General Technical";

            if (!rawCounts[topic]) {
                rawCounts[topic] = { total: 0, correct: 0 };
            }
            rawCounts[topic].total += 1;

            if (ans.isCorrect === true) {
                correctCount += 1;
                rawCounts[topic].correct += 1;
            }
        }

        score = Number(((correctCount / answers.length) * 100).toFixed(1));
    }

    // Build properly structured topicBreakdown matching TopicBreakdown interface
    const topicBreakdown: Record<
        string,
        {
            total: number;
            correct: number;
            accuracy: number;
            proficiency: "beginner" | "intermediate" | "advanced" | "expert";
        }
    > = {};

    for (const [top, stats] of Object.entries(rawCounts)) {
        const accuracy = stats.total > 0 ? Number((stats.correct / stats.total).toFixed(2)) : 0;
        const proficiency =
            accuracy >= 0.85
                ? "expert"
                : accuracy >= 0.70
                ? "advanced"
                : accuracy >= 0.45
                ? "intermediate"
                : "beginner";

        topicBreakdown[top] = {
            total: stats.total,
            correct: stats.correct,
            accuracy,
            proficiency
        };
    }

    return repository.finalizeSession(sessionId, score, topicBreakdown);
}

export async function getSessionDetails(
    sessionId: string,
    userId: string
) {
    const session = await repository.findSessionById(sessionId);

    if (!session) {
        throw new AppError(
            "SESSION_NOT_FOUND",
            404,
            "Assessment session not found"
        );
    }

    if (session.userId !== userId) {
        throw new AppError(
            "FORBIDDEN",
            403,
            "You do not own this assessment"
        );
    }

    const answers = await repository.getSessionAnswers(sessionId);
    const detailedAnswers = await Promise.all(
        answers.map(async (ans) => {
            const q = await repository.findQuestionById(ans.questionId);
            return {
                id: ans.id,
                questionId: ans.questionId,
                studentAnswer: ans.studentAnswer,
                isCorrect: ans.isCorrect,
                answeredAt: ans.answeredAt,
                question: q
                    ? {
                          id: q.id,
                          type: q.type,
                          topic: q.topic,
                          difficulty: q.difficulty,
                          companyTags: q.companyTags,
                          prompt: q.content.prompt,
                          options: q.content.options,
                          codeTemplate: q.content.codeTemplate,
                          testCases: q.content.testCases,
                          hint: q.content.hint,
                          correctOption:
                              (q.answerKey as any)?.correct_option ||
                              (q.answerKey as any)?.correctOption ||
                              "",
                          explanation: (q.answerKey as any)?.explanation || ""
                      }
                    : null
            };
        })
    );

    return {
        ...session,
        answers: detailedAnswers
    };
}

export async function getHistory(
    userId: string,
    pagination: { page: number; limit: number }
) {
    const page = Math.max(1, pagination.page);
    const limit = Math.min(50, Math.max(1, pagination.limit));

    const sessions = await repository.listSessionsByUser(userId, page, limit);

    return {
        sessions,
        page,
        limit
    };
}

export const assessmentService = {
    startSession,
    getNextQuestion,
    submitAnswer,
    finalizeSession,
    getSessionDetails,
    getHistory
};
