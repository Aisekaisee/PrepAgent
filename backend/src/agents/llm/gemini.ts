import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";
import type { LLMProvider } from "./types.js";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";

export class GeminiProvider implements LLMProvider {
  private candidateModels: string[];

  constructor() {
    this.candidateModels = Array.from(
      new Set(
        [
          env.GEMINI_MODEL || process.env.GEMINI_MODEL,
          "gemini-3.5-flash-lite",
          "gemini-flash-lite-latest",
          "gemini-3.5-flash",
        ].filter(Boolean) as string[]
      )
    );
  }

  async generate<T>(prompt: string, schema: z.ZodSchema<T>): Promise<T> {
    let lastError: any = null;

    for (const modelName of this.candidateModels) {
      try {
        logger.info({ model: modelName }, "Attempting structured generation with Gemini model");
        const chatModel = new ChatGoogleGenerativeAI({
          model: modelName,
          apiKey: env.GEMINI_API_KEY,
          temperature: 0.2,
          maxRetries: 0,
        });

        const structuredModel = chatModel.withStructuredOutput(schema as any);
        const result = await structuredModel.invoke(prompt);

        // Normalize if LLM returns top-level array instead of { weeks: [...] }
        let toParse: unknown = result;
        if (Array.isArray(result)) {
          toParse = { weeks: result };
        }

        const parsed = schema.safeParse(toParse);
        if (parsed.success) {
          logger.info({ model: modelName }, "Gemini generation succeeded and validated schema");
          return parsed.data;
        }

        logger.warn(
          { model: modelName, errors: parsed.error.issues },
          "Gemini output failed schema validation"
        );
        lastError = new Error("SCHEMA_VALIDATION_FAILED");
      } catch (err: any) {
        lastError = err;
        logger.warn(
          { model: modelName, error: err?.message || err },
          "Gemini model attempt failed, trying next candidate"
        );
      }
    }

    throw lastError || new Error("ALL_GEMINI_MODELS_FAILED");
  }
}

