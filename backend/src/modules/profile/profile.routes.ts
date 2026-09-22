import { Router } from "express";

import * as controller
  from "./profile.controller.js";

import {
  profileUpdateSchema
} from "./profile.validation.js";

import {
  authenticate
} from "../../middleware/auth.middleware.js";

import {
  validate
} from "../../middleware/validate.middleware.js";

export const profileRouter =
  Router();

profileRouter.get(
  "/",
  authenticate,
  controller.get
);

profileRouter.put(
  "/",
  authenticate,
  validate(profileUpdateSchema),
  controller.update
);