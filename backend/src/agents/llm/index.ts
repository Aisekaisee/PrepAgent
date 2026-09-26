import type { LLMProvider } from "./types.js";
import { GeminiProvider } from "./gemini.js";
import { OpenAIProvider } from "./openai.js";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";
import { z } from "zod";

class FallbackLLMProvider implements LLMProvider {
  private primary: LLMProvider;
  private fallback: LLMProvider | null;

  constructor() {
    this.primary = new GeminiProvider();
    this.fallback = env.OPENAI_API_KEY ? new OpenAIProvider() : null;
  }

  async generate<T>(prompt: string, schema: z.ZodSchema<T>): Promise<T> {
    try {
      return await this.primary.generate(prompt, schema);
    } catch (err) {
      if (this.fallback) {
        logger.warn({ err }, "Gemini failed — falling back to OpenAI");
        return await this.fallback.generate(prompt, schema);
      }
      throw err;
    }
  }
}

let instance: LLMProvider | null = null;

export function getLLM(): LLMProvider {
  if (!instance) {
    instance = new FallbackLLMProvider();
  }
  return instance;
}

export type { LLMProvider };
