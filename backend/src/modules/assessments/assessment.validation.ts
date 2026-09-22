import { z } from "zod";

export const startSessionSchema = z.object({
    topic: z.string().optional()
});

export const answerSchema = z.object({
    questionId: z.string().uuid(),
    answer: z.union([
        z.object({
            selectedOption: z.string()
        }),
        z.object({
            code: z.string()
        }),
        z.object({
            text: z.string()
        })
    ])
});