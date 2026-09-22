import type {
    Request,
    Response,
    NextFunction
} from "express";

import type { ZodSchema } from "zod";

import { AppError } from "../utils/AppError.js";

export function validate(
    schema: ZodSchema
) {
    return (
        req: Request,
        _res: Response,
        next: NextFunction
    ) => {
        const result = schema.safeParse(
            req.body
        );

        if (!result.success) {
            throw new AppError(
                "VALIDATION_ERROR",
                400,
                result.error.message
            );
        }

        req.body = result.data;

        next();
    };
}