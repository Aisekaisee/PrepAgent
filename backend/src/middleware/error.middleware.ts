import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger";

export function errorHandler(
    error: unknown,
    req: Request,
    res: Response,
    _next: NextFunction
) {
    if (error instanceof AppError) {
        return res.status(error.httpStatus).json({
            error: {
                code: error.code,
                message: error.message
            }
        });
    }

    logger.error(
        {
            error,
            method: req.method,
            url: req.originalUrl
        },
        "Unhandled error"
    );

    return res.status(500).json({
        error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "An unexpected error occurred"
        }
    });
}