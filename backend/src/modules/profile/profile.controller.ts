import type {
  Request,
  Response
} from "express";

import * as service
  from "./profile.service.js";

export async function get(
  req: Request,
  res: Response
) {
  const profile =
    await service.getProfile(
      req.user!.userId
    );

  return res.status(200).json({
    profile
  });
}

export async function update(
  req: Request,
  res: Response
) {
  const profile =
    await service.updateProfile(
      req.user!.userId,
      req.body
    );

  return res.status(200).json({
    profile
  });
}