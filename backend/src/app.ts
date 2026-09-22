import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";

import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error.middleware";
import { logger } from "./utils/logger";
import { authRouter } from "./modules/auth/auth.routes.js";
import {profileRouter} from "./modules/profile/profile.routes.js";

export const app = express();

app.use(helmet());

app.use(
  cors({
    origin: env.CORS_ORIGIN
  })
);

app.use(
  pinoHttp({
    logger
  })
);

app.use(express.json());

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 100
  })
);
app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "api is running"
  });
});

app.use(
  "/api/v1/auth",
  authRouter
);

app.use(
  "/api/v1/profile",
  profileRouter
);

app.use((_req, res) => {

  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "Route not found"
    }
  });
});


app.use(errorHandler);