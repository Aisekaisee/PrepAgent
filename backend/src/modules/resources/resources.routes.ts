import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { resourceFilterSchema } from "./resources.validation.js";
import { list } from "./resources.controller.js";

export const resourcesRouter = Router();

resourcesRouter.get("/", authenticate, validate(resourceFilterSchema, "query"), list);
