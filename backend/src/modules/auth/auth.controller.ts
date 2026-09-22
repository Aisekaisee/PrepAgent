import type {
    Request,
    Response
} from "express";

import * as authService
    from "./auth.service.js";

export async function register(
    req: Request,
    res: Response
) {
    const {
        email,
        password
    } = req.body;

    const tokens =
        await authService.register(
            email,
            password
        );

    return res.status(201).json(tokens);
}

export async function login(
    req: Request,
    res: Response
) {
    const {
        email,
        password
    } = req.body;

    const tokens =
        await authService.login(
            email,
            password
        );

    return res.status(200).json(tokens);
}

export async function refresh(
    req: Request,
    res: Response
) {
    const {
        refreshToken
    } = req.body;

    const tokens =
        await authService.refreshTokens(
            refreshToken
        );

    return res.status(200).json(tokens);
}

export async function logout(
    req: Request,
    res: Response
) {
    const {
        refreshToken
    } = req.body;

    await authService.logout(
        refreshToken
    );

    return res.status(204).send();
}