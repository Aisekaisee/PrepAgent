import type { Request, Response } from "express";
import { chatService } from "./chat.service.js";

export async function streamMessage(req: Request, res: Response): Promise<void> {
  const { message } = req.body || {};

  if (!message || typeof message !== "string") {
    res.status(400).json({ error: { message: "Field 'message' is required" } });
    return;
  }

  // Set SSE response headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const pingInterval = setInterval(() => {
    res.write(": ping\n\n");
  }, 15000);

  const cleanup = () => clearInterval(pingInterval);
  req.on("close", cleanup);

  try {
    const fullReply = await chatService.generateResponse(message);

    // Stream words with small delays for natural typing cadence
    const words = fullReply.split(" ");
    for (let i = 0; i < words.length; i++) {
      const token = (i > 0 ? " " : "") + words[i];
      res.write(`data: ${JSON.stringify({ type: "token", content: token })}\n\n`);
      await new Promise((resolve) => setTimeout(resolve, 15));
    }

    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
  } catch (err: any) {
    res.write(
      `data: ${JSON.stringify({
        type: "error",
        message: err?.message || "An error occurred while streaming response",
      })}\n\n`
    );
  } finally {
    cleanup();
    res.end();
  }
}

export async function getHistory(_req: Request, res: Response): Promise<void> {
  res.status(200).json({ messages: [] });
}
