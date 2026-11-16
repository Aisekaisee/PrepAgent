import { Router } from "express";
import { streamMessage, getHistory } from "./chat.controller.js";

export const chatRouter = Router();

chatRouter.post("/message", streamMessage);
chatRouter.get("/history", getHistory);
