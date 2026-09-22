import { db } from "../../db/client.js";
import type {
    User,
    RefreshToken
} from "./auth.types.js";

export async function findUserByEmail(
    email: string
): Promise<User | null> {
    const result = await db.query(
        `
    SELECT
      id,
      email,
      password_hash,
      role,
      created_at
    FROM users
    WHERE email = $1
    LIMIT 1
    `,
        [email]
    );

    if (result.rows.length === 0) {
        return null;
    }

    const row = result.rows[0];

    return {
        id: row.id,
        email: row.email,
        passwordHash: row.password_hash,
        role: row.role,
        createdAt: row.created_at
    };
}

export async function createUser(
    email: string,
    passwordHash: string
): Promise<User> {
    const result = await db.query(
        `
    INSERT INTO users (
      email,
      password_hash
    )
    VALUES ($1, $2)
    RETURNING
      id,
      email,
      password_hash,
      role,
      created_at
    `,
        [email, passwordHash]
    );

    const row = result.rows[0];

    return {
        id: row.id,
        email: row.email,
        passwordHash: row.password_hash,
        role: row.role,
        createdAt: row.created_at
    };
}

export async function saveRefreshToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date
): Promise<RefreshToken> {
    const result = await db.query(
        `
    INSERT INTO refresh_tokens (
      user_id,
      token_hash,
      expires_at
    )
    VALUES ($1, $2, $3)
    RETURNING
      id,
      user_id,
      token_hash,
      expires_at,
      revoked_at
    `,
        [userId, tokenHash, expiresAt]
    );

    const row = result.rows[0];

    return {
        id: row.id,
        userId: row.user_id,
        tokenHash: row.token_hash,
        expiresAt: row.expires_at,
        revokedAt: row.revoked_at
    };
}

export async function findRefreshToken(
    tokenHash: string
): Promise<RefreshToken | null> {
    const result = await db.query(
        `
    SELECT
      id,
      user_id,
      token_hash,
      expires_at,
      revoked_at
    FROM refresh_tokens
    WHERE token_hash = $1
    LIMIT 1
    `,
        [tokenHash]
    );

    if (result.rows.length === 0) {
        return null;
    }

    const row = result.rows[0];

    return {
        id: row.id,
        userId: row.user_id,
        tokenHash: row.token_hash,
        expiresAt: row.expires_at,
        revokedAt: row.revoked_at
    };
}

export async function revokeRefreshToken(
    tokenHash: string
): Promise<void> {
    await db.query(
        `
    UPDATE refresh_tokens
    SET revoked_at = now()
    WHERE token_hash = $1
      AND revoked_at IS NULL
    `,
        [tokenHash]
    );
}

export async function revokeAllRefreshTokensForUser(
    userId: string
): Promise<void> {
    await db.query(
        `
    UPDATE refresh_tokens
    SET revoked_at = now()
    WHERE user_id = $1
      AND revoked_at IS NULL
    `,
        [userId]
    );
}

export async function findUserById(
    userId: string
): Promise<User | null> {
    const result = await db.query(
        `
    SELECT
      id,
      email,
      password_hash,
      role,
      created_at
    FROM users
    WHERE id = $1
    LIMIT 1
    `,
        [userId]
    );

    if (result.rows.length === 0) {
        return null;
    }

    const row = result.rows[0];

    return {
        id: row.id,
        email: row.email,
        passwordHash: row.password_hash,
        role: row.role,
        createdAt: row.created_at
    };
}