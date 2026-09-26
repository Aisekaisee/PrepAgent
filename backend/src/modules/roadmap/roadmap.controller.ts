import type { Request, Response } from "express";
import * as roadmapService from "./roadmap.service.js";
import type { ItemStatusInput } from "./roadmap.validation.js";

export async function generate(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // Ping every 15s to prevent proxy timeouts
  const pingInterval = setInterval(() => {
    res.write(": ping\n\n");
  }, 15_000);

  const cleanup = () => clearInterval(pingInterval);
  req.on("close", cleanup);

  const sendEvent = (data: object) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const roadmap = await roadmapService.generateRoadmap(userId, sendEvent);
    sendEvent({ type: "done", roadmap, source: "ai_generated" });
  } catch (err: any) {
    sendEvent({
      type: "error",
      code: err?.code ?? "INTERNAL_ERROR",
      message: err?.message ?? "Roadmap generation failed",
    });
  } finally {
    cleanup();
    res.end();
  }
}

export async function getActive(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const result = await roadmapService.getActiveRoadmap(userId);
  res.status(200).json({ ...result, source: "ai_generated" });
}

export async function getHistory(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const roadmaps = await roadmapService.getRoadmapHistory(userId, { page, limit });
  res.status(200).json({ data: roadmaps, page, limit });
}

export async function updateItem(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const { id } = req.params;
  const itemId = String(id);
  const { status } = req.body as ItemStatusInput;

  const item = await roadmapService.updateItemStatus(userId, itemId, status);
  res.status(200).json(item);
}
