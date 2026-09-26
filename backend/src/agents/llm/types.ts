import type { z } from "zod";

export interface LLMProvider {
  generate<T>(prompt: string, schema: z.ZodSchema<T>): Promise<T>;
}
