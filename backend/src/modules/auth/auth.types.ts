export interface User {
    id: string;
    email: string;
    passwordHash: string;
    role: "student" | "admin";
    createdAt: Date;
}

export interface RefreshToken {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    revokedAt: Date | null;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}