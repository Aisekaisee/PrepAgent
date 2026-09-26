import type { Request, Response } from "express";
import * as resourcesRepo from "./resources.repository.js";
import type { ResourceFilterInput } from "./resources.validation.js";

export async function list(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as ResourceFilterInput;

  const { data, total } = await resourcesRepo.findResources({
    topic: query.topic,
    difficulty: query.difficulty,
    companyTag: query.company,
    page: query.page ?? 1,
    limit: query.limit ?? 20,
  });

  res.status(200).json({
    data,
    page: query.page ?? 1,
    limit: query.limit ?? 20,
    total,
  });
}
