import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";
import type { LLMProvider } from "./types.js";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";

export class GeminiProvider implements LLMProvider {
  private model: ChatGoogleGenerativeAI;

  constructor() {
    this.model = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash",
      apiKey: env.GEMINI_API_KEY,
      temperature: 0.3,
    });
  }

  async generate<T>(prompt: string, schema: z.ZodSchema<T>): Promise<T> {
    const structuredModel = this.model.withStructuredOutput(schema as any);

    const result = await structuredModel.invoke(prompt);
    const parsed = schema.safeParse(result);

    if (!parsed.success) {
      logger.warn({ errors: parsed.error.issues }, "Gemini structured output failed schema validation");
      throw new Error("SCHEMA_VALIDATION_FAILED");
    }

    return parsed.data;
  }
}
