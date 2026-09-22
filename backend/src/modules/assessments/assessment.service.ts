import { AppError } from "../../utils/AppError.js";
import * as repository from "./assessment.repository.js";
import { gradeAnswer } from "./grader.js";
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

    const recent = answers.slice(-5);
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
): Promise<Omit<Question, "answerKey">> {
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
    const difficulty = calculateDifficulty(answers);
    const answeredQuestionIds = answers.map(a => a.questionId);

    let questions = await repository.findQuestionsByFilters(
        session.topic,
        difficulty,
        answeredQuestionIds
    );

    // Fallback if no question exists at current difficulty
    if (questions.length === 0) {
        questions = await repository.findQuestionsByFilters(
            session.topic,
            "easy",
            answeredQuestionIds
        );
    }

    if (questions.length === 0) {
        questions = await repository.findQuestionsByFilters(
            session.topic,
            "medium",
            answeredQuestionIds
        );
    }

    if (questions.length === 0) {
        questions = await repository.findQuestionsByFilters(
            session.topic,
            "hard",
            answeredQuestionIds
        );
    }

    if (questions.length === 0) {
        throw new AppError(
            "NO_QUESTIONS_AVAILABLE",
            404,
            "No unused questions are available"
        );
    }

    const selectedQuestion = questions[0];

    // Sanitize answerKey so the answer is never exposed to the client
    const { answerKey: _key, ...sanitizedQuestion } = selectedQuestion;
    return sanitizedQuestion;
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
        throw new AppError(
            "SESSION_NOT_ACTIVE",
            400,
            "Assessment has already been submitted"
        );
    }

    const answers = await repository.getSessionAnswers(sessionId);

    let score = 0;
    const topicBreakdown: Record<string, { total: number; correct: number }> = {};

    if (answers.length > 0) {
        let correctCount = 0;

        for (const ans of answers) {
            const q = await repository.findQuestionById(ans.questionId);
            const topic = q?.topic ?? "general";

            if (!topicBreakdown[topic]) {
                topicBreakdown[topic] = { total: 0, correct: 0 };
            }
            topicBreakdown[topic].total += 1;

            if (ans.isCorrect === true) {
                correctCount += 1;
                topicBreakdown[topic].correct += 1;
            }
        }

        score = Number(((correctCount / answers.length) * 100).toFixed(2));
    }

    return repository.finalizeSession(sessionId, score, topicBreakdown);
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
    getHistory
};
