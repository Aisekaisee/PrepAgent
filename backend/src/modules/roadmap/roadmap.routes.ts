import { Router } from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { authenticate } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { itemStatusSchema } from "./roadmap.validation.js";
import * as roadmapController from "./roadmap.controller.js";

import { env } from "../../config/env.js";

export const roadmapRouter = Router();

// Generation rate limit: 100/hr in dev, 5/hr in prod
const generateRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: env.NODE_ENV === "development" ? 100 : 5,
  keyGenerator: (req) => req.user?.userId ?? (req.ip ? ipKeyGenerator(req.ip) : "unknown"),
  message: { error: { code: "RATE_LIMITED", message: "Maximum roadmap generations exceeded. Please try again later." } },
});

roadmapRouter.post("/generate", authenticate, generateRateLimit, roadmapController.generate);
roadmapRouter.get("/", authenticate, roadmapController.getActive);
roadmapRouter.get("/history", authenticate, roadmapController.getHistory);
roadmapRouter.patch("/items/:id", authenticate, validate(itemStatusSchema), roadmapController.updateItem);
