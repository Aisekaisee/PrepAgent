import { z } from "zod";

export const profileUpdateSchema =
  z.object({
    education: z
      .object({
        degree: z.string(),
        institution: z.string(),
        year: z.number()
      })
      .optional(),

    programmingSkills: z
      .array(z.string())
      .optional(),

    technicalSubjects: z
      .array(z.string())
      .optional(),

    targetCompanies: z
      .array(z.string())
      .optional(),

    timelineWeeks: z
      .number()
      .int()
      .min(1)
      .max(52)
      .optional()
  });