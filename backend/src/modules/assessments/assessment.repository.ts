import { db } from "../../db/client.js";
import type {
    AssessmentSession,
    Question,
    QuestionAnswer
} from "./assessment.types.js";

function mapQuestionRow(row: any): Question {
    return {
        id: row.id,
        type: row.type,
        topic: row.topic,
        difficulty: row.difficulty,
        companyTags: row.company_tags ?? [],
        content: typeof row.content === "string" ? JSON.parse(row.content) : row.content,
        answerKey: typeof row.answer_key === "string" ? JSON.parse(row.answer_key) : (row.answer_key ?? {}),
        createdAt: new Date(row.created_at)
    };
}

function mapSessionRow(row: any): AssessmentSession {
    return {
        id: row.id,
        userId: row.user_id,
        topic: row.topic ?? null,
        startedAt: new Date(row.started_at),
        submittedAt: row.submitted_at ? new Date(row.submitted_at) : null,
        score: row.score !== null && row.score !== undefined ? Number(row.score) : null,
        topicBreakdown: typeof row.topic_breakdown === "string" ? JSON.parse(row.topic_breakdown) : (row.topic_breakdown ?? null),
        status: row.status
    };
}

function mapAnswerRow(row: any): QuestionAnswer {
    return {
        id: row.id,
        sessionId: row.session_id,
        questionId: row.question_id,
        studentAnswer: typeof row.student_answer === "string" ? JSON.parse(row.student_answer) : row.student_answer,
        isCorrect: row.is_correct,
        answeredAt: new Date(row.answered_at)
    };
}

export async function findQuestionById(
    id: string
): Promise<Question | null> {
    const result = await db.query(
        `
        SELECT
          id,
          type,
          topic,
          difficulty,
          company_tags,
          content,
          answer_key,
          created_at
        FROM questions
        WHERE id = $1
        LIMIT 1
        `,
        [id]
    );

    if (result.rows.length === 0) {
        return null;
    }

    return mapQuestionRow(result.rows[0]);
}

export async function findQuestionsByFilters(
    topic: string | null,
    difficulty: string,
    excludeIds: string[]
): Promise<Question[]> {
    const result = await db.query(
        `
        SELECT
          id,
          type,
          topic,
          difficulty,
          company_tags,
          content,
          answer_key,
          created_at
        FROM questions
        WHERE ($1::text IS NULL OR topic = $1)
          AND difficulty = $2
          AND (
            $3::uuid[] IS NULL
            OR cardinality($3::uuid[]) IS NULL
            OR cardinality($3::uuid[]) = 0
            OR NOT (id = ANY($3::uuid[]))
          )
        ORDER BY random()
        `,
        [
            topic,
            difficulty,
            excludeIds.length > 0 ? excludeIds : []
        ]
    );

    return result.rows.map(mapQuestionRow);
}

export async function createSession(
    userId: string,
    topic?: string
): Promise<AssessmentSession> {
    const result = await db.query(
        `
        INSERT INTO assessment_sessions (
          user_id,
          topic
        )
        VALUES ($1, $2)
        RETURNING *
        `,
        [
            userId,
            topic ?? null
        ]
    );

    return mapSessionRow(result.rows[0]);
}

export async function findSessionById(
    sessionId: string
): Promise<AssessmentSession | null> {
    const result = await db.query(
        `
        SELECT *
        FROM assessment_sessions
        WHERE id = $1
        LIMIT 1
        `,
        [sessionId]
    );

    if (result.rows.length === 0) {
        return null;
    }

    return mapSessionRow(result.rows[0]);
}

export async function saveAnswer(
    sessionId: string,
    questionId: string,
    answer: unknown,
    isCorrect: boolean | null
): Promise<QuestionAnswer> {
    const result = await db.query(
        `
        INSERT INTO question_answers (
          session_id,
          question_id,
          student_answer,
          is_correct
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
        [
            sessionId,
            questionId,
            JSON.stringify(answer),
            isCorrect
        ]
    );

    return mapAnswerRow(result.rows[0]);
}

export async function getSessionAnswers(
    sessionId: string
): Promise<QuestionAnswer[]> {
    const result = await db.query(
        `
        SELECT *
        FROM question_answers
        WHERE session_id = $1
        ORDER BY answered_at ASC
        `,
        [sessionId]
    );

    return result.rows.map(mapAnswerRow);
}

export async function finalizeSession(
    sessionId: string,
    score: number,
    topicBreakdown: unknown
): Promise<AssessmentSession> {
    const result = await db.query(
        `
        UPDATE assessment_sessions
        SET
          score = $1,
          topic_breakdown = $2,
          submitted_at = now(),
          status = 'submitted'
        WHERE id = $3
        RETURNING *
        `,
        [
            score,
            JSON.stringify(topicBreakdown),
            sessionId
        ]
    );

    return mapSessionRow(result.rows[0]);
}

export async function listSessionsByUser(
    userId: string,
    page: number,
    limit: number
): Promise<AssessmentSession[]> {
    const offset = (page - 1) * limit;

    const result = await db.query(
        `
        SELECT
          id,
          user_id,
          topic,
          started_at,
          submitted_at,
          score,
          topic_breakdown,
          status
        FROM assessment_sessions
        WHERE user_id = $1
        ORDER BY started_at DESC
        LIMIT $2
        OFFSET $3
        `,
        [
            userId,
            limit,
            offset
        ]
    );

    return result.rows.map(mapSessionRow);
}
