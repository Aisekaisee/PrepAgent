import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { getGap } from "./skill-gap.controller.js";

export const skillGapRouter = Router();

skillGapRouter.get("/", authenticate, getGap);
