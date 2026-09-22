import type { Question } from "./assessment.types.js";

export interface GradeResult {
    isCorrect: boolean | null;
    feedback?: string;
}

function normalizeAnswer(answer: string): string {
    return answer.trim().toLowerCase();
}

export function gradeMcq(
    question: Question,
    studentAnswer?: {
        selectedOption?: string;
    }
): GradeResult {
    const expected = question.answerKey?.correct_option;
    const isCorrect =
        Boolean(expected) &&
        Boolean(studentAnswer?.selectedOption) &&
        expected === studentAnswer?.selectedOption;

    return {
        isCorrect
    };
}

export function gradeTechnical(
    question: Question,
    studentAnswer?: {
        text?: string;
    }
): GradeResult {
    const expected = question.answerKey?.expectedOutput;
    const isCorrect =
        normalizeAnswer(expected ?? "") ===
        normalizeAnswer(studentAnswer?.text ?? "");

    return {
        isCorrect
    };
}

export async function gradeAnswer(
    question: Question,
    studentAnswer: unknown
): Promise<GradeResult> {
    if (question.type === "coding") {
        return {
            isCorrect: null,
            feedback: "Coding answer requires LLM grading."
        };
    }

    if (question.type === "aptitude") {
        return gradeMcq(
            question,
            studentAnswer as {
                selectedOption?: string;
            }
        );
    }

    return gradeTechnical(
        question,
        studentAnswer as {
            text?: string;
        }
    );
}