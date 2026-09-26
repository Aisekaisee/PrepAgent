import { z } from "zod";

export const itemStatusSchema = z.object({
  status: z.enum(["pending", "started", "completed", "skipped"]),
});

export type ItemStatusInput = z.infer<typeof itemStatusSchema>;
