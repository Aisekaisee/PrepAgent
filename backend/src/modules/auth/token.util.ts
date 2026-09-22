import jwt from "jsonwebtoken";
import crypto from "crypto";

import { env } from "../../config/env.js";
import type { TokenPair } from "./auth.types.js";

interface AccessTokenPayload {
    sub: string;
    role: string;
}

interface RefreshTokenPayload {
    sub: string;
}
export function hashToken(token: string): string {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
}

export function generateAccessToken(
    userId: string,
    role: string
): string {
    const payload: AccessTokenPayload = {
        sub: userId,
        role
    };

    return jwt.sign(
        payload,
        env.JWT_ACCESS_SECRET,
        {
            expiresIn: "15m"
        }
    );
}

export function generateRefreshToken(
    userId: string
): string {
    const payload: RefreshTokenPayload = {
        sub: userId
    };

    return jwt.sign(
        payload,
        env.JWT_REFRESH_SECRET,
        {
            expiresIn: "7d"
        }
    );
}

export function generateTokenPair(
    userId: string,
    role: string
): TokenPair {
    const accessToken = generateAccessToken(
        userId,
        role
    );

    const refreshToken = generateRefreshToken(
        userId
    );

    return {
        accessToken,
        refreshToken
    };
}