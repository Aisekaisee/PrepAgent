import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "test", "production"])
        .default("development"),

    PORT: z.coerce.number().default(5000),

    DATABASE_URL: z.string().min(1),

    JWT_ACCESS_SECRET: z.string().min(16),
    JWT_REFRESH_SECRET: z.string().min(16),

    GEMINI_API_KEY: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),

    SENDGRID_API_KEY: z.string().optional(),

    CHROMA_HOST: z.string().url(),

    CORS_ORIGIN: z.string().url(),

    SENTRY_DSN: z.string().optional()
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
    console.error("Invalid environment variables:");
    console.error(result.error.format());

    process.exit(1);
}

export const env = result.data;