import { z } from "zod";

export const resourceFilterSchema = z.object({
  topic: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  company: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type ResourceFilterInput = z.infer<typeof resourceFilterSchema>;
