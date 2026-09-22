import { Router } from "express";

import * as controller
    from "./auth.controller.js";

import {
    registerSchema,
    loginSchema,
    refreshSchema
} from "./auth.validation.js";

import { validate }
    from "../../middleware/validate.middleware.js";

export const authRouter = Router();

authRouter.post(
    "/register",
    validate(registerSchema),
    controller.register
);

authRouter.post(
    "/login",
    validate(loginSchema),
    controller.login
);

authRouter.post(
    "/refresh",
    validate(refreshSchema),
    controller.refresh
);

authRouter.post(
    "/logout",
    validate(refreshSchema),
    controller.logout
);