import type {
    Request,
    Response,
    NextFunction
} from "express";

import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

export interface AuthenticatedUser {
    userId: string;
    role: string;
}

export function authenticate(
    req: Request,
    _res: Response,
    next: NextFunction
) {
    const authorization =
        req.headers.authorization;

    if (!authorization) {
        throw new AppError(
            "UNAUTHORIZED",
            401,
            "Authentication required"
        );
    }

    const [
        scheme,
        token
    ] = authorization.split(" ");

    if (
        scheme !== "Bearer" ||
        !token
    ) {
        throw new AppError(
            "UNAUTHORIZED",
            401,
            "Invalid authorization header"
        );
    }

    try {
        const payload =
            jwt.verify(
                token,
                env.JWT_ACCESS_SECRET
            ) as {
                sub: string;
                role: string;
            };

        req.user = {
            userId: payload.sub,
            role: payload.role
        };

        next();
    } catch {
        throw new AppError(
            "UNAUTHORIZED",
            401,
            "Invalid or expired access token"
        );
    }
}

export function requireRole(
    requiredRole: string
) {
    return (
        req: Request,
        _res: Response,
        next: NextFunction
    ) => {
        if (!req.user) {
            throw new AppError(
                "UNAUTHORIZED",
                401,
                "Authentication required"
            );
        }

        if (
            req.user.role !== requiredRole
        ) {
            throw new AppError(
                "FORBIDDEN",
                403,
                "Insufficient permissions"
            );
        }

        next();
    };
}