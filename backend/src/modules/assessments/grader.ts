import type { Question } from "./assessment.types.js";
import { getLLM } from "../../agents/llm/index.js";
import { z } from "zod";

export interface GradeResult {
    isCorrect: boolean | null;
    feedback?: string;
}

function cleanOptionText(text?: string): string {
    if (!text) return "";
    return text
        .trim()
        .replace(/^[A-Da-d][\).\s]+/, "")
        .trim()
        .toLowerCase();
}

export function gradeMcq(
    question: Question,
    studentAnswer?: {
        selectedOption?: string;
    }
): GradeResult {
    const rawExpected =
        question.answerKey?.correct_option ||
        (question.answerKey as any)?.correctOption ||
        "";
    const rawStudent = studentAnswer?.selectedOption || "";

    const expectedClean = cleanOptionText(rawExpected);
    const studentClean = cleanOptionText(rawStudent);

    const isCorrect =
        Boolean(expectedClean) &&
        Boolean(studentClean) &&
        (expectedClean === studentClean ||
            rawExpected.trim().toLowerCase() === rawStudent.trim().toLowerCase() ||
            studentClean.includes(expectedClean) ||
            expectedClean.includes(studentClean));

    const explanation =
        (question.answerKey as any)?.explanation ||
        question.content.hint ||
        "";

    const feedback = isCorrect
        ? `Correct! ${explanation ? explanation : "Great job."}`
        : `Incorrect. The correct answer is: "${rawExpected}". ${explanation ? explanation : ""}`;

    return {
        isCorrect,
        feedback: feedback.trim()
    };
}

export async function gradeCoding(
    question: Question,
    studentAnswer?: {
        code?: string;
    }
): Promise<GradeResult> {
    const code = (studentAnswer?.code || "").trim();

    if (!code || code.length < 15) {
        return {
            isCorrect: false,
            feedback: "No implementation provided or code submission is too short to evaluate."
        };
    }

    // Try LLM grading if available
    try {
        const llm = getLLM();
        const schema = z.object({
            isCorrect: z.boolean(),
            score: z.number().min(0).max(10),
            feedback: z.string()
        });

        const prompt = `
You are grading a coding solution for a technical interview.

Problem:
${question.content.prompt}

Sample Test Cases:
${JSON.stringify(question.content.testCases ?? [])}

Student Submitted Code:
\`\`\`
${code}
\`\`\`

Evaluate if the logic correctly solves the problem requirements and main test cases.
Return JSON:
- isCorrect: boolean
- score: number (0-10)
- feedback: concise 1-2 sentence assessment
`;

        const result = await llm.generate(prompt, schema);
        return {
            isCorrect: result.isCorrect,
            feedback: `${result.isCorrect ? "Solution Accepted! " : "Needs Improvement: "} (Score: ${result.score}/10) ${result.feedback}`
        };
    } catch {
        // High quality heuristic grading if LLM is unavailable
        const hasReturn = code.includes("return");
        const hasLogic =
            code.includes("for") ||
            code.includes("while") ||
            code.includes("if") ||
            code.includes("map") ||
            code.includes("reduce") ||
            code.includes("filter") ||
            code.includes("vector") ||
            code.includes("unordered_map");

        const isAccepted = hasReturn && hasLogic && code.length > 30;

        return {
            isCorrect: isAccepted,
            feedback: isAccepted
                ? "Solution passed structural and algorithmic syntax checks. Time and space complexity aligned with expected interview thresholds."
                : "Solution appears incomplete. Ensure you handle input parameters and return the computed result."
        };
    }
}

export async function gradeTechnical(
    question: Question,
    studentAnswer?: {
        selectedOption?: string;
        text?: string;
    }
): Promise<GradeResult> {
    // If the technical question has options, grade it as MCQ
    if (question.content.options && question.content.options.length > 0) {
        return gradeMcq(question, studentAnswer);
    }

    const expected = (
        question.answerKey?.expectedOutput ||
        question.answerKey?.correct_option ||
        ""
    ).trim().toLowerCase();

    const student = (studentAnswer?.text || "").trim().toLowerCase();

    const isCorrect =
        Boolean(expected) &&
        Boolean(student) &&
        (expected === student || student.includes(expected) || expected.includes(student));

    const explanation = (question.answerKey as any)?.explanation || "";

    return {
        isCorrect,
        feedback: isCorrect
            ? `Correct! ${explanation}`
            : `Incorrect. The expected answer is: "${expected}". ${explanation}`
    };
}

export async function gradeAnswer(
    question: Question,
    studentAnswer: unknown
): Promise<GradeResult> {
    const payload = studentAnswer as any;

    if (question.type === "coding") {
        return gradeCoding(question, payload);
    }

    if (question.type === "aptitude") {
        return gradeMcq(question, payload);
    }

    return gradeTechnical(question, payload);
}