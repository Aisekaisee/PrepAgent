import type {
    Request,
    Response,
    NextFunction
} from "express";

import type { ZodSchema } from "zod";

import { AppError } from "../utils/AppError.js";

export function validate(
    schema: ZodSchema,
    source: "body" | "query" = "body"
) {
    return (
        req: Request,
        _res: Response,
        next: NextFunction
    ) => {
        const input = source === "query" ? req.query : req.body;
        const result = schema.safeParse(input);

        if (!result.success) {
            throw new AppError(
                "VALIDATION_ERROR",
                400,
                result.error.message
            );
        }

        if (source === "query") {
            // Attach parsed/coerced query values back onto req.query
            Object.assign(req.query, result.data);
        } else {
            req.body = result.data;
        }

        next();
    };
}