import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import type { LLMProvider } from "./types.js";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";

export class OpenAIProvider implements LLMProvider {
  private model: ChatOpenAI;

  constructor() {
    this.model = new ChatOpenAI({
      model: "gpt-4o-mini",
      apiKey: env.OPENAI_API_KEY,
      temperature: 0.3,
    });
  }

  async generate<T>(prompt: string, schema: z.ZodSchema<T>): Promise<T> {
    const structuredModel = this.model.withStructuredOutput(schema as any);

    const result = await structuredModel.invoke(prompt);
    const parsed = schema.safeParse(result);

    if (!parsed.success) {
      logger.warn({ errors: parsed.error.issues }, "OpenAI structured output failed schema validation");
      throw new Error("SCHEMA_VALIDATION_FAILED");
    }

    return parsed.data;
  }
}
