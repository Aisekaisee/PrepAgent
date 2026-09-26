import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authenticate } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { itemStatusSchema } from "./roadmap.validation.js";
import * as roadmapController from "./roadmap.controller.js";

export const roadmapRouter = Router();

// 5 roadmap generations per hour per user
const generateRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  keyGenerator: (req) => req.user?.userId ?? req.ip ?? "unknown",
  validate: { keyGenerator: false },
  message: { error: { code: "RATE_LIMITED", message: "Maximum 5 roadmap generations per hour" } },
});

roadmapRouter.post("/generate", authenticate, generateRateLimit, roadmapController.generate);
roadmapRouter.get("/", authenticate, roadmapController.getActive);
roadmapRouter.get("/history", authenticate, roadmapController.getHistory);
roadmapRouter.patch("/items/:id", authenticate, validate(itemStatusSchema), roadmapController.updateItem);
