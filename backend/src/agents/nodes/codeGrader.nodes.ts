// import { z } from "zod";

// export const CodeGradeSchema =
//     z.object({
//         score: z
//             .number()
//             .min(0)
//             .max(10),

//         feedback: z.string(),

//         isCorrect: z.boolean()
//     });

// export type CodeGrade =
//     z.infer<
//         typeof CodeGradeSchema
//     >;

// function createCodeGradingPrompt(
//     problem: string,
//     code: string,
//     rubric: unknown
// ) {
//     return `
// You are grading a programming assessment.

// Problem:
// ${problem}

// Student code:
// ${code}

// Rubric:
// ${JSON.stringify(rubric)}

// Evaluate:
// 1. Correctness
// 2. Algorithmic efficiency
// 3. Code quality

// Return ONLY JSON matching this structure:

// {
//   "score": number,
//   "feedback": string,
//   "isCorrect": boolean
// }

// Score must be between 0 and 10.
// `;
// }

// async function gradeWithLLM(
//   prompt: string
// ) {
//   for (let attempt = 0; attempt < 2; attempt++) {
//     try {
//       const response =
//         await callGemini(prompt);

//       const parsed =
//         CodeGradeSchema.safeParse(
//           response
//         );

//       if (parsed.success) {
//         return parsed.data;
//       }
//     } catch {
//       // retry
//     }
//   }

//   return null;
// }

// const result =
//   await gradeWithLLM(prompt);

// if (!result) {
//   return {
//     isCorrect: null,
//     feedback:
//       "Coding answer is pending manual review."
//   };
// }