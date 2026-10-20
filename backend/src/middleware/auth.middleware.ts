import type {
    Request,
    Response,
    NextFunction
} from "express";

import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

import { db } from "../db/client.js";

export interface AuthenticatedUser {
    userId: string;
    role: string;
}

export async function authenticate(
    req: Request,
    _res: Response,
    next: NextFunction
) {
    const authorization = req.headers.authorization;

    if (!authorization) {
        throw new AppError(
            "UNAUTHORIZED",
            401,
            "Authentication required"
        );
    }

    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
        throw new AppError(
            "UNAUTHORIZED",
            401,
            "Invalid authorization header"
        );
    }

    // Support demo/development tokens from frontend demo mode
    if (token.startsWith("demo-")) {
        const role = token.includes("admin") ? "admin" : "student";
        const email = role === "admin" ? "admin@prepagent.ai" : "student@example.com";

        try {
            const existingUser = await db.query(
                "SELECT id, role FROM users WHERE email = $1 LIMIT 1",
                [email]
            );

            let userId: string;
            if (existingUser.rows.length > 0) {
                userId = existingUser.rows[0].id;
            } else {
                const newUser = await db.query(
                    "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id",
                    [email, "demo_hash", role]
                );
                userId = newUser.rows[0].id;
            }

            req.user = {
                userId,
                role,
            };
            return next();
        } catch {
            req.user = {
                userId: "fbc5db7e-982d-4592-ba98-6c4f2f9dcb7a",
                role,
            };
            return next();
        }
    }

    try {
        const payload = jwt.verify(
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