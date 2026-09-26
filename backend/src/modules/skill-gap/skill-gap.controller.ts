import type { Request, Response } from "express";
import { computeGap } from "./skill-gap.service.js";

export async function getGap(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const result = await computeGap(userId);
  res.status(200).json(result);
}
