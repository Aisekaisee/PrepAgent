import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import * as authRepository
    from "./auth.repository.js";

import {
    generateTokenPair,
    hashToken
} from "./token.util.js";

import { AppError } from "../../utils/AppError.js";

export async function register(
    email: string,
    password: string
) {
    const normalizedEmail = email
        .trim()
        .toLowerCase();

    const existingUser =
        await authRepository.findUserByEmail(
            normalizedEmail
        );

    if (existingUser) {
        throw new AppError(
            "EMAIL_IN_USE",
            409,
            "An account with this email already exists"
        );
    }

    const passwordHash =
        await bcrypt.hash(password, 12);

    const user =
        await authRepository.createUser(
            normalizedEmail,
            passwordHash
        );

    return issueTokenPair(
        user.id,
        user.role
    );
}

async function issueTokenPair(
    userId: string,
    role: string
) {
    const tokens = generateTokenPair(
        userId,
        role
    );

    const tokenHash =
        hashToken(tokens.refreshToken);

    const expiresAt = new Date(
        Date.now() +
        7 * 24 * 60 * 60 * 1000
    );

    await authRepository.saveRefreshToken(
        userId,
        tokenHash,
        expiresAt
    );

    return tokens;
}

export async function login(
    email: string,
    password: string
) {
    const normalizedEmail = email
        .trim()
        .toLowerCase();

    const user =
        await authRepository.findUserByEmail(
            normalizedEmail
        );

    if (!user) {
        throw new AppError(
            "INVALID_CREDENTIALS",
            401,
            "Invalid email or password"
        );
    }

    const passwordMatches =
        await bcrypt.compare(
            password,
            user.passwordHash
        );

    if (!passwordMatches) {
        throw new AppError(
            "INVALID_CREDENTIALS",
            401,
            "Invalid email or password"
        );
    }

    return issueTokenPair(
        user.id,
        user.role
    );
}

export async function refreshTokens(
    incomingRefreshToken: string
) {
    let payload: {
        sub: string;
    };

    try {
        payload = jwt.verify(
            incomingRefreshToken,
            env.JWT_REFRESH_SECRET
        ) as {
            sub: string;
        };
    } catch {
        throw new AppError(
            "INVALID_TOKEN",
            401,
            "Invalid or expired refresh token"
        );
    }

    const tokenHash =
        hashToken(incomingRefreshToken);

    const storedToken =
        await authRepository.findRefreshToken(
            tokenHash
        );

    if (!storedToken) {
        throw new AppError(
            "INVALID_TOKEN",
            401,
            "Invalid refresh token"
        );
    }

    if (storedToken.revokedAt) {
        throw new AppError(
            "INVALID_TOKEN",
            401,
            "Refresh token has been revoked"
        );
    }

    if (
        storedToken.expiresAt.getTime() <
        Date.now()
    ) {
        throw new AppError(
            "INVALID_TOKEN",
            401,
            "Refresh token has expired"
        );
    }

    await authRepository.revokeRefreshToken(
        tokenHash
    );

    const user =
        await authRepository.findUserById(payload.sub);

    if (!user) {
        throw new AppError(
            "INVALID_TOKEN",
            401,
            "User no longer exists"
        );
    }

    return issueTokenPair(
        user.id,
        user.role
    );
}

export async function logout(
    refreshToken: string
): Promise<void> {
    const tokenHash =
        hashToken(refreshToken);

    await authRepository.revokeRefreshToken(
        tokenHash
    );
}