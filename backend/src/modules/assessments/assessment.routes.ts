import { Router } from "express";

import { authenticate } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { answerRateLimiter } from "../../middleware/rateLimiter.middleware.js";
import {
    startSessionSchema,
    answerSchema
} from "./assessment.validation.js";
import * as controller from "./assessment.controller.js";

export const assessmentRouter = Router();

assessmentRouter.post(
    "/",
    authenticate,
    validate(startSessionSchema),
    controller.start
);

assessmentRouter.get(
    "/history",
    authenticate,
    controller.history
);

assessmentRouter.get(
    "/:id/next-question",
    authenticate,
    controller.nextQuestion
);

assessmentRouter.post(
    "/:id/answer",
    authenticate,
    answerRateLimiter,
    validate(answerSchema),
    controller.answer
);

assessmentRouter.post(
    "/:id/submit",
    authenticate,
    controller.submit
);
